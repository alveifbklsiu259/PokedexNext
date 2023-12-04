import { getEndpointData, getData, getPokemons2, testServerRequest } from "../_utils/api";
// import Search from "./_components/search/search-wrapper";
import { CachedAllPokemonNamesAndIds, CachedPokemon, CachedPokemonSpecies } from "@/app/[language]/_components/pokemonData/pokemon-data-slice";
import { getIdFromURL, getNameByLanguage, getIntersection } from "../_utils/util";
import Pokemons from "./_components/pokemonData/pokemons";
import { Suspense } from 'react'
import Spinner from "../_components/spinner";
import { LanguageOption, SortOption } from "./_components/display/display-slice";
import BasicInfo from "./_components/pokemonData/basicInfo";
import PokemonsWrapper from "./_components/pokemonData/pokemonsWrapper";
import Search from "./_components/search/search";
import SearchWrapper from "./_components/search/search-wrapper";
import SearchServer from "./_test/SearchServer";
import PokemonsServer from "./_test/PokemonsServer";

// can we export non next-defined things from page/layout...?
// I tried importing languageOptions from other files, but encounter build error(can't get staticParams)
const languageOptions = {
	en: 'English',
	ja: '日本語',
	// zh_Hant: '繁體中文',
	// zh_Hans: '简体中文',
	// ko: '한국어',
	// fr: 'Français',
	// de: 'Deutsch',
};

export async function generateStaticParams() {
	return Object.keys(languageOptions).map(lan => ({
		// language: lan as LanguageOption
		language: lan
	}));
};
export const dynamicParams = false;

type PageProps = {
	params: {language: LanguageOption},
	// searchParams: { [key: string]: string | string[] | undefined }
};


// try fetching data concurrently and see if it reduces time

export default async function Page({params}: PageProps) {
	const {language} = params;
	if (!Object.keys(languageOptions).includes(language)) {
		throw new Error('language not supported');
	};
	console.log(`this is ${language}`)

	// generations

	// console.time(`/${language}`)
	// const generationResponse = await getEndpointData('generation');
	// const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

	// // // types
	// const typeResponse = await getEndpointData('type');
	// const types = await getData('type', typeResponse.results.map(entry => entry.name), 'name');
	// // console.timeEnd('page')


	// // // get pokemon count, all names and ids
	// const speciesResponse = await getEndpointData('pokemonSpecies');

	// let speciesData: CachedPokemonSpecies, pokemonsNamesAndId: CachedAllPokemonNamesAndIds;
	// // let speciesData: CachedPokemonSpecies;
	// const initialPokemonIds: number[] = [];
	// for (let i = 1 ; i <= 24; i ++) {
	// 	initialPokemonIds.push(i);
	// };
	// const pokemonDate = await getData('pokemon', initialPokemonIds, 'id');
	// if (language !== 'en') {
	// 	speciesData = await getData('pokemonSpecies', speciesResponse.results.map(entry => getIdFromURL(entry.url)), 'id');
	// 	pokemonsNamesAndId = Object.values(speciesData).reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
	// 		pre[getNameByLanguage(cur.name, language, cur)] = cur.id;
	// 		return pre;
	// 	}, {});
	// } else {
	// 	pokemonsNamesAndId = speciesResponse.results.reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
	// 		pre[cur.name] = getIdFromURL(cur.url);
	// 		return pre;
	// 	}, {});
	// 	speciesData = await getData('pokemonSpecies', initialPokemonIds, 'id');
	// };
	// console.timeEnd(`/${language}`)



	// maybe we can further divide the Search component, take a looke at the Search component, only the Input component needs allPokemonNamesAndIds, we can make other part statically rendered, and only Input dynamically rendered on the server or even just render on the client?

	// why I don't want this route to be dynamically rendered? I don't want the loading content to show. (we have all the data for Search already)
	

	// make use of material ui, make the app look like those sites built with react (react, redux, jest, create-react-app...)
	// using algolia for searching.

	// I thought if I directly render other server  component and not fetch data in this route's page, it will immediately show the suspense boundries for those server component, but no... when I navigate to the page, it's unresponsive for a bit...

	return (
		<>
			{/* <Search 
				generations={generations}
				types={types}
				namesAndIds={pokemonsNamesAndId}
			/> */}
			{/*  or try fetching the smae data there, see how long it takes (.timeEnd) */}
			{/* <Suspense fallback={<h1>Loading searchWrapper...</h1>}>
				<SearchWrapper
					language={language}
				/>
			</Suspense> */}
			{/* <Suspense fallback={<h1>Loading PokemonsWrapper... this loading should not appear</h1>}>
				<PokemonsWrapper
					language={language}
					searchParams={searchParams}
				/>
			</Suspense> */}

			{/* render Search here */}
			{/* <Suspense fallback={<h1>Loading searchWrapper...</h1>}>
				<Search
					generations={generations}
					types={types}
					namesAndIds={pokemonsNamesAndId}
				/>
			</Suspense>
			<Suspense fallback={<h1>Loading Pokemons...</h1>}>
				<Pokemons
					initialPokemonData={pokemonDate} 
					initialSpeciesData={speciesData}
					generations={generations}
					types={types}
				/>
			</Suspense> */}
			{/* <Suspense fallback={<h1>Loading SearchServer...</h1>}>
				<SearchServer
					language={language}
				/>
			</Suspense> */}
			<Suspense fallback={<h1>Loading PokemonsServer...</h1>}>
				<PokemonsServer 
					language={language}
				/>
			</Suspense>


		</>
	)
};



