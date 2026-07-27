"""Idempotent database seed.

Creates the schema, the initial admin account and the initial bilingual
(EN/FR) site content. Safe to run multiple times: existing content is never
overwritten, so edits made through the admin dashboard survive restarts and
redeployments.

When the schema is out of date and the automatic reset runs, the admin
account (credentials changed through the UI) and the contact-message inbox
are preserved across the reset.

Run with:  python -m app.seed
Reset with (drops ALL data): python -m app.reset
"""
from datetime import datetime

from sqlalchemy import JSON, inspect, text

from .config import get_settings
from .database import Base, SessionLocal, engine
from .models import (
    AdminUser,
    ContactMessage,
    Experience,
    PageView,
    Project,
    SiteSettings,
    StackItem,
    ValueProp,
)
from .security import hash_password


def schema_matches() -> bool:
    """True when the database matches the models.

    Detects missing tables/columns AND columns whose model type is JSON but
    whose database type is not (e.g. a text column migrated to i18n JSON).
    """
    inspector = inspect(engine)
    for table in Base.metadata.sorted_tables:
        if not inspector.has_table(table.name):
            continue  # create_all will create it
        existing = {column["name"]: column for column in inspector.get_columns(table.name)}
        for column in table.columns:
            if column.name not in existing:
                return False
            model_is_json = isinstance(column.type, JSON)
            db_is_json = "JSON" in str(existing[column.name]["type"]).upper()
            if model_is_json and not db_is_json:
                return False
    return True


def _snapshot_preserved_data() -> dict:
    """Best-effort snapshot of the admin account and inbox before a reset.

    Uses raw SQL so it works against an outdated schema; anything that cannot
    be read is simply skipped.
    """
    preserved = {"admins": [], "messages": [], "page_views": []}
    inspector = inspect(engine)
    with engine.connect() as conn:
        if inspector.has_table("admin_users"):
            try:
                rows = conn.execute(
                    text("SELECT email, hashed_password FROM admin_users")
                ).fetchall()
                preserved["admins"] = [dict(row._mapping) for row in rows]
            except Exception:
                pass
        if inspector.has_table("contact_messages"):
            for query in (
                "SELECT name, email, subject, body, language, created_at, read FROM contact_messages",
                "SELECT name, email, subject, body, created_at, read FROM contact_messages",
            ):
                try:
                    rows = conn.execute(text(query)).fetchall()
                    preserved["messages"] = [dict(row._mapping) for row in rows]
                    break
                except Exception:
                    continue
        if inspector.has_table("page_views"):
            # Column intersection so analytics survive schema evolution:
            # columns the old table lacks are filled with model defaults.
            try:
                old_cols = {c["name"] for c in inspector.get_columns("page_views")}
                model_cols = [
                    c.name for c in PageView.__table__.columns
                    if c.name in old_cols and c.name != "id"
                ]
                rows = conn.execute(
                    text(f"SELECT {', '.join(model_cols)} FROM page_views")
                ).fetchall()
                preserved["page_views"] = [dict(row._mapping) for row in rows]
            except Exception:
                pass
    return preserved


def _restore_preserved_data(db, preserved: dict) -> None:
    if preserved["admins"]:
        db.query(AdminUser).delete()
        for admin in preserved["admins"]:
            db.add(AdminUser(email=admin["email"], hashed_password=admin["hashed_password"]))
        print(f"Preserved {len(preserved['admins'])} admin account(s) across the reset.")
    if preserved["messages"]:
        for message in preserved["messages"]:
            created_at = message.get("created_at")
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at)
            db.add(
                ContactMessage(
                    name=message["name"],
                    email=message["email"],
                    subject=message.get("subject") or "",
                    body=message["body"],
                    language=message.get("language") or "en",
                    created_at=created_at,
                    read=bool(message.get("read")),
                )
            )
        print(f"Preserved {len(preserved['messages'])} contact message(s) across the reset.")
    if preserved.get("page_views"):
        for view in preserved["page_views"]:
            created_at = view.get("created_at")
            if isinstance(created_at, str):
                created_at = datetime.fromisoformat(created_at)
            db.add(
                PageView(
                    path=view.get("path") or "/",
                    language=view.get("language") or "en",
                    visitor=view.get("visitor") or "",
                    country=view.get("country") or "",
                    browser=view.get("browser") or "",
                    os=view.get("os") or "",
                    device=view.get("device") or "",
                    referrer=view.get("referrer") or "",
                    created_at=created_at,
                )
            )
        print(f"Preserved {len(preserved['page_views'])} page view(s) across the reset.")
    # Make restored rows visible to the existence checks below (autoflush is off)
    db.flush()


