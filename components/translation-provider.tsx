"use client";

import { I18nextProvider } from "react-i18next";
import initTranslations from "@/lib/i18n";
import { createInstance, type Resource } from "i18next";
import { type Locale, i18nNamespaces } from "@/i18nConfig";

type TransitionProviderProps = {
	children: React.ReactNode;
	locale: Locale;
	namespaces: typeof i18nNamespaces;
	resources: Resource;
};

export default function TranslationsProvider({
	children,
	locale,
	namespaces,
	resources,
}: TransitionProviderProps) {
	const i18n = createInstance();

	initTranslations(locale, namespaces, i18n, resources);

	return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