// make /[language] statically rendered, and /[language]/search should also be static or only render on the client side
// but this way, since Pokemons and Search reads searchParams, they will not be rendered on teh server in the initial render, they will only be rendered on the client side. unles I'm gonna have to create a server version of Search and Pokemons, and they don't read searchParams.


// I thought Suspense only runs when it wraps a server component and the server component is fetching data, but if a route is statically rendered on the server and it renders a client component that is only rendered on the client(use useSearchParams), then the Suspense wrap around this client component will also run on every initial load.


// both Search and Pokemons are showing up at the same time, because of data fetching in page, both of them wait for all the data to be fetched then rendered. so if you want to render them separately, you have to fetch their data seperately(which means use SearchWrapper, PokemonsWrapper)


/* 
	The final structure: 
	1. /[language] is statically render, and it renders Search(server), Pokemons(server) which both of them don't read searchParams.
	this way the initail visit of /[language] is super quick
	2. /[language]/search is statically rendered, and it renders Search(client), Pokemons(client), both of them use searchParams, this will make those two components only render on the client, which is bad for SEO, but this is fine, since we have /[language] rendered on the serve for SEO, and with this approach, there's no round trip between server and client on each navigation.
	(maybe we can test /[language]/search as a client component, or dynamic component).
	about Search and Pokemons, maybe we can use HOC?

	other possible structure is:
	1. /[language] is dynamically rendered, /[language]/search is statically rendered
	2. /[language] is dynamically rendered, /[language]/search is client rendered
	3. /[language] is statically rendered, /[language]/search is statically rendered
	4. /[language] is statically rendered, /[language]/search is client rendered
	all in all, we need prerender for SEO(either static or dynamic will work), and a route that onlt renders on the client side when search params change which mean it can't be dynamically rendered otherwise on every requests it will be rendered on the server.


	further thoughts:
	Q1-1. why don't make /[language] static, and it renders Search(server), Pokemons(server) which both of them render the corresponding component that use searchParams?
	A1-1. because this will make Search(client) and Pokemons(client) only render on the client which is not so good for SEO.
	Q1-2 how about using Suspense that renders the static structure of those components?
	A1-2 I'm not sure if this will work, and if it works, users will see the same thing before and after the client component actually renders, but the initial one will not be responsive.

	Q2-1. why don't make /[language] dynamic, and it renders Search(server), Pokemons(server) which both of them render the respective component that use searchParams?
	A2-1. during the initial render, all the components will be rendered on the server, then when searchParams change, Search(server), Pokemons(server) will also render on the server again, which will drag the speed, and the app will be slow.



	thanks to partial rendering, navigating between the routes that share the same layout will not cause the layout to rerender even if the layout is dynamically rendered at request time. maybe we can do:
	1. /[language]/layout.tsx render Search(server) and Pokemons(server) that render corresponding client components that use useSearchParams.
	2. /[language]/page.tsx render null, we only want to make this route accessible.
	3. /[language]/search/page.tsx renders null 
	// give it a shot


	// try template method

	maybe there's another solution, which is add one more route on top of /[language] and in that route we dynamically render Search


*/



