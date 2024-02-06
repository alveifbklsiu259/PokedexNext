import { useTranslation } from "react-i18next";
import { type Locale } from "@/i18nConfig";
// for some reason reading params' locale will cause the component to re-render too often (context changes)
export const useCurrentLocale = () => {
	const {
		i18n: { language: currentLocale },
	} = useTranslation();
	return currentLocale as Locale;
};
