import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.css";
import '@/App.css'
import { getData, getEndpointData } from "@/lib/api";
import { getIdFromURL, getNameByLanguage } from "@/lib/util";
import { type Locale } from "@/i18nConfig";
import TranslationsProvider from "@/components/translation-provider";
import { initTranslationsServer } from "@/lib/i18n";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import TransitionProvider from "@/components/transition-provider";
import AOSInitializer from "@/components/aos-initializer";
import Loader from "@/components/loader";
import { dir } from 'i18next';
import {i18nNamespaces} from '@/i18nConfig';
import {Zen_Maru_Gothic} from 'next/font/google';
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemonSpecies,
} from "@/slices/pokemon-data-slice";
import NavBar from "@/components/navbar";

const zen_maru_gothic = Zen_Maru_Gothic({weight: '400', subsets: ['latin']});

export const metadata: Metadata = {
	title: "Pokedex",
	description: "Pokedex App Generated by create next app",
};



type RootLayoutProps = {
	children: React.ReactNode;
	params: {
		locale: Locale;
	};
};
export default async function Layout({
	children,
	params: { locale },
}: RootLayoutProps) {
	const {resources} = await initTranslationsServer(locale, i18nNamespaces);

	const generationResponse = await getEndpointData("generation");
	const generations = await getData(
		"generation",
		generationResponse.results.map((entry) => entry.name),
		"name"
	);

	// types
	const typeResponse = await getEndpointData("type");
	const types = await getData(
		"type",
		typeResponse.results.map((entry) => entry.name),
		"name"
	);

	let speciesData: CachedPokemonSpecies,
		pokemonsNamesAndId: CachedAllPokemonNamesAndIds;
	const speciesResponse = await getEndpointData("pokemonSpecies");

	if (locale !== "en") {
		speciesData = await getData(
			"pokemonSpecies",
			speciesResponse.results.map((entry) => getIdFromURL(entry.url)),
			"id"
		);
		pokemonsNamesAndId = Object.values(
			speciesData
		).reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
			pre[getNameByLanguage(cur.name, locale, cur)] = cur.id;
			return pre;
		}, {});
	} else {
		pokemonsNamesAndId =
			speciesResponse.results.reduce<CachedAllPokemonNamesAndIds>(
				(pre, cur) => {
					pre[cur.name] = getIdFromURL(cur.url);
					return pre;
				},
				{}
			);
	}

	// see if prefetch at build time is possible
	// const responses = await Promise.all([...Array(1000).keys()].map(num => fetch(`https://pokeapi.co/api/v2/pokemon/${num + 1}`, {cache: 'force-cache'})));
	// const speciesResponse = await getEndpointData("pokemonSpecies");
	// const intersection = speciesResponse.results.map((entry) => getIdFromURL(entry.url))

	// const unresolvedPokemons = getData("pokemon", intersection, "id");
	// 	const unresolvedSpeciesData = getData("pokemonSpecies", intersection, "id");
	// 	await Promise.all([unresolvedPokemons, unresolvedSpeciesData]);

	return (
		<html lang={locale} dir={dir(locale)}>
			<body className={zen_maru_gothic.className}>
				{/* {props.search} */}
				<AOSInitializer />
				<TransitionProvider>
					<Loader />
					<AppRouterCacheProvider>
						<TranslationsProvider
							namespaces={i18nNamespaces}
							locale={locale}
							resources={resources}
						>
							<NavBar
								generations={generations}
								types={types}
								namesAndIds={pokemonsNamesAndId}
							/>
							{children}
						</TranslationsProvider>
					</AppRouterCacheProvider>
				</TransitionProvider>
			</body>
		</html>
	);
}



// using provider will probably not affect the rendering of the components, only the children will still be rendered on the server, but the component that read the context (usexxx hook) will be rendered on the client.

// configure documnet file?
// https://nextjs.org/docs/getting-started/installation#the-pages-directory-optional
// https://mui.com/material-ui/guides/nextjs/#typescript




	
	// in a client component, reading params, i.e. const params = useParams() and when the route changes, this component will re-rendered because of "context changed"
	// also notice that the returned value of useParams is not cached:
	// this happen when i was in /en/pokemons, and when search params changes, I still get the same params {language: 'en}, but not the same instance,
	// when I was in /en/pokemon/xxx, change to different pokemon, the params will cahange from for example: {language: 'en', id: 1} to  {language: 'en', id: 2}, in case like this, you say the context changed is understandable, but in the above case, it doesn't quite make sense.
	// one of a workaround is pass language from the server to the client, but later I will migrate to i18n, then I'll see if the same problem exists.

	// usually layout.tsx is a server component, but if it renders client components, on subsequent navigation, the client components will re-render on the client,(I tested, in development mode, the client comps will not re-render on the client as partial renders is working, but in production mode, they do re-renders.), to fix this problem, we can use memo(component, () => true) 



// todo:
/* 
	middleware (routing)
	https://nextjs.org/docs/app/building-your-application/routing/middleware
	react query
	navigation progress bar
	(
		https://github.com/vercel/next.js/discussions/45500
		https://github.com/apal21/nextjs-progressbar/blob/master/src/index.tsx
		https://ricostacruz.com/nprogress/
		https://mantine.dev/x/nprogress/


	)

	tailwind
	grapgQL
	https://beta.pokeapi.co/graphql/console/
	https://developer.ibm.com/articles/awb-consuming-graphql-apis-from-plain-javascript/


	create a server useTransition
	(use cache to retain the instance?)
	https://www.google.com/search?q=nextjs+transition+between+pages&rlz=1C2ONGR_zh-TWTW1018TW1019&sca_esv=599014582&source=hp&ei=xk6nZbXVLvq12roPhZ6tyAY&iflsig=ANes7DEAAAAAZadc1pXgRhe2x0qFUhSsX_o8l52-XjSk&oq=nextjs+transition&gs_lp=Egdnd3Mtd2l6IhFuZXh0anMgdHJhbnNpdGlvbioCCAAyBRAAGIAEMgUQABiABDIGEAAYFhgeMggQABgWGB4YCjIGEAAYFhgeMgYQABgWGB4yBhAAGBYYHjIGEAAYFhgeMggQABgWGB4YCjILEAAYgAQYigUYhgNIxC9QAFjBInABeACQAQCYAU6gAaMHqgECMTi4AQPIAQD4AQHCAgsQLhiABBjHARjRA8ICBRAuGIAEwgIOEC4YgAQYxwEYrwEYjgXCAggQLhiABBjUAsICBxAAGIAEGAo&sclient=gws-wiz
	https://css-tricks.com/react-suspense-lessons-learned-while-loading-data/
	https://blog.logrocket.com/advanced-page-transitions-next-js-framer-motion/

	fix skeleton
	(
		https://alistapart.com/article/creating-intrinsic-ratios-for-video/
		https://css-tricks.com/aspect-ratio-boxes/#article-header-id-3
		https://stackoverflow.com/questions/10380351/skeleton-css-how-to-span-the-width-of-the-screen
		https://stackoverflow.com/questions/59461615/a-good-way-to-handle-material-ui-skeleton-scaling-within-a-variable-height-grid
	)

	infinite scroll with react query
	(
		https://developers.google.com/search/blog/2014/02/infinite-scroll-search-friendly
		https://scrollsample.appspot.com/items?page=14
	)

	SEO
	(
		https://support.google.com/webmasters/thread/137303327/is-incremental-static-regeneration-good-for-seo?hl=en
		https://pagespeed.web.dev/
		https://github.com/vercel/next.js/discussions/50829
		https://www.reddit.com/r/nextjs/comments/wmk6gv/impact_of_react_suspense_used_with_nextjs_on_seo/
		https://www.reddit.com/r/nextjs/comments/nxjfah/isr_and_seo/
		https://www.google.com/search?q=nextjs+suspense+seo&rlz=1C2ONGR_zh-TWTW1018TW1019&sca_esv=587860557&source=hp&ei=WnhuZcnzHNjg2roP6cybMA&iflsig=AO6bgOgAAAAAZW6GataNUZ2IGNODS7isJkhps_NgSK2d&ved=0ahUKEwjJiMqfjveCAxVYsFYBHWnmBgYQ4dUDCAo&uact=5&oq=nextjs+suspense+seo&gs_lp=Egdnd3Mtd2l6IhNuZXh0anMgc3VzcGVuc2Ugc2VvMgUQIRigAUjmLlCABliwLXABeACQAQCYAWSgAecIqgEEMTguMbgBA8gBAPgBAagCAMICCxAuGIAEGMcBGNEDwgIFEAAYgATCAgUQLhiABMICBxAAGIAEGArCAgsQABiABBiKBRiGA8ICBhAAGBYYHsICBBAhGBU&sclient=gws-wiz
	)

	fix localeCompare function (
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
		https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale
	)

	redux
	(
		https://blog.isquaredsoftware.com/2023/11/presentations-rtk-2.0-new/
		https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/
		https://redux-toolkit.js.org/api/configureStore
		https://redux.js.org/api/createstore
		https://redux.js.org/usage/server-rendering
		https://redux-toolkit.js.org/rtk-query/usage/server-side-rendering
	)

*/

// more ref
/* 
	https://yakkun.com/swsh/zukan/n833#enc_anchor
	https://gamewith.jp/pokemon-sv/article/show/374373
	https://gamewith.jp/pokemon-sv/article/show/373315

	--- next page
	https://www.target.com/p/10-arnav-modern-studio-platform-2000h-metal-bed-frame-zinus/-/A-52519124?preselect=52493471
	https://packages.united.com/vacationpackages/
	
*/

/* 
	read
	https://vercel.com/blog/partial-prerendering-with-next-js-creating-a-new-default-rendering-model
	https://github.com/vercel/next.js/discussions/43657
	https://github.com/reactwg/react-18/discussions/130
	https://web.dev/articles/rendering-on-the-web#seo-considerations
	https://vercel.com/docs/incremental-static-regeneration
	https://www.npmjs.com/package/clsx
	https://codesandbox.io/p/sandbox/little-night-p985y?file=%2Fsrc%2Findex.js
	https://react.dev/learn/render-and-commit#epilogue-browser-paint
	https://dev.to/dj1samsoe/understanding-ssr-csr-isr-and-ssg-a-comprehensive-guide-add
	next dashboard
	https://nextjs.org/learn/dashboard-app
*/


/* 
		Q1: the docs says layout.js will never re-render, what about page.js? How to determin if a server component renders, I tried using console.log, but I'm not sure if it can used as an indication. In a statically rendered route, the data-fetching function's log is logged to the server when changing route, instead of just once at build time.
		According to the docs, layout(SSG, SSR will never re-render), but what about page? (I think page should not re-renders in a SSG route, since hte rendered HTML is cached in full route cache, but as for SSR route, the page will be rendered at request time, can we say that this is a kind of re-render?)
		Q2: when an server component renders a client component, the log in the client component sometimes is logged on the server, why?
		Q3: why the initial visit of a SSR/SSG route is not cached in router cache? (haven't tested client route yet)
		test: a static /, dynamic /[lan] that fetch some data + at the same folder a loading.js, initially land on /[lan] --> navigate to / --> navigate to the previously visited /[lan], the loading conetnt will show again, why? (in production)
		is it because of this? (- when navigating to a dynamic route, if prefetch is NOT set, even though there's no data-fetching in the dynamic route, the loading.js in the same folder of the dynamic route will still be shown. this is because in dynamic Routes, prefetch default to automatic.  ---- this is my test)

		
		Q4: why does log in server component logs twice?
		Q5: if we pass data down from a server component to a client component, and log the data on the client, the initial log and the log when we navigate away then back the this route will not be the same, why? I was thinking about maybe it's because the data is coming from different caching source(i.e. full route cache / router cache), but if it's true, the data in router cache is coming from full route cache, why they're different?
		this will cause the client component to always re-render on the seconde navigation, mayne we can use the same technique we used in Move (check JSON.stringify..)
		Q6: when we navigate to a new route, what actually happens? the process stated in full route cache?
		Q7: a dynamic route's initial HTML will be the fallback component defined in Suspense or loading.js, when it comes to SEO, what content does search engine cralwer get? the content of those loading thing or the content of the actual data?
		A7: check this
		https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#seo


		Q8: is it possible to fetch data in an unaccessable route, then pass it down or something?


    	Q9: data is cached in data cache, but fetching still takes a lot of time, why?
    	I have a static route that gets 1 ~ 1017 pokemon data, this data will be cached in data cache, and a dynamic route that also fetch 1~1017 pokemon data, just fetching alone takes about 2 seconds why? (indeed there's no extra request made to the data source, but it's slow why??) (if data cache is opted out, it takes about 9~12 seconds...)
		A9: myabe it's because of rendering the root layout, I tried deleting unnecessary code in root layout, and it gets a little bit faster, this came to me when reading "loading UI and Streaming" and it says :"Next.js will wait for data fetching inside generateMetadata to complete before streaming UI to the client. This guarantees the first part of a streamed response includes <head> tags." ref: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#seo
		I'm not really sure if it's the cause..

    	Q10: a dynamic route (/[lan]) that fetch data, when landing on / then navigating from / to /[lan], also the first time landing on /[lan](after building and data has not been cached in data cache), the loading content in the same folder as /[lan]/page.js will run.
    	but after data has been cached in data cache, when we're at /[lan] and refresh, the route will seem inresponsive and the loading content will flicers at the last moment why?
		Q11: data passed from server to client are sometime not the same why?

		Q12: loading not responsive when refreshing dynamic route(navigation will be fine, but ladn on /[dynamic] and refresh will be unresponsive for a while..))
		Q13: at a dynamic route /[lan], make reuqest to json-server, and also make these route static by using generateStaticParams, at build time, you'll see the same number of request as the number of static routes made to json server, why, why the reuqest is not cached in data cache? if this really is a problem, then if we generate 1000+ static routes, that's gonna be making 1000+ smae reuqests to an endpoint... which is really bad.
*/

/* 
	SSG: initial visit !== initial navigation, example: the root static server component renders a client component Pokemons:
	- if a user lands on /, this is the initial "visit", Pokemons is rendered on the server.
	- user navigates to /route1
	- user navigates back to /, this is the initial "navigation", Pokemons is rendered on the server.
	- user navigates to /route1.
	- user navigates back to /, this is the subsequent "navigation", Pokemons is rendered on the client. 
	- whether the client component(Pokemons) is rendered on the server or client has something to do with router cache, according to my test, before the Automatic Invalidation Period (5 mins) has passed, when navigate to /, Pokemons will always be rendered on the client, after the period, Pokemons will be renreder on the server once.
*/