// is there a way to make a route partly statically render and partly dynamically render? in our case, we want to statically render Search(part of it and client-side render Input) and dynamically render Pokemons.

// maybe we can implement this using parallel routes
/* 
what we can do is:
1. make a route statically render, then partly client side render (use useSearchParams + Suspense);
2. make a route dynamically render (the part that use useSearchParams will also be rendered at request time instead of on the client sied.)

*/ 





// when we search pokemon (in language like ja, zh, the query will be the string we type in instead of an encoded uri, should we convert it into an encoded one?)
// when fetching a lot of data on the server, the load time of the page will be slow why?

// how to make skeleton

// each time sort changes, new request will be made
// if we can get the cached data here to replace {}, we can probably not fetche data.
// const {sortedIntersection, fetchedPokemons} = await getPokemons2({}, pokemonsNamesAndId ,intersection , sortBy)

// sort intersection
// const sortedIntersection2 = intersection.sort((a,b) => a - b);

// const initialPokemonIds = [...sortedIntersection2].splice(0, 24);
// const initialPokemonData = await getData('pokemon', initialPokemonIds, 'id');
// const initialSpeciesData = await getData('pokemonSpecies', display, 'id');



// I fetch data on the client, but after deleting .next folder, rebuild/restart dev, those fetched data is still cached? why, where are those data cacahed? 
// does data fetched on the client cached on the server?  (I guess no?)

// now the page is so much faster, fetching data on the client, instead of on the server then passing it down 

// we can actually read the params/searchParams in the server component to make it dynamically rendered, then fetch data based on params/searchParams and we're also able to render an initial skeleton based on the data we fetched.


// should be skeleton, else the images will change after render.

// nextjs + redux
// learn swr / react query
// read this again: https://react.dev/learn/render-and-commit#epilogue-browser-paint


// google: infinite scroll next server, there're some videos about using server action to implement this, but not sure if it's server component or client
// how to handle different case url? redirect?
// if I don't want /en, /ja... to be accessible, but only /en/pokemons, /ja/pokemons, how to structure the folder?
// maybe put the generateStaticParams in a layout file instead of a page file?
// is it better for performance if we fetch data from a server component then pass it down to a client component?

//I don't get why loading.js by default is a server component, isn't loading used as an iondication for user? then what's the point of showing it on the server?
// check what does Suspense do?
// https://react.dev/reference/react/Suspense
// seems like loading and suspense is usually used with streaming, which is a server component....
// Streaming: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#what-is-streaming

// change the file name back to camelCase
// is fetch data being cached in the client component?

/* SSG: happens at build time, create statci data, e.g. HTML, CSS...
SSR: happens at request time, almost the same as SSG, but SSR happens when rendering requiring data only known at request time (e.g. cookies, header...), or when data is not cached, notice that it still runs on the server.
CSR, happens after request time, it requires user interactivity, e.g. useState, useContext...., the user download the CSR code (javascript...), then the site becomes interative
ISR (Incremental Static Regeneration):  ???
is ISR the same as streaming?
Streaning: Streaming enables you to progressively render UI from the server. Work is split into chunks and streamed to the client as it becomes ready. This allows the user to see parts of the page immediately, before the entire content has finished rendering.
 */


