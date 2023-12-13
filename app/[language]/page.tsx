import { redirect } from "next/navigation";
import { LanguageOption } from "./_components/display/display-slice";

// see if we can import it from other file.
const languageOptions = {
	en: "English",
	ja: "日本語",
	// zh_Hant: '繁體中文',
	// zh_Hans: '简体中文',
	// ko: '한국어',
	// fr: 'Français',
	// de: 'Deutsch',
};

type LanguagePageProps = {
	params: {
		language: LanguageOption;
	};
};
export default function LanguagePage({ params }: LanguagePageProps) {
	const { language } = params;
	if (Object.keys(languageOptions).includes(language)) {
		redirect(`./${language}/pokemons`);
	} else {
		throw new Error('Language not supported');
	}
}