def seed() -> None:
    settings = get_settings()
    preserved = {"admins": [], "messages": [], "page_views": []}

    if not schema_matches():
        if settings.reset_on_schema_mismatch:
            print(
                "WARNING: database schema is out of date — dropping all tables "
                "and re-seeding (disable with RESET_ON_SCHEMA_MISMATCH=false). "
                "Admin account, contact messages and analytics will be preserved."
            )
            preserved = _snapshot_preserved_data()
            Base.metadata.drop_all(bind=engine)
        else:
            print(
                "ERROR: database schema is out of date. Run `python -m app.reset` "
                "or set RESET_ON_SCHEMA_MISMATCH=true to reset automatically."
            )
            raise SystemExit(1)

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _restore_preserved_data(db, preserved)

        if not db.query(AdminUser).first():
            db.add(
                AdminUser(
                    email=settings.admin_email,
                    hashed_password=hash_password(settings.admin_password),
                )
            )

        # One-time normalization: the "Download CV" feature is toggled off by
        # emptying cv_url. Only overwrite the untouched seed defaults so a
        # custom path set in the admin is respected.
        existing_settings = db.query(SiteSettings).first()
        if existing_settings and existing_settings.cv_url == {
            "en": "/assets/cv/CV_EN.pdf",
            "fr": "/assets/cv/CV_FR.pdf",
        }:
            existing_settings.cv_url = {"en": "", "fr": ""}
            print("Cleared default CV paths — Download CV buttons hidden.")

        if not db.query(SiteSettings).first():
            db.add(
                SiteSettings(
                    full_name="Yeo Yedjande",
                    headline={
                        "en": "Senior Full Stack Developer",
                        "fr": "Développeur Full Stack Senior",
                    },
                    tagline={
                        "en": "I build secure, scalable and business-oriented platforms for enterprise environments.",
                        "fr": "Je conçois des plateformes sécurisées, évolutives et orientées métier pour les environnements d'entreprise.",
                    },
                    hero_subtitle={
                        "en": "Focused on Angular, Python/FastAPI, PostgreSQL, Docker and Keycloak — with a strong footing in data engineering and AI integration.",
                        "fr": "Spécialisé en Angular, Python/FastAPI, PostgreSQL, Docker et Keycloak — avec une solide pratique du data engineering et de l'intégration d'IA.",
                    },
                    availability={
                        "en": "Available for international opportunities",
                        "fr": "Disponible pour des opportunités internationales",
                    },
                    impacts={
                        "en": [
                            "8+ years of experience",
                            "10+ applications shipped",
                            "Telecom, fintech & NGO sectors",
                            "Available for relocation",
                        ],
                        "fr": [
                            "8+ ans d'expérience",
                            "10+ applications livrées",
                            "Télécoms, fintech & ONG",
                            "Mobilité internationale",
                        ],
                    },
                    about_title={
                        "en": "Software that helps teams operate reliably",
                        "fr": "Des logiciels qui aident les équipes à opérer sereinement",
                    },
                    about_paragraphs={
                        "en": [
                            "I'm a senior full stack developer based in Abidjan, Côte d'Ivoire, currently working on data & AI projects at a major telecom operator. Over 8+ years I have designed and shipped business applications, secure APIs, dashboards and integration layers for the telecom, finance and non-profit sectors.",
                            "I enjoy working at the intersection of frontend, backend, data and business processes — turning complex requirements into useful and maintainable software.",
                        ],
                        "fr": [
                            "Je suis développeur full stack senior basé à Abidjan, en Côte d'Ivoire, et je travaille actuellement sur des projets data & IA chez un grand opérateur télécom. En plus de 8 ans, j'ai conçu et livré des applications métier, des APIs sécurisées, des tableaux de bord et des couches d'intégration pour les secteurs des télécoms, de la finance et des ONG.",
                            "J'aime travailler à l'intersection du frontend, du backend, de la donnée et des processus métier — transformer des besoins complexes en logiciels utiles et maintenables.",
                        ],
                    },
                    principles={
                        "en": [
                            "Understand the business context",
                            "Design maintainable systems",
                            "Build secure APIs",
                            "Deliver reliable software",
                        ],
                        "fr": [
                            "Comprendre le contexte métier",
                            "Concevoir des systèmes maintenables",
                            "Construire des APIs sécurisées",
                            "Livrer des logiciels fiables",
                        ],
                    },
                    email="yeoyedjande@gmail.com",
                    phone="+225 07 475 504 17",
                    linkedin_url="https://www.linkedin.com/in/yeoyedjande/",
                    github_url="https://github.com/yeoyedjande",
                    # Empty = the "Download CV" buttons are hidden site-wide.
                    # Set paths (e.g. /assets/cv/CV_EN.pdf) in the admin to re-enable.
                    cv_url={"en": "", "fr": ""},
                    contact_lead={
                        "en": "I'm open to senior full stack roles, remote opportunities and relocation in Canada, France, Belgium, Luxembourg, Switzerland and Germany.",
                        "fr": "Je suis ouvert aux postes full stack senior, aux opportunités en télétravail et à la relocalisation au Canada, en France, en Belgique, au Luxembourg, en Suisse et en Allemagne.",
                    },
                )
            )

        if not db.query(StackItem).first():
            stack = [
                ({"en": "Frontend", "fr": "Frontend"},
                 ["Angular", "React", "TypeScript", "JavaScript", "PrimeNG", "Bootstrap"]),
                ({"en": "Backend", "fr": "Backend"},
                 ["Python", "FastAPI", "Java", "Spring Boot", "PHP", "Laravel", "Node.js", "REST APIs"]),
                ({"en": "Data & AI", "fr": "Data & IA"},
                 ["PostgreSQL", "MySQL", "SQL", "Starburst / Trino", "Highcharts", "Prompt Engineering"]),
                ({"en": "DevOps & Quality", "fr": "DevOps & Qualité"},
                 ["Docker", "GitLab CI/CD", "Jenkins", "Git", "Linux", "SonarQube", "Playwright"]),
                ({"en": "Security", "fr": "Sécurité"},
                 ["Keycloak", "JWT", "OAuth2", "OpenID Connect"]),
            ]
            order = 0
            for category, items in stack:
                for name in items:
                    order += 1
                    db.add(StackItem(category=category, name=name, sort_order=order))

        if not db.query(Project).first():
            db.add_all(
                [
                    Project(
                        slug="enterprise-payment-platform",
                        visual="payments",
                        title={
                            "en": "Enterprise Payment Platform",
                            "fr": "Plateforme de paiement d'entreprise",
                        },
                        role={"en": "Full Stack Developer", "fr": "Développeur Full Stack"},
                        summary={
                            "en": "A secure prepaid payment management platform integrated with enterprise systems.",
                            "fr": "Une plateforme sécurisée de gestion de paiements prépayés, intégrée aux systèmes de l'entreprise.",
                        },
                        highlights={
                            "en": [
                                "Built secure API-driven workflows",
                                "Integrated identity and access management",
                                "Supported deployment-ready architecture",
                            ],
                            "fr": [
                                "Développement de workflows sécurisés pilotés par API",
                                "Intégration de la gestion des identités et des accès",
                                "Contribution à une architecture prête au déploiement",
                            ],
                        },
                        context={
                            "en": "A large organization needed to manage prepaid payment products across several business systems, with strict security and traceability requirements.",
                            "fr": "Une grande organisation devait gérer des produits de paiement prépayés à travers plusieurs systèmes métier, avec des exigences strictes de sécurité et de traçabilité.",
                        },
                        problem={
                            "en": "Payment operations were spread across disconnected tools, making secure automation, auditability and role-based access difficult to guarantee.",
                            "fr": "Les opérations de paiement étaient réparties sur des outils déconnectés, rendant difficile de garantir l'automatisation sécurisée, l'auditabilité et le contrôle d'accès par rôle.",
                        },
                        approach={
                            "en": "I worked across the stack: an Angular frontend for business users, FastAPI services exposing secure REST APIs, PostgreSQL for transactional data, Keycloak for authentication and authorization, and Docker for deployment-ready packaging. I collaborated closely with business and security teams throughout.",
                            "fr": "J'ai travaillé sur l'ensemble de la stack : un frontend Angular pour les utilisateurs métier, des services FastAPI exposant des APIs REST sécurisées, PostgreSQL pour les données transactionnelles, Keycloak pour l'authentification et les autorisations, et Docker pour un packaging prêt au déploiement. J'ai collaboré étroitement avec les équipes métier et sécurité.",
                        },
                        contributions={
                            "en": [
                                "Designed and consumed secure REST APIs across payment workflows",
                                "Integrated Keycloak-based authentication and role-based authorization",
                                "Modeled transactional data and audit trails in PostgreSQL",
                                "Prepared the containerized architecture for deployment",
                            ],
                            "fr": [
                                "Conception et consommation d'APIs REST sécurisées sur les workflows de paiement",
                                "Intégration de l'authentification Keycloak et des autorisations par rôle",
                                "Modélisation des données transactionnelles et des pistes d'audit dans PostgreSQL",
                                "Préparation de l'architecture conteneurisée pour le déploiement",
                            ],
                        },
                        learnings={
                            "en": "Payment systems demand a security-first mindset: every workflow was designed around access control, validation and auditability — a discipline I now apply to every API I build.",
                            "fr": "Les systèmes de paiement exigent une approche « sécurité d'abord » : chaque workflow a été conçu autour du contrôle d'accès, de la validation et de l'auditabilité — une discipline que j'applique désormais à chaque API que je construis.",
                        },
                        tags=["Angular", "FastAPI", "PostgreSQL", "Docker", "Keycloak", "REST APIs"],
                        sort_order=1,
                    ),
                    Project(
                        slug="observability-monitoring-platform",
                        visual="monitoring",
                        title={
                            "en": "Observability & Monitoring Platform",
                            "fr": "Plateforme d'observabilité et de monitoring",
                        },
                        role={"en": "Full Stack Developer", "fr": "Développeur Full Stack"},
                        summary={
                            "en": "An internal dashboard for monitoring data sources, KPIs, anomalies and audit trails.",
                            "fr": "Un tableau de bord interne pour surveiller les sources de données, les KPIs, les anomalies et les journaux d'audit.",
                        },
                        highlights={
                            "en": [
                                "Built operational dashboards",
                                "Implemented filtering, exports and audit views",
                                "Improved visibility on data quality issues",
                            ],
                            "fr": [
                                "Développement de tableaux de bord opérationnels",
                                "Mise en place des filtres, exports et vues d'audit",
                                "Meilleure visibilité sur les problèmes de qualité de données",
                            ],
                        },
                        context={
                            "en": "Operations teams in a large organization lacked a consolidated view of the health and quality of their data sources.",
                            "fr": "Les équipes opérationnelles d'une grande organisation manquaient d'une vue consolidée sur la santé et la qualité de leurs sources de données.",
                        },
                        problem={
                            "en": "Data issues were discovered late and investigated manually, without shared KPIs, alerts or an audit history to rely on.",
                            "fr": "Les problèmes de données étaient découverts tardivement et investigués manuellement, sans KPIs partagés, sans alertes et sans historique d'audit fiable.",
                        },
                        approach={
                            "en": "I built dashboard views with Angular and Highcharts on top of Python services and PostgreSQL: KPI visualizations, anomaly listings, advanced filtering, pagination, exports and audit views designed for daily operational use.",
                            "fr": "J'ai construit des vues de tableau de bord avec Angular et Highcharts, appuyées sur des services Python et PostgreSQL : visualisations de KPIs, listes d'anomalies, filtres avancés, pagination, exports et vues d'audit conçus pour un usage opérationnel quotidien.",
                        },
                        contributions={
                            "en": [
                                "Built data visualization components and operational dashboards",
                                "Implemented filtering, pagination, exports and audit views",
                                "Worked with operations teams to match real investigation workflows",
                            ],
                            "fr": [
                                "Développement des composants de visualisation et des tableaux de bord opérationnels",
                                "Implémentation des filtres, de la pagination, des exports et des vues d'audit",
                                "Travail avec les équipes opérationnelles pour coller aux workflows réels d'investigation",
                            ],
                        },
                        learnings={
                            "en": "Good observability tooling is about the users' investigation flow, not charts: the value came from filters, exports and audit trails that matched how teams actually work.",
                            "fr": "Un bon outil d'observabilité se conçoit autour du flux d'investigation des utilisateurs, pas des graphiques : la valeur est venue des filtres, exports et pistes d'audit qui collaient à la façon réelle de travailler des équipes.",
                        },
                        tags=["Angular", "Python", "PostgreSQL", "Highcharts", "REST APIs"],
                        sort_order=2,
                    ),
                    Project(
                        slug="hopefund-microfinance-platform",
                        visual="bank",
                        title={
                            "en": "HOPEFUND — Microfinance Banking Platform",
                            "fr": "HOPEFUND — Plateforme bancaire de microfinance",
                        },
                        role={"en": "Architect & Full Stack Developer", "fr": "Architecte & Développeur Full Stack"},
                        summary={
                            "en": "A complete banking platform digitalizing the operations of a microfinance institution in Burundi.",
                            "fr": "Une plateforme bancaire complète digitalisant les opérations d'une institution de microfinance au Burundi.",
                        },
                        highlights={
                            "en": [
                                "Designed the architecture across 10+ business modules",
                                "Covered accounts, loans, cards, transfers and agency network",
                                "Fully digitalized the institution's daily operations",
                            ],
                            "fr": [
                                "Conception de l'architecture sur plus de 10 modules métiers",
                                "Couverture des comptes, prêts, cartes, virements et réseau d'agences",
                                "Digitalisation complète des opérations quotidiennes de l'institution",
                            ],
                        },
                        context={
                            "en": "A microfinance institution in Burundi needed to digitalize its entire operations, previously managed with manual processes and disconnected tools.",
                            "fr": "Une institution de microfinance au Burundi devait digitaliser l'ensemble de ses opérations, jusque-là gérées avec des processus manuels et des outils déconnectés.",
                        },
                        problem={
                            "en": "Client accounts, loans, bank cards, withdrawals, deposits, transfers and the agency network all had to live in one coherent, auditable system — with the reliability banking operations demand.",
                            "fr": "Comptes clients, prêts, cartes bancaires, retraits, versements, virements et réseau d'agences devaient cohabiter dans un système cohérent et auditable — avec la fiabilité qu'exigent des opérations bancaires.",
                        },
                        approach={
                            "en": "I designed the platform architecture and led its full stack development with Angular, Laravel and MySQL: a modular design where each business domain is a dedicated module sharing a common transaction and audit core, with full operation history.",
                            "fr": "J'ai conçu l'architecture de la plateforme et mené son développement full stack avec Angular, Laravel et MySQL : une conception modulaire où chaque domaine métier est un module dédié partageant un socle commun de transactions et d'audit, avec historique complet des opérations.",
                        },
                        contributions={
                            "en": [
                                "Designed the overall architecture covering 10+ business modules",
                                "Built client accounts, loans, cards, withdrawals, deposits and transfers",
                                "Modeled the agency network and full operation history",
                                "Delivered the complete digitalization of the institution's operations",
                            ],
                            "fr": [
                                "Conception de l'architecture globale couvrant plus de 10 modules métiers",
                                "Développement des comptes clients, prêts, cartes, retraits, versements et virements",
                                "Modélisation du réseau d'agences et de l'historique complet des opérations",
                                "Livraison de la digitalisation complète des opérations de l'institution",
                            ],
                        },
                        learnings={
                            "en": "Banking systems taught me to design for auditability and failure: every operation must be traceable, reversible and consistent — principles I now apply to every enterprise platform I build.",
                            "fr": "Les systèmes bancaires m'ont appris à concevoir pour l'auditabilité et la panne : chaque opération doit être traçable, réversible et cohérente — des principes que j'applique désormais à chaque plateforme d'entreprise.",
                        },
                        tags=["Angular", "Laravel", "MySQL", "REST APIs"],
                        sort_order=3,
                    ),
                    Project(
                        slug="gisabo-money-transfer",
                        visual="transfer",
                        title={
                            "en": "GISABO — International Money Transfer",
                            "fr": "GISABO — Transfert d'argent international",
                        },
                        role={"en": "Full Stack & Mobile Developer", "fr": "Développeur Full Stack & Mobile"},
                        summary={
                            "en": "A web and mobile platform for sending money from abroad to Burundi, including mobile transfers and a marketplace.",
                            "fr": "Une plateforme web et mobile d'envoi d'argent de l'étranger vers le Burundi, incluant les transferts mobiles et une marketplace.",
                        },
                        highlights={
                            "en": [
                                "Built the full web platform and mobile apps (Android & iOS)",
                                "Implemented international and mobile money transfers",
                                "Delivered an integrated cross-border marketplace",
                            ],
                            "fr": [
                                "Développement complet de la plateforme web et des apps mobiles (Android & iOS)",
                                "Implémentation des transferts internationaux et mobiles",
                                "Livraison d'une marketplace transfrontalière intégrée",
                            ],
                        },
                        context={
                            "en": "The Burundian diaspora needed a reliable way to send money and goods home from Canada and elsewhere — gisabogroup.ca serves exactly that need.",
                            "fr": "La diaspora burundaise avait besoin d'un moyen fiable d'envoyer de l'argent et des biens depuis le Canada et ailleurs — gisabogroup.ca répond exactement à ce besoin.",
                        },
                        problem={
                            "en": "Cross-border money movement combines strict correctness requirements with a consumer-grade experience across web, Android and iOS, including mobile money on the receiving side.",
                            "fr": "Le transfert d'argent transfrontalier combine des exigences strictes de justesse avec une expérience grand public sur web, Android et iOS, y compris le mobile money côté réception.",
                        },
                        approach={
                            "en": "I developed the full platform: a React web application backed by PostgreSQL and REST APIs, and the Android and iOS applications — covering transfers, mobile-money delivery and marketplace purchases end to end.",
                            "fr": "J'ai développé la plateforme complète : une application web React appuyée sur PostgreSQL et des APIs REST, ainsi que les applications Android et iOS — couvrant transferts, remise en mobile money et achats marketplace de bout en bout.",
                        },
                        contributions={
                            "en": [
                                "Developed the React web platform and the REST API layer",
                                "Built and shipped the Android and iOS applications",
                                "Implemented transfer flows including mobile money delivery",
                                "Added marketplace purchases toward Burundi",
                            ],
                            "fr": [
                                "Développement de la plateforme web React et de la couche d'APIs REST",
                                "Construction et publication des applications Android et iOS",
                                "Implémentation des flux de transfert, y compris la remise en mobile money",
                                "Ajout des achats marketplace vers le Burundi",
                            ],
                        },
                        learnings={
                            "en": "Shipping a consumer fintech product end to end — web, mobile and APIs — taught me to balance strict transactional correctness with a simple experience for non-technical users.",
                            "fr": "Livrer un produit fintech grand public de bout en bout — web, mobile et APIs — m'a appris à concilier justesse transactionnelle stricte et expérience simple pour des utilisateurs non techniques.",
                        },
                        tags=["React", "PostgreSQL", "REST APIs", "Android", "iOS"],
                        sort_order=4,
                    ),
                    Project(
                        slug="odoo-business-process-automation",
                        visual="integration",
                        title={
                            "en": "Business Process Automation — Odoo Integration",
                            "fr": "Automatisation de processus métier — Intégration Odoo",
                        },
                        role={
                            "en": "API Designer / Full Stack Developer",
                            "fr": "Concepteur d'API / Développeur Full Stack",
                        },
                        summary={
                            "en": "API design for connecting business payment workflows with Odoo modules.",
                            "fr": "Conception d'API pour connecter des workflows de paiement métier aux modules Odoo.",
                        },
                        highlights={
                            "en": [
                                "Designed integration flows",
                                "Structured payment business rules",
                                "Prepared enterprise API logic",
                            ],
                            "fr": [
                                "Conception des flux d'intégration",
                                "Structuration des règles métier de paiement",
                                "Préparation de la logique d'API d'entreprise",
                            ],
                        },
                        context={
                            "en": "Payment workflows had to be connected to the organization's Odoo ERP so that business operations and accounting stayed in sync.",
                            "fr": "Les workflows de paiement devaient être connectés à l'ERP Odoo de l'organisation afin que les opérations métier et la comptabilité restent synchronisées.",
                        },
                        problem={
                            "en": "Business rules lived in people's heads and spreadsheets; the integration needed clean API contracts and explicit, enforceable payment processes.",
                            "fr": "Les règles métier vivaient dans les têtes et les tableurs ; l'intégration nécessitait des contrats d'API propres et des processus de paiement explicites et applicables.",
                        },
                        approach={
                            "en": "I designed the API flows between the frontend, FastAPI services and Odoo modules, structured the business rules into explicit states and transitions, and prepared the integration logic for enterprise-scale workflows on PostgreSQL.",
                            "fr": "J'ai conçu les flux d'API entre le frontend, les services FastAPI et les modules Odoo, structuré les règles métier en états et transitions explicites, et préparé la logique d'intégration pour des workflows à l'échelle de l'entreprise sur PostgreSQL.",
                        },
                        contributions={
                            "en": [
                                "Designed API contracts between frontend, backend and Odoo",
                                "Structured payment business rules into explicit workflows",
                                "Prepared integration logic for enterprise processes",
                            ],
                            "fr": [
                                "Conception des contrats d'API entre frontend, backend et Odoo",
                                "Structuration des règles métier de paiement en workflows explicites",
                                "Préparation de la logique d'intégration pour les processus d'entreprise",
                            ],
                        },
                        learnings={
                            "en": "ERP integrations succeed on process clarity: formalizing implicit business rules into API contracts was as valuable to the organization as the code itself.",
                            "fr": "Une intégration ERP réussit par la clarté des processus : formaliser des règles métier implicites en contrats d'API a autant apporté à l'organisation que le code lui-même.",
                        },
                        tags=["Python", "FastAPI", "Odoo", "PostgreSQL", "REST APIs"],
                        sort_order=5,
                    ),
                ]
            )

        if not db.query(Experience).first():
            db.add_all(
                [
                    Experience(
                        title={
                            "en": "Senior Full Stack Developer — Data Engineering & AI",
                            "fr": "Développeur Full Stack Sénior — Data Engineering & IA",
                        },
                        organization={"en": "Orange Côte d'Ivoire, Abidjan", "fr": "Orange Côte d'Ivoire, Abidjan"},
                        period={"en": "Aug 2025 — present", "fr": "Août 2025 — aujourd'hui"},
                        bullets={
                            "en": [
                                "Built the data-source observability module: analytical dashboards over high-volume sources for KPI tracking and data quality monitoring",
                                "Designed the architecture of a commission-calculation platform, removing a recurring manual process",
                                "Developed autonomous data loading in the back office, ending monthly file exchanges by email",
                                "Built a full audit-trail module and contributed to secured, containerized production deployments (Docker, CI/CD)",
                            ],
                            "fr": [
                                "Conception du module d'observabilité des sources de données : tableaux de bord analytiques sur des sources à fort volume pour le suivi des KPI et de la qualité des données",
                                "Architecture d'une plateforme de calcul automatisé des commissions, supprimant un traitement manuel récurrent",
                                "Développement du chargement autonome des données dans le back-office, mettant fin aux échanges mensuels de fichiers par e-mail",
                                "Développement du module de piste d'audit et contribution aux mises en production sécurisées et conteneurisées (Docker, CI/CD)",
                            ],
                        },
                        sort_order=1,
                    ),
                    Experience(
                        title={
                            "en": "Senior Full Stack Developer",
                            "fr": "Développeur Full Stack Sénior",
                        },
                        organization={"en": "Markel Technology · clients in Canada, Burundi & Côte d'Ivoire", "fr": "Markel Technology · clients au Canada, au Burundi et en Côte d'Ivoire"},
                        period={"en": "2017 — Jul 2025", "fr": "2017 — juillet 2025"},
                        bullets={
                            "en": [
                                "Designed and architected HOPEFUND, a microfinance banking platform covering 10+ business modules",
                                "Built GISABO (gisabogroup.ca), a web and mobile international money-transfer platform",
                                "Delivered INTERHUMAN, a recruitment platform with a published Android application",
                                "Shipped institutional websites and e-services for organizations in Canada and Burundi",
                            ],
                            "fr": [
                                "Conception et architecture de HOPEFUND, plateforme bancaire de microfinance couvrant plus de 10 modules métiers",
                                "Développement de GISABO (gisabogroup.ca), plateforme web et mobile de transfert d'argent international",
                                "Livraison d'INTERHUMAN, plateforme de recrutement avec application Android publiée",
                                "Réalisation de sites institutionnels et e-services pour des organisations au Canada et au Burundi",
                            ],
                        },
                        sort_order=2,
                    ),
                    Experience(
                        title={
                            "en": "Web Developer",
                            "fr": "Développeur Web",
                        },
                        organization={"en": "Soutra Vision & Ministry of Higher Education (MESRS), Abidjan", "fr": "Soutra Vision & Ministère de l'Enseignement Supérieur (MESRS), Abidjan"},
                        period={"en": "2015 — 2017", "fr": "2015 — 2017"},
                        bullets={
                            "en": [
                                "Built the national 'Génies de l'Éducation Numérique' competition platform for the MESRS",
                                "Developed examensbts.net, processing national BTS exam results in Côte d'Ivoire",
                                "Administered and evolved soutravision.com",
                            ],
                            "fr": [
                                "Réalisation de la plateforme du concours national des Génies de l'Éducation Numérique pour le MESRS",
                                "Développement d'examensbts.net pour le traitement des résultats de l'examen BTS en Côte d'Ivoire",
                                "Administration et évolution du site soutravision.com",
                            ],
                        },
                        sort_order=3,
                    ),
                ]
            )

        if not db.query(ValueProp).first():
            db.add_all(
                [
                    ValueProp(
                        title={"en": "Business-oriented developer", "fr": "Développeur orienté métier"},
                        description={
                            "en": "I build software to solve operational problems — every feature maps to a business need.",
                            "fr": "Je développe pour résoudre des problèmes opérationnels — chaque fonctionnalité répond à un besoin métier.",
                        },
                        sort_order=1,
                    ),
                    ValueProp(
                        title={"en": "Full stack ownership", "fr": "Maîtrise full stack"},
                        description={
                            "en": "Comfortable across frontend, backend, databases and deployment — from design to production.",
                            "fr": "À l'aise du frontend au backend, bases de données et déploiement — de la conception à la production.",
                        },
                        sort_order=2,
                    ),
                    ValueProp(
                        title={"en": "Secure API mindset", "fr": "Culture d'API sécurisées"},
                        description={
                            "en": "Authentication, authorization, validation and auditability designed in from the start.",
                            "fr": "Authentification, autorisations, validation et auditabilité pensées dès le départ.",
                        },
                        sort_order=3,
                    ),
                    ValueProp(
                        title={"en": "Reliable delivery", "fr": "Livraison fiable"},
                        description={
                            "en": "Clear communication, documented work and respected commitments.",
                            "fr": "Communication claire, travail documenté et engagements tenus.",
                        },
                        sort_order=4,
                    ),
                    ValueProp(
                        title={"en": "Adaptable in enterprise environments", "fr": "Adaptable en environnement d'entreprise"},
                        description={
                            "en": "Delivery across telecom, fintech and NGO sectors: real constraints, real users, real production.",
                            "fr": "Des livraisons dans les télécoms, la fintech et les ONG : vraies contraintes, vrais utilisateurs, vraie production.",
                        },
                        sort_order=5,
                    ),
                    ValueProp(
                        title={"en": "International opportunity ready", "fr": "Prêt pour l'international"},
                        description={
                            "en": "Working in French and English, open to remote collaboration and relocation.",
                            "fr": "Travaille en français et en anglais, ouvert au télétravail et à la relocalisation.",
                        },
                        sort_order=6,
                    ),
                ]
            )

        db.commit()
        print("Seed completed.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
