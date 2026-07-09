import { I18nList, I18nStr } from '../../core/models';

/** Helpers to map i18n dicts to/from paired EN/FR form controls. */

export function toLines(list: I18nList | undefined, lang: string): string {
  return (list?.[lang] ?? []).join('\n');
}

export function fromLines(en: string, fr: string): I18nList {
  const split = (s: string) => s.split('\n').map((line) => line.trim()).filter(Boolean);
  return { en: split(en), fr: split(fr) };
}

export function toStr(value: I18nStr | undefined, lang: string): string {
  return value?.[lang] ?? '';
}

export function fromStr(en: string, fr: string): I18nStr {
  return { en: en.trim(), fr: fr.trim() };
}
