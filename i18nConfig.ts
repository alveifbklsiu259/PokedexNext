const i18nConfig = {
	locales: ["en", "ja", "zh-Hant", "zh-Hans", "ko", "fr", "de"],
	defaultLocale: "en",
	prefixDefault: true
} as const;

export default i18nConfig;

export type Locales = (typeof i18nConfig)["locales"];
export type Locale = Locales[number];
export const i18nNamespaces = ["pokemons", "pokemon"] as const;
