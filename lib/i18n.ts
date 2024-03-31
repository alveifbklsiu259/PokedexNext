import { cache } from "react";
import { createInstance, type Resource, type i18n } from "i18next";
import { initReactI18next } from "react-i18next/initReactI18next";
import resourcesToBackend from "i18next-resources-to-backend";
import i18nConfig, { type Locale, i18nNamespaces } from "@/i18nConfig";

const initTranslations = async function initTranslations(
	locale: Locale,
	namespaces: typeof i18nNamespaces,
	i18nInstance?: i18n,
	resources?: Resource
) {
	i18nInstance = i18nInstance || createInstance();

	i18nInstance.use(initReactI18next);

	if (!resources) {
		i18nInstance.use(
			resourcesToBackend(
				(language: string, namespace: string) => {
					let localeDir: string;
					if (language.includes('-')) {
						const indexOfDash = language.indexOf('-');
						localeDir = language.slice(0, indexOfDash).concat(language.slice(indexOfDash).toUpperCase());
					} else {
						localeDir = language;
					};
					return import(`@/locales/${localeDir}/${namespace}.json`)
				}
			)
		);
	}
	await i18nInstance.init({
		lng: locale,
		resources,
		fallbackLng: i18nConfig.defaultLocale,
		supportedLngs: i18nConfig.locales,
		defaultNS: namespaces[0],
		fallbackNS: namespaces[0],
		ns: namespaces,
		preload: resources ? [] : i18nConfig.locales,
	});

	return {
		i18n: i18nInstance,
		resources: i18nInstance.services.resourceStore.data,
		t: i18nInstance.t,
	};
};
export default initTranslations;

// use to get the same instance, alternatively we can use withTranslation(HOC)(but only in client component)
// args passed to initTranslationsServer will be automatically passed to initTranslations. reference: https://react.dev/reference/react/cache#cache
export const initTranslationsServer = cache(initTranslations);