/* what's the downside of fetching data in the client component?
does that mean we should fetch all pokemon related data in the server?
I wonder if this is a good approach:
fetch all pokemon data (all pokemon, all species, all items.... in the server component, then when the user navigate between pages, there's no need to fetche other data)
I mean, what's the cose of this? if we fetch data on the server, does it impact the experience?(it happens on the server side, does user get affected?) 
(is it that one of the downsides is it will put a lot of overhead on the server?)
*/

// // Does throttling browser internet impact the load time of a SSR page, I tried, and seems like it does, why? I mean the page is rendered on the server, why does it impact it?(I tested on dev mode, is it because in this case the server is actually my browser? )


// 2. what is Route Handler for?
// // read: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

// 3. what is Server Action for?
// // read: https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations
// (In Route handlers, fetch requests are not memoized as Route Handlers are not part of the React component tree.)

// // next.js has a preload function
// // https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#preloading-data
// // the reason why it works even though the prefetched data is not bound to any variable is I think because of next.js's cached fetch(the second fetch will use the cached result).

// can I do things like: 
// async function Page () {...}
// export default <Suspense fallback={<Spinner/>}>{Page}</Suspense>
// to replace using loading?? (just wonder if this pattern is possible?)


// in a dynamic route, can I have some data being fetched at build time? for example using layout and page, get some data in layout at build time, and get other data in page at request time based on params or searchParams?

// maybe the answer is: https://nextjs.org/docs/app/building-your-application/caching#data-cache-and-full-route-cache
// the simplest way to implement it is to fetch data in root layout at build time







//	weird behavior
	/*  
		Is a route capable of rendering part of the content at build time and part of the content at request time? (I want the rendering happens on server)

		Q: if I'm only passing the searchParams down to a child server component, does it count "using searchParams"? e.g.
		a static route or a dynamic route that use generateStaticParams to make static, if this route pass searchParams down to a child server component (the static route per se doesn't use it), will this route be dynamically or statically render? (is data fetched at request time or build time?)

		A: Yes, This method works! If you have a static route that wants to read searchParams, you can pass it down to the child server component, if you just pass it down and not use it in the route, this will not make the route dynamic, which means that this route can still be statically rendered at build time, and data will also be fetched at build time


		The result is a bit nuanced, 
		- at build time, the static route's requests will be made, and the content will also be rendered.
		- at build the server component that receives searchParams and uses it will not be rendered, so does the requests.
		- at request time, the static route's requests will not be made, but the content will be rendered again!!!!! (this is the weird behavior)
		- at reuqest time, the server component that receives searchParams and uses it will be rendered and make requests.
		so the conclusion is, passing down searchParams is considered using it, but the route can make request at build time and the route will be rendered at both build and request time. (which means the loading content will run)
	*/ 



	// I'm wondering, if I have a dynamic server component that renders a client component, and the client component uses searchParams, what will the user see when then first visit the page? since use searchParams will cause the client component to be rendered on the client side.
/* 
no actually if the server component is dynamically rendered, then the client component will be rendered on the server in the initial render. Only when the server component is statically rendered, then the client component will be rendered on the client.

If a route is dynamically rendered, useSearchParams will be available on the server during the initial server render of the Client Component. 
 ref: https://nextjs.org/docs/app/api-reference/functions/use-search-params#dynamic-rendering
*/


// maybe we can just dismiss the below statement and attempt
// Pokemons has to be dynamically rendered because we need to know searchParams and get different pokemon data.
	// if a component does not depend on searchParams, we can render it in a static server route.
	// Search required data based on params, acutally we can make this route a static route, but since Pokemons need data from searchParams which will make the route dynamic, but maybe we can add a new route /search and use searchParams + render Pokemons there, e.g. /search?query='mewtwo', this way we can statically render Search at /, and dynamically render Pokemons at /search. but how do we show the initial pokemons at / ?


// what's the use of parallel routes, if it's just for rendering some content conditionally or simultaneously, we can do the same thing by importing the components in the Page or Layout, then render ourself, or even wrap Suspense, ErrorBoundry, then why do we have to use parallel routes?