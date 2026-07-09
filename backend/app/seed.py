"""Idempotent database seed.

Creates the schema, the initial admin account and the initial site content.
Safe to run multiple times: existing content is never overwritten, so edits
made through the admin dashboard survive restarts and redeployments.

Run with:  python -m app.seed
"""
from .config import get_settings
from .database import Base, SessionLocal, engine
from .models import (
    AdminUser,
    Experience,
    ExpertiseItem,
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
                    headline="Senior Full Stack Developer",
                    hero_eyebrow="Hi, I'm Yeo Yedjande — IT Consultant at Orange Côte d'Ivoire",
                    hero_subtitle=(
                        "Building secure, scalable and business-oriented web platforms with "
                        "Angular, Python/FastAPI, Laravel, PostgreSQL, Docker and Keycloak."
                    ),
                    availability=(
                        "Available for international opportunities — Canada · France · Belgium · "
                        "Luxembourg · Switzerland · Germany"
                    ),
                    about_title="Enterprise software, delivered reliably",
                    about_paragraphs=[
                        "I am a Full Stack Developer based in Côte d'Ivoire, currently working as an "
                        "IT Consultant at Orange Côte d'Ivoire. I design and build enterprise web "
                        "applications, secure REST APIs, internal platforms, business dashboards and "
                        "system integrations used in real production environments.",
                        "My day-to-day work sits at the intersection of business and technology: "
                        "translating operational needs into robust software, integrating identity and "
                        "access management with Keycloak, connecting payment and ERP systems, and "
                        "shipping with Docker and GitLab CI/CD.",
                        "What defines my work is reliability. I care about clean architecture, "
                        "secure-by-default APIs, maintainable code and solutions that teams can "
                        "actually operate — not just demos.",
                    ],
                    facts=[
                        {"label": "Current role", "value": "IT Consultant — Orange Côte d'Ivoire"},
                        {"label": "Focus", "value": "Enterprise platforms, secure APIs, system integration"},
                        {"label": "Core stack", "value": "Angular · Python/FastAPI · Laravel · PostgreSQL"},
                        {"label": "Languages", "value": "French (native) · English (professional)"},
                        {"label": "Open to", "value": "Remote & relocation — EU / Canada"},
                    ],
                    email="kouadiojose@gmail.com",
                    linkedin_url="https://www.linkedin.com/in/yeo-yedjande",
                    github_url="https://github.com/kouadiojose",
                    cv_url="/assets/cv/Yeo-Yedjande-CV.pdf",
                    contact_lead=(
                        "Open to senior full stack roles — remote or relocation — in Canada, France, "
                        "Belgium, Luxembourg, Switzerland and Germany. Let's talk about how I can "
                        "help your team ship."
                    ),
                )
            )

        if not db.query(ExpertiseItem).first():
            db.add_all(
                [
                    ExpertiseItem(
                        title="Enterprise Web Applications",
                        description="End-to-end development of internal platforms, business dashboards and operational tools used daily by enterprise teams.",
                        icon="app",
                        sort_order=1,
                    ),
                    ExpertiseItem(
                        title="REST API Design & Integration",
                        description="Designing, documenting and consuming REST APIs that connect frontends, backends, payment providers and third-party systems.",
                        icon="api",
                        sort_order=2,
                    ),
                    ExpertiseItem(
                        title="Authentication & Security",
                        description="Identity and access management with Keycloak, OAuth2/OpenID Connect, JWT and encrypted payment workflows.",
                        icon="shield",
                        sort_order=3,
                    ),
                    ExpertiseItem(
                        title="Database Design",
                        description="Modeling and optimizing relational schemas on PostgreSQL and MySQL for transactional, reporting and audit use cases.",
                        icon="database",
                        sort_order=4,
                    ),
                    ExpertiseItem(
                        title="DevOps & Deployment",
                        description="Containerized delivery with Docker, automated pipelines with GitLab CI/CD, and deployment on Linux/Nginx environments.",
                        icon="gear",
                        sort_order=5,
                    ),
                    ExpertiseItem(
                        title="Business Process Automation",
                        description="Automating payment, approval and back-office workflows, including ERP integration with Odoo.",
                        icon="chart",
                        sort_order=6,
                    ),
                ]
            )

        if not db.query(StackItem).first():
            stack = {
                "Frontend": ["Angular", "TypeScript", "JavaScript", "HTML5", "CSS3", "Bootstrap / PrimeNG"],
                "Backend": ["Python", "FastAPI", "PHP", "Laravel", "REST APIs"],
                "Database": ["PostgreSQL", "MySQL", "SQL"],
                "DevOps & Tools": ["Docker", "GitLab CI/CD", "Git", "Linux", "Nginx"],
                "Security & Identity": ["Keycloak", "JWT", "OAuth2 / OpenID Connect"],
            }
            order = 0
            for category, items in stack.items():
                for name in items:
                    order += 1
                    db.add(StackItem(category=category, name=name, sort_order=order))

        if not db.query(Project).first():
            db.add_all(
                [
                    Project(
                        slug="enterprise-payment-platform",
                        title="Enterprise Payment Platform",
                        role="Full Stack Developer",
                        summary="Development of a prepaid payment management platform integrated with business systems and secure authentication.",
                        context=(
                            "A large enterprise needed to manage prepaid payment products across "
                            "several business systems, with strict security requirements. I worked "
                            "across the stack: Angular frontend, FastAPI services, PostgreSQL "
                            "persistence, Keycloak-based access control and Docker packaging — "
                            "collaborating closely with business and security teams."
                        ),
                        highlights=[
                            "Designed and consumed secure REST APIs",
                            "Integrated authentication and authorization with Keycloak",
                            "Worked on deployment-ready architecture with Docker",
                            "Collaborated with business and technical teams",
                        ],
                        tags=["Angular", "FastAPI", "PostgreSQL", "Docker", "Keycloak", "REST APIs"],
                        sort_order=1,
                    ),
                    Project(
                        slug="observability-monitoring-platform",
                        title="Observability & Monitoring Platform",
                        role="Full Stack Developer",
                        summary="Development of an internal observability dashboard for monitoring data sources, KPIs, anomalies and audit logs.",
                        context=(
                            "Operations teams lacked visibility on data quality across their "
                            "sources. I built dashboard views with charts, filtering, pagination, "
                            "exports and audit trails, giving the teams a daily tool to detect "
                            "anomalies early and follow up on incidents."
                        ),
                        highlights=[
                            "Built dashboards and data visualization components",
                            "Implemented filtering, pagination, exports and audit views",
                            "Improved visibility on operational data quality",
                        ],
                        tags=["Angular", "Python", "PostgreSQL", "Highcharts", "REST APIs"],
                        sort_order=2,
                    ),
                    Project(
                        slug="api-payment-integration",
                        title="API Payment Integration",
                        role="Backend / API Developer",
                        summary="Implementation and testing of secure payment API integrations involving encryption, authentication and external system communication.",
                        context=(
                            "Integrating with external payment partners required strict security: "
                            "encrypted PIN workflows, signed requests and careful validation. I "
                            "implemented and tested these flows end to end, working from partner "
                            "API documentation to production-ready integration code."
                        ),
                        highlights=[
                            "Tested and validated encrypted PIN workflows",
                            "Worked with API documentation and secure request flows",
                            "Supported integration with payment partners",
                        ],
                        tags=["Python", "REST APIs", "RSA Encryption", "Postman", "Linux"],
                        sort_order=3,
                    ),
                    Project(
                        slug="odoo-business-process-automation",
                        title="Business Process Automation — Odoo Integration",
                        role="API Designer / Full Stack Developer",
                        summary="Backend API design for integrating business payment workflows with Odoo modules.",
                        context=(
                            "Payment workflows had to be connected to the company's Odoo ERP. I "
                            "designed the API flows between the frontend, backend services and Odoo "
                            "modules, structured the business rules and prepared the integration "
                            "logic for enterprise-scale workflows."
                        ),
                        highlights=[
                            "Designed API flows between frontend/backend and Odoo",
                            "Structured business rules and payment processes",
                            "Prepared integration logic for enterprise workflows",
                        ],
                        tags=["Python", "FastAPI", "Odoo", "PostgreSQL", "REST APIs"],
                        sort_order=4,
                    ),
                    Project(
                        slug="drone-inspection-platform",
                        title="Drone Inspection Platform",
                        role="Full Stack Developer",
                        summary="Contribution to a platform for managing and visualizing drone inspection data.",
                        context=(
                            "Field inspections by drone produce large volumes of structured data. "
                            "I contributed business interfaces to browse, filter and visualize "
                            "inspection results, supporting the operational workflows of the teams "
                            "using the platform."
                        ),
                        highlights=[
                            "Built business interfaces for inspection data",
                            "Contributed to data visualization and operational workflows",
                        ],
                        tags=["Angular", "REST APIs", "PostgreSQL"],
                        sort_order=5,
                    ),
                ]
            )

        if not db.query(Experience).first():
            db.add_all(
                [
                    Experience(
                        title="IT Consultant / Full Stack Developer",
                        organization="Orange Côte d'Ivoire",
                        period="Current",
                        bullets=[
                            "Developed enterprise-grade web applications used by internal business teams",
                            "Designed and integrated secure REST APIs across payment and business systems",
                            "Contributed to secure authentication flows with Keycloak, OAuth2 and JWT",
                            "Built dashboards, business modules and operational tools with Angular and Python",
                            "Collaborated with cross-functional teams (business, security, infrastructure)",
                        ],
                        sort_order=1,
                    ),
                    Experience(
                        title="Full Stack Developer — Freelance Projects",
                        organization="Independent",
                        period="",
                        bullets=[
                            "Delivered full stack web applications for businesses, from requirements to deployment",
                            "Designed relational databases and REST APIs with Laravel and FastAPI",
                            "Implemented responsive, production-ready frontends with Angular and Bootstrap",
                            "Managed hosting, deployment and maintenance on Linux servers",
                        ],
                        sort_order=2,
                    ),
                    Experience(
                        title="Web & Mobile Application Developer",
                        organization="Early career",
                        period="",
                        bullets=[
                            "Built web and mobile applications for local companies and organizations",
                            "Developed CRUD business modules, forms and reporting features",
                            "Strengthened fundamentals in PHP, JavaScript, SQL and application architecture",
                        ],
                        sort_order=3,
                    ),
                ]
            )

        if not db.query(ValueProp).first():
            db.add_all(
                [
                    ValueProp(
                        title="Business-oriented",
                        description="I build software to solve operational problems, not to showcase technology. Every feature maps to a business need.",
                        sort_order=1,
                    ),
                    ValueProp(
                        title="Enterprise experience",
                        description="Years of delivery inside a major telecom operator: real constraints, real users, security reviews and production incidents.",
                        sort_order=2,
                    ),
                    ValueProp(
                        title="Full-spectrum ownership",
                        description="Comfortable across frontend, backend, databases and deployment — I can take a feature from design to production.",
                        sort_order=3,
                    ),
                    ValueProp(
                        title="Fast learner",
                        description="I ramp up quickly on new domains, codebases and tools, as shown by projects spanning payments, observability, ERP and drones.",
                        sort_order=4,
                    ),
                    ValueProp(
                        title="Reliable & structured",
                        description="Clear communication, documented work, respected deadlines. I keep stakeholders informed and deliver what I commit to.",
                        sort_order=5,
                    ),
                    ValueProp(
                        title="Delivery-focused",
                        description="Shipping working, maintainable software in production is the goal — clean code, CI/CD and pragmatic decisions serve that.",
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
