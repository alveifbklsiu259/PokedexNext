import { notFound, redirect } from "next/navigation";

export const languageOptions = {
	en: "English",
	ja: "日本語",
	// zh_Hant: '繁體中文',
	// zh_Hans: '简体中文',
	// ko: '한국어',
	// fr: 'Français',
	// de: 'Deutsch',
};

export type LanguageOption = keyof typeof languageOptions;

export async function generateStaticParams() {
	return Object.keys(languageOptions).map((lan) => ({
		language: lan,
	}));
}
export const dynamicParams = false;

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
		notFound();
	}
}


// I think the route pokemons can either be staic or dynamic, here're some examples:
// 1. static: https://www.doordash.com/home?filterQuery-cuisine=Fast+Food (when reresh, you can see the pre-rendered content, but this route use searchParams, I think it is SSG + client component)
// 2. dynamic: https://packages.united.com/relax/in/3000014810/from/20240108/to/20240125/rooms/1/adults/2?amenities=FINTRNT&cart-key=7b0f8076-ac98-4843-9922-bc2e7cbef4f4&index=0&pkg-rguid=57f0c25d8dd742b6b16f2beafb05763b
// when refresh, we see skeleton, maybe this route is dynamic?

// but if the route is statically rendered, that means we're gonna have to do the data fetching on the client, which may not be that good for performance, because: change searchParams --> pokemons(client) renders --> fetched data in Effect --> pokemons renders, whereas if this route is dynamic, then: change searchParams --> Pokemons-Server(server fetch data, get intersection...) --> pass data down to Pokemons(client) --> Pokemons renders

// notice that we have to explicitly handle not accessible route, e.g. /jk/pokemons, we made [lan] dynamic, and we have dynamicParams = false, but this only return 404 when loading routes like /jk, if [lan]/pokemons is dynamic, then /jk/pokemons will be dynamically rendered



// if we have a root layout that renders navbar (root route is statically rendered), and a nested dynamic route, this dynamic route will also show the nav bar from the root layoute, when initial load the dynamic route(through url), does the navbar show? or we'll see the loading content in root loading.tsx? (make a thorough test, (according to my simple test, the statically generated layout will not show immediately, instead the loading content will show, so it seems like we're rendering the layout at request time even though it is statically generated at build time))

// when changing language /en/pokemons/search?query=xxx --> /ja/pokemons/search?query=xxx, the loading.tsx in [language] shows, why? but if you go from /en/pokemons/ --> /ja/pokemons, you still see the static part(layout)


// can we have a not-found in each route? according to the test, only the root not-found will be shown??


// i18n, middleware, theme(dark mode)