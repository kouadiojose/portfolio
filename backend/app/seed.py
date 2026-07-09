"""Idempotent database seed.

Creates the schema, the initial admin account and the initial bilingual
(EN/FR) site content. Safe to run multiple times: existing content is never
overwritten, so edits made through the admin dashboard survive restarts and
redeployments.

Run with:  python -m app.seed
Reset with (drops ALL data): python -m app.reset
"""
from .config import get_settings
from .database import Base, SessionLocal, engine
from .models import (
    AdminUser,
    Experience,
    Project,
    SiteSettings,
    StackItem,
    ValueProp,
)
from .security import hash_password


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    settings = get_settings()
    db = SessionLocal()
    try:
        if not db.query(AdminUser).first():
            db.add(
                AdminUser(
                    email=settings.admin_email,
                    hashed_password=hash_password(settings.admin_password),
                )
            )

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
                        "en": "Full stack developer focused on Angular, Python/FastAPI, PostgreSQL, Docker, Keycloak and API integrations.",
                        "fr": "Développeur full stack spécialisé en Angular, Python/FastAPI, PostgreSQL, Docker, Keycloak et intégrations d'API.",
                    },
                    availability={
                        "en": "Available for international opportunities",
                        "fr": "Disponible pour des opportunités internationales",
                    },
                    impacts={
                        "en": [
                            "8+ years of experience",
                            "Enterprise applications",
                            "Secure API integrations",
                            "Available for relocation",
                        ],
                        "fr": [
                            "8+ ans d'expérience",
                            "Applications d'entreprise",
                            "Intégrations d'API sécurisées",
                            "Mobilité internationale",
                        ],
                    },
                    about_title={
                        "en": "Software that helps teams operate reliably",
                        "fr": "Des logiciels qui aident les équipes à opérer sereinement",
                    },
                    about_paragraphs={
                        "en": [
                            "I'm a full stack developer based in Côte d'Ivoire, currently working as an IT Consultant in enterprise environments. I design and build business applications, secure APIs, dashboards and integration layers that help teams operate more reliably.",
                            "I enjoy working at the intersection of frontend, backend, data and business processes — turning complex requirements into useful and maintainable software.",
                        ],
                        "fr": [
                            "Je suis développeur full stack basé en Côte d'Ivoire, actuellement consultant IT dans des environnements d'entreprise. Je conçois et développe des applications métier, des APIs sécurisées, des tableaux de bord et des couches d'intégration qui aident les équipes à opérer plus sereinement.",
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
                    email="kouadiojose@gmail.com",
                    linkedin_url="https://www.linkedin.com/in/yeo-yedjande",
                    github_url="https://github.com/kouadiojose",
                    cv_url={
                        "en": "/assets/cv/CV_EN.pdf",
                        "fr": "/assets/cv/CV_FR.pdf",
                    },
                    contact_lead={
                        "en": "I'm open to senior full stack roles, remote opportunities and relocation in Canada, France, Belgium, Luxembourg, Switzerland and Germany.",
                        "fr": "Je suis ouvert aux postes full stack senior, aux opportunités en télétravail et à la relocalisation au Canada, en France, en Belgique, au Luxembourg, en Suisse et en Allemagne.",
                    },
                )
            )

        if not db.query(StackItem).first():
            stack = [
                ({"en": "Frontend", "fr": "Frontend"},
                 ["Angular", "TypeScript", "JavaScript", "HTML5", "CSS3", "PrimeNG", "Bootstrap"]),
                ({"en": "Backend", "fr": "Backend"},
                 ["Python", "FastAPI", "PHP", "Laravel", "REST APIs"]),
                ({"en": "Database", "fr": "Bases de données"},
                 ["PostgreSQL", "MySQL", "SQL"]),
                ({"en": "DevOps", "fr": "DevOps"},
                 ["Docker", "GitLab CI/CD", "Git", "Linux", "Nginx"]),
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
                        slug="secure-payment-api-integration",
                        visual="security",
                        title={
                            "en": "Secure Payment API Integration",
                            "fr": "Intégration sécurisée d'API de paiement",
                        },
                        role={"en": "Backend / API Developer", "fr": "Développeur Backend / API"},
                        summary={
                            "en": "Implementation and validation of secure external payment API workflows.",
                            "fr": "Implémentation et validation de workflows sécurisés d'API de paiement externes.",
                        },
                        highlights={
                            "en": [
                                "Tested encrypted PIN workflows",
                                "Validated secure API request flows",
                                "Supported partner integration testing",
                            ],
                            "fr": [
                                "Tests des workflows de PIN chiffrés",
                                "Validation des flux de requêtes API sécurisés",
                                "Support des tests d'intégration avec les partenaires",
                            ],
                        },
                        context={
                            "en": "Connecting to external payment partners required strict cryptographic and security compliance on every exchange.",
                            "fr": "La connexion à des partenaires de paiement externes exigeait une conformité cryptographique et sécuritaire stricte sur chaque échange.",
                        },
                        problem={
                            "en": "Sensitive payloads (including PIN data) had to be encrypted, signed and validated end to end, following partner specifications precisely.",
                            "fr": "Les données sensibles (y compris les PIN) devaient être chiffrées, signées et validées de bout en bout, en suivant précisément les spécifications des partenaires.",
                        },
                        approach={
                            "en": "Working from partner API documentation, I implemented and tested RSA-encrypted request flows in Python on Linux, validating each workflow with Postman collections and structured test scenarios before integration.",
                            "fr": "En partant de la documentation API des partenaires, j'ai implémenté et testé des flux de requêtes chiffrés en RSA, en Python sous Linux, en validant chaque workflow avec des collections Postman et des scénarios de test structurés avant l'intégration.",
                        },
                        contributions={
                            "en": [
                                "Implemented and tested encrypted PIN workflows",
                                "Validated authentication and secure request flows against specifications",
                                "Supported end-to-end integration testing with payment partners",
                            ],
                            "fr": [
                                "Implémentation et tests des workflows de PIN chiffrés",
                                "Validation de l'authentification et des flux sécurisés selon les spécifications",
                                "Support des tests d'intégration de bout en bout avec les partenaires de paiement",
                            ],
                        },
                        learnings={
                            "en": "Working against external specifications sharpened my rigor: precise reading, systematic test cases and clear communication with partner teams are what make secure integrations succeed.",
                            "fr": "Travailler sur des spécifications externes a aiguisé ma rigueur : lecture précise, cas de tests systématiques et communication claire avec les équipes partenaires font la réussite des intégrations sécurisées.",
                        },
                        tags=["Python", "REST APIs", "RSA Encryption", "Postman", "Linux"],
                        sort_order=3,
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
                        sort_order=4,
                    ),
                    Project(
                        slug="drone-inspection-platform",
                        visual="drone",
                        title={
                            "en": "Drone Inspection Platform",
                            "fr": "Plateforme d'inspection par drone",
                        },
                        role={"en": "Full Stack Developer", "fr": "Développeur Full Stack"},
                        summary={
                            "en": "A platform for managing and visualizing drone inspection data.",
                            "fr": "Une plateforme de gestion et de visualisation des données d'inspection par drone.",
                        },
                        highlights={
                            "en": [
                                "Built business interfaces for inspection data",
                                "Contributed to operational workflows",
                                "Supported data visualization needs",
                            ],
                            "fr": [
                                "Développement des interfaces métier pour les données d'inspection",
                                "Contribution aux workflows opérationnels",
                                "Support des besoins de visualisation de données",
                            ],
                        },
                        context={
                            "en": "Field inspections by drone produce large volumes of structured data that operational teams need to browse, filter and act on.",
                            "fr": "Les inspections de terrain par drone produisent de grands volumes de données structurées que les équipes opérationnelles doivent parcourir, filtrer et exploiter.",
                        },
                        problem={
                            "en": "Inspection results were hard to exploit without dedicated business interfaces connecting the data to day-to-day operational decisions.",
                            "fr": "Les résultats d'inspection étaient difficiles à exploiter sans interfaces métier dédiées reliant les données aux décisions opérationnelles quotidiennes.",
                        },
                        approach={
                            "en": "I contributed Angular business interfaces on top of REST APIs and PostgreSQL: browsing and filtering inspection results, visualizing key data, and supporting the operational workflows of the teams using the platform.",
                            "fr": "J'ai contribué aux interfaces métier Angular appuyées sur des APIs REST et PostgreSQL : navigation et filtrage des résultats d'inspection, visualisation des données clés, et support des workflows opérationnels des équipes utilisatrices.",
                        },
                        contributions={
                            "en": [
                                "Built business interfaces for inspection data",
                                "Contributed to data visualization components",
                                "Supported operational workflows of field teams",
                            ],
                            "fr": [
                                "Développement des interfaces métier pour les données d'inspection",
                                "Contribution aux composants de visualisation de données",
                                "Support des workflows opérationnels des équipes terrain",
                            ],
                        },
                        learnings={
                            "en": "Even in a specialized domain like drone inspection, the fundamentals hold: clean data models and interfaces designed around the operators' workflow drive adoption.",
                            "fr": "Même dans un domaine spécialisé comme l'inspection par drone, les fondamentaux tiennent : des modèles de données propres et des interfaces conçues autour du workflow des opérateurs font l'adoption.",
                        },
                        tags=["Angular", "REST APIs", "PostgreSQL"],
                        sort_order=5,
                    ),
                ]
            )

        if not db.query(Experience).first():
            db.add_all(
                [
                    Experience(
                        title={
                            "en": "IT Consultant / Full Stack Developer",
                            "fr": "Consultant IT / Développeur Full Stack",
                        },
                        organization="Orange Côte d'Ivoire",
                        period={"en": "Current", "fr": "Actuellement"},
                        bullets={
                            "en": [
                                "Developed enterprise web applications and internal business tools",
                                "Designed and integrated secure REST APIs across payment and business systems",
                                "Contributed to authentication flows with Keycloak, OAuth2 and JWT",
                                "Collaborated with cross-functional teams (business, security, infrastructure)",
                            ],
                            "fr": [
                                "Développement d'applications web d'entreprise et d'outils métier internes",
                                "Conception et intégration d'APIs REST sécurisées sur des systèmes de paiement et métier",
                                "Contribution aux flux d'authentification avec Keycloak, OAuth2 et JWT",
                                "Collaboration avec des équipes pluridisciplinaires (métier, sécurité, infrastructure)",
                            ],
                        },
                        sort_order=1,
                    ),
                    Experience(
                        title={
                            "en": "Full Stack Developer — Enterprise & freelance projects",
                            "fr": "Développeur Full Stack — Projets d'entreprise et freelance",
                        },
                        organization="Independent",
                        period={"en": "", "fr": ""},
                        bullets={
                            "en": [
                                "Delivered full stack web applications from requirements to deployment",
                                "Designed relational databases and REST APIs with Laravel and FastAPI",
                                "Managed hosting, deployment and maintenance on Linux servers",
                            ],
                            "fr": [
                                "Livraison d'applications web full stack, du besoin au déploiement",
                                "Conception de bases de données relationnelles et d'APIs REST avec Laravel et FastAPI",
                                "Gestion de l'hébergement, du déploiement et de la maintenance sur serveurs Linux",
                            ],
                        },
                        sort_order=2,
                    ),
                    Experience(
                        title={
                            "en": "Web & Mobile Application Developer",
                            "fr": "Développeur d'applications web et mobiles",
                        },
                        organization="Early career",
                        period={"en": "", "fr": ""},
                        bullets={
                            "en": [
                                "Built web and mobile applications for local companies and organizations",
                                "Developed business modules, forms and reporting features",
                                "Strengthened fundamentals in PHP, JavaScript, SQL and application architecture",
                            ],
                            "fr": [
                                "Développement d'applications web et mobiles pour des entreprises et organisations locales",
                                "Développement de modules métier, formulaires et fonctionnalités de reporting",
                                "Consolidation des fondamentaux en PHP, JavaScript, SQL et architecture applicative",
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
                            "en": "Years of delivery inside a major telecom operator: real constraints, real users, real production.",
                            "fr": "Des années de livraison chez un grand opérateur télécom : vraies contraintes, vrais utilisateurs, vraie production.",
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
