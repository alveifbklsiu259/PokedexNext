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

// SSG page probably doesn't need blurred placeholder for Image ??
// what about paliceholder for CSR? placieholder only works for SSR
// handle searchParams not accessible cases?


/* 
	test Link performance, e.g.
	// { Link's children changes when isLoading change, why? but BasicInfo is cached it does not change. 
	// { <Link href={`./${language}/pokemon/${id}`}> }
	// { <div onClick={() => handleClick(id)}> }
	// <BasicInfo
	// 	pokemonData={pokemonData}
	// 	language={language as LanguageOption}
	// 	speciesData={cachedData.species[id]}
	// 	types={types}
	// />
	// { </div> }
	// { </Link> }


*/


/* Pokemons 


// if we land on /en, then immediately scroll to end, the getDataOnScroll will not be triggered, and if we have a console.log() when Pokemons component mounts, the log shows up a while after the page loads, is it because when the page loads, it's the static HTML rendered from the server, so the page is actually not hydrated yet, then how can we solve this problem?
// the same behavior can be observed when we land on /en, then immediately click  show advanced search, it woun't work.

// does fetched results get cached in SSR route?

// useSearchParams is the cause why even though /[language] is statically rendered, the loading.tsx still runs on initial visit/refrsh
// because Pokemons is rendered on the client,even though data is fetched instantly, browser still have to wait for Pokemons to be rendered on the client side(which means we have to download the JS files --> reconcile/hydrate the page --> then the content will be shown, if you check the build profiler, you'll see that during the initial visit, Pokemons is rendered on the client, and also if you check network, you'll see that a lot of JS files have been downloaded, then a while (rendering) later the content will be shown)
// (so, using useSearchParams will cause a component to be rendered on the client, does that mean this is just like pure CSR? which is bad for SEO? if it's true, should we avoid using searchParams as a technique to manage state?)
// If a route is statically rendered, calling useSearchParams() will cause the tree up to the closest Suspense boundary to be client-side rendered. This allows a part of the page to be statically rendered while the dynamic part that uses searchParams is client-side rendered.
// reference: https://nextjs.org/docs/app/api-reference/functions/use-search-params
// can we further divide this component to only a small part that reads searchParams/params? so other part can still be statically rendered.

// I want to try:
// 1. cache fetched data on the client myself
// 2. then use 3-rd party libraries to cache fetch request (swr...)
// I think we can actually fetch all pokemons and all species on the server, but when i tried this, it fails very often fetching on the server.

// bug:
// scroll bug
// when scrollup fetch still gets triggered.

// unknown behavior:
// props passed from server component to client component will not be the same between navigations.
// memo behaves differently when used with server component and useSearchParams

// fix this, this will cause layout shift, currently keeping it for better understanding how client component is rendered on the server
// reference:https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr
// When using React.lazy() and Suspense, Client Components will be pre-rendered (SSR) by default.
// also notice that when scroll down to load new pokemon data and immediately scroll to top, the Sort will disappear for a moment, I think that's because the pokemon data is fetched from the server, and below we have {ssr: false}.
// const Sort = dynamic(() => import('../display/sort'), {ssr: false});


*/

// I notice that changine search params in a dynamic route will not cause the layout to run (01/18/2024), consider this structure:
// (pokemons2 folder contains): layout.tsx, page.tsx, and this is a SSR route
// if we have Search in layout.tsx, then changing searchParams will cause page.tsx to re-render on the server, but layout will not (this is partial rendering, but I remember that it only applies to nested route before, not sure if this is a new fix in newer version)