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


// I think this route can either be staic or dynamic, here're some examples:
// 1. static: https://www.doordash.com/home?filterQuery-cuisine=Fast+Food (when reresh, you can see the pre-rendered content, but this route use searchParams, I think it is SSG + client component)
// 2. dynamic: https://packages.united.com/relax/in/3000014810/from/20240108/to/20240125/rooms/1/adults/2?amenities=FINTRNT&cart-key=7b0f8076-ac98-4843-9922-bc2e7cbef4f4&index=0&pkg-rguid=57f0c25d8dd742b6b16f2beafb05763b
// when refresh, we see skeleton, maybe this route is dynamic?