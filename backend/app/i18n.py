"""Content internationalization helpers.

Translatable database fields store JSON dicts keyed by language code,
e.g. {"en": "Senior Full Stack Developer", "fr": "Développeur Full Stack Senior"}.
The public API resolves them to plain strings for the requested language,
falling back to English.
"""

SUPPORTED_LANGUAGES = ("en", "fr")
DEFAULT_LANGUAGE = "en"


def normalize_lang(lang: str | None) -> str:
    lang = (lang or DEFAULT_LANGUAGE).lower()
    return lang if lang in SUPPORTED_LANGUAGES else DEFAULT_LANGUAGE


def resolve(value, lang: str):
    """Resolve an i18n dict ({"en": ..., "fr": ...}) to the requested language."""
    if isinstance(value, dict):
        resolved = value.get(lang) or value.get(DEFAULT_LANGUAGE)
        if resolved is None and value:
            resolved = next(iter(value.values()))
        return resolved if resolved is not None else ""
    return value
