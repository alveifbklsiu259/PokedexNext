import { LanguageOption, SortOption, languageOptions } from "@/app/[language]/_components/display/display-slice";
import { getEndpointData, getData, getPokemons2 } from "../_utils/api";
import Search from "./_components/search/search-wrapper";
import { CachedAllPokemonNamesAndIds, CachedGeneration, CachedPokemon, CachedType } from "@/app/[language]/_components/pokemonData/pokemon-data-slice";
import { getIdFromURL } from "../_utils/util";
import Pokemons from "./_components/pokemonData/pokemons";
import { testServerRequest } from "../_utils/api";


// can we export non next-defined things from page/layout...?
// export const languageOptions = {
// 	en: 'English',
// 	ja: '日本語',
// 	zh_Hant: '繁體中文',
// 	zh_Hans: '简体中文',
// 	ko: '한국어',
// 	fr: 'Français',
// 	de: 'Deutsch',
// };

// this is not working, why?
// export const dynamicParams = false;

// export async function generateStaticParams() {
// 	return Object.keys(languageOptions).map(lan => ({
// 		// language: lan as LanguageOption
// 		language: lan
// 	}));
// };

function getArrFromParam (searchParam: string | string[] | undefined): string[] {
	if (!searchParam) {
		return [];
	} else if (Array.isArray(searchParam)) {
		return searchParam.filter(param => param.trim() !== '');
	} else {
		return searchParam.split(',');
	};
};

function getStringFromParam (searchParam: string | string[] | undefined): string {
	if (!searchParam) {
		return '';
	} else if (Array.isArray(searchParam)) {
		return searchParam.join();
	} else {
		return searchParam
	};
};

const getIntersection = (searchParams: {[key: string]: string | string[] | undefined} , generations: CachedGeneration, types: CachedType, language: LanguageOption): number[] => {
	const {query, type, gen, match, sort} = searchParams;
	const selectedTypes = getArrFromParam(type);
	const selectedGenerations = getArrFromParam(gen);
	let matchMethod = getStringFromParam(match);
	matchMethod = matchMethod === '' ? 'all' : matchMethod;
	// should handle cases that user types in unaccessible param value early.


	// get range
	let pokemonRange: {
		name: string,
		url: string
	}[] = [];
	// when searching in error page, selectedGenerations will be undefined.
	if (selectedGenerations.length === 0) {
		pokemonRange = Object.values(generations).flatMap(gen => gen.pokemon_species);
	} else {
		pokemonRange = selectedGenerations.flatMap(gen => generations[`generation_${gen}`].pokemon_species);
	};

	// handle search param
	const trimmedText = getStringFromParam(query).trim();

	let searchResult: typeof pokemonRange;
	if (trimmedText === '') {
		// no input or only contains white space(s)
		searchResult = pokemonRange;
	} else if (isNaN(Number(trimmedText))) {
		// search by name
		searchResult = pokemonRange.filter(pokemon => {
			if (language === 'en') {
				return pokemon.name.toLowerCase().includes(trimmedText.toLowerCase())
			} else {
				// const speciesData = pokeData.pokemonSpecies[getIdFromURL(pokemon.url)]
				// return getNameByLanguage(pokemon.name.toLowerCase(), language, speciesData).toLocaleLowerCase().includes(trimmedText.toLowerCase());

				// handle non-en

			};
		});
	} else {
		// search by id
		searchResult = pokemonRange.filter(pokemon => String(getIdFromURL(pokemon.url)).padStart(4 ,'0').includes(String(trimmedText)));
	};

	// get intersection
	let intersection = searchResult.map(pokemon => getIdFromURL(pokemon.url));

	// handle types
	if (selectedTypes.length) {
		if (matchMethod === 'all') {
			const matchedTypeArray = selectedTypes.reduce<number[][]>((pre, cur) => {
				pre.push(types[cur].pokemon.map(entry => getIdFromURL(entry.pokemon.url)));
				return pre;
			}, []);
			for (let i = 0; i < matchedTypeArray.length; i ++) {
				intersection = intersection.filter(pokemon => matchedTypeArray[i].includes(pokemon));
			};
		} else if (matchMethod === 'part') {
			const matchedTypeIds = selectedTypes.reduce<number[]>((pre, cur) => {
				types[cur].pokemon.forEach(entry => pre.push(getIdFromURL(entry.pokemon.url)));
				return pre;
			}, []);
			intersection = intersection.filter(id => matchedTypeIds.includes(id));
		};
	};
	return intersection;
	// const {fetchedPokemons, pokemonsToDisplay, nextRequest} = await getPokemons(pokeData.pokemon, allNamesAndIds, dispatch, intersection, dispalyData.sortBy);

	// return {intersection, searchParam, selectedGenerations, selectedTypes, fetchedPokemons, nextRequest, pokemonsToDisplay};
};



type PageProps = {
	params: {
		language: LanguageOption
	}
	searchParams: {
		[key: string]: string | string[] | undefined
	}
}

// this is an SSR route, but data fetched on the server will be cached in data cache, but is it a good practice to fetch data on the server after an user interaction? React will render on the server then reconcile and hydrate on the client, cna't we just skip rendering on the server after a user interaction, but directly reconcile and hydrate the client component?

// is it possible that we get data in a unaccessable SSG route, 

export default async function Page({params, searchParams}: PageProps) {
	console.log('render starts')
	const { language } = params;
	const sortBy = (searchParams.sort || 'numberAsc') as SortOption;

	// all requests in this route will not be cached!! since it's a dynamic route.
	// maybe fetching common data (generations, versions, types...) in a static route?

	// will this component being run on navigation?

	// I can also fetch all the data concurrently, e.g. getData no await, then Promise.all()

	// generations


	const generationResponse = await getEndpointData('generation');
	const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

	// types
	const typeResponse = await getEndpointData('type');
	const types = await getData('type', typeResponse.results.map(entry => entry.name), 'name');

	let pokemonsNamesAndId: CachedAllPokemonNamesAndIds = {};
	// get pokemon count, all names and ids
	const speciesResponse = await getEndpointData('pokemonSpecies'); // will this be dedeupe?
	for (let pokemon of speciesResponse.results) {
		pokemonsNamesAndId[pokemon.name] = getIdFromURL(pokemon.url);
	}; // this should be the corresponding names, have to get all species data if !== 'en'

	const intersection = getIntersection(searchParams, generations, types, language);


	// each time sort changes, new request will be made
	// if we can get the cached data here to replace {}, we can probably not fetche data.
	const {sortedIntersection, fetchedPokemons} = await getPokemons2({}, pokemonsNamesAndId ,intersection , sortBy)

	const display = sortedIntersection.slice().splice(0, 24);

	await testServerRequest();


	// sort intersection
	// const sortedIntersection2 = intersection.sort((a,b) => a - b);

	// takes in intersection, output sorted intersection, 

	// const initialPokemonIds = [...sortedIntersection2].splice(0, 24);
	// const initialPokemonData = await getData('pokemon', initialPokemonIds, 'id');
	const initialSpeciesData = await getData('pokemonSpecies', display, 'id');
	console.log('render ends')
	// why does Pokemons take so long to be rendered after data are all fetched?
	// why the request is not sent to the server at build time? instead, at  request time





	return (
		<>
			{/* <Suspense fallback={<Spinner/>}> */}
			<Search 
				generations={generations} 
				types={types} 
				namesAndIds={pokemonsNamesAndId}
			/>
			{/* </Suspense> */}
			{/* what's the use of Suspense here? we're not fetching any data in the Search
				reference: https://nextjs.org/docs/app/api-reference/functions/use-search-params#static-rendering
			*/}
			<Pokemons
				// key={JSON.stringify(searchParams)}
				types={types}
				generations={generations}
				initialPokemonData={fetchedPokemons!}
				initialSpeciesData={initialSpeciesData}
				intersection={sortedIntersection}
				language={language}
				searchParams={searchParams}
			/>
		</>
	)
};


// since the rout /en is SSR, when search params change, we'll fetch the data on the server first, then render Pokemons and Search.


// What chaching mechanisms each rendering method has:
// 1. SSG: router cache, full route cache, data cache, (request memoization)
// 2. SSR: router cache,  data cache?? , (request memoization)
// I'm not sure about data cache in SSR, check what the docs says
// https://nextjs.org/docs/app/building-your-application/caching#full-route-cache:~:text=The%20Data%20Cache%20can%20still%20be%20used.


// 3. CSR: router cache





// when searching, Pokemons need to reset scroll count,;;;

// scrolling -- intersection will not change, display should change
// search -- intersection will change, display should change







// get initial data from the server --> pass it down to client component --> fetch data when scrolling --> store data in the state,
// this way we can render the initial data



// how to check if a fetch request in run on server really gets cached? (it doesn't run on subsequent render?)



// Search component is gonna be a client component, we can fetch the initial data from server then pass down to it,


// we can even just fetch data from the basicInfo component, instead of passing it down.
// can infinite scroll be SSR or SSG? if no then I can only go for pagination?
// google: infinite scroll next server, there're some videos about using server action to implement this, but not sure if it's server component or client








// how to handle different case url? redirect?


// if I dont want /en, /ja... to be accessible, but only /en/pokemons, /ja/pokemons, how to structure the folder?
// maybe put the generateStaticParams in a layout file instead of a page file?


// is it better for performance if we fetch data from a server component then pass it down to a client component?


//I don't get why loading.js by default is a server component, isn't loading used as an iondication for user? then what's the point of showing it on the server?
// check what does Suspense do?
// https://react.dev/reference/react/Suspense
// seems like loading and suspense is usually used with streaming, which is a server component....
// Streaming: https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming#what-is-streaming

/*{ <Suspense fallback={<Spinner/>}>
	<Page />
</Suspense> }
is the same as adding a loading.ts file

*/



//The generateStaticParams function can be used in combination with dynamic route segments to statically generate routes at build time instead of on-demand at request time.

// in my case, I have so many different language, and 1000+ pokemon page for each language, if I use generateStaticParams, does it bloat up the files?


// change the file name back to camelCase




// // is fetch data being cached in the client component?
// // (can we even use fetch in client component? and I think data is not being cached in client component.)


// // //is data fetched in dynamica server component being cached? (SSR).
// // // dynamic route can have cached data or uncached data
// // // reference: https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering:~:text=Dynamic%20Routes%20with%20Cached%20Data
// // // In Next.js, you can have dynamically rendered routes that have both cached and uncached data. This is because the RSC Payload and data are cached separately. This allows you to opt into dynamic rendering without worrying about the performance impact of fetching all the data at request time. Learn more about the full-route cache and Data Cache.


// // // SSG: happens at build time, create statci data, e.g. HTML, CSS...
// // // SSR: happens at request time, almost the same as SSG, but SSR happens when rendering requiring data only known at request time (e.g. cookies, header...), or when data is not cached, notice that it still runs on the server.
// // // CSR, happens after request time, it requires user interactivity, e.g. useState, useContext...., the user download the CSR code (javascript...), then the site becomes interative
// // // ISR (Incremental Static Regeneration):  ???
// // // is ISR the same as streaming?
// // // Streaning: Streaming enables you to progressively render UI from the server. Work is split into chunks and streamed to the client as it becomes ready. This allows the user to see parts of the page immediately, before the entire content has finished rendering.



// // what's the downside of fetching data in the client component?
// // does that mean we should fetch all pokemon related data in the server?
// // // I wonder if this is a good approach:
// // // fetch all pokemon data (all pokemon, all species, all items.... in the server component, then when the user navigate between pages, there's no need to fetche other data)
// // // I mean, what's the cose of this? if we fetch data on the server, does it impact the experience?(it happens on the server side, does user get affected?)

// // (is it that one of the downsides is it will put a lot of overhead on the server?)



// // // Does throttling browser internet impact the load time of a SSR page, I tried, and seems like it does, why? I mean the page is rendered on the server, why does it impact it?(I tested on dev mode, is it because in this case the server is actually my browser? )




// // 5. terminology of caching, e.g. Request Memoization, Data Cache, Full Route Cache, Router Cache
// // read: https://nextjs.org/docs/app/building-your-application/caching
// // // Next.js automatically caches the returned values of fetch in the Data Cache on the server. This means that the data can be fetched at build time or request time, cached, and reused on each data request.








// // 2. what is Route Handler for?
// // // read: https://nextjs.org/docs/app/building-your-application/routing/route-handlers


// // 3. what is Server Action for?
// // // read: https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations
// // (In Route handlers, fetch requests are not memoized as Route Handlers are not part of the React component tree.)



// // */





// // // next.js has a preload function
// // // https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#preloading-data
// // // the reason why it works even though the prefetched data is not bound to any variable is I think because of next.js's cached fetch(the second fetch will use the cached result).

// 'use client'
// import { useRef } from "react";
// import Pokemons from "@/components/pokemonData/pokemons";
// import Search from "./_components/search/search";

// export default function Page() {
// 	const viewModeRef = useRef<HTMLDivElement>(null);

// 	return (
// 		<>
// 			<Search viewModeRef={viewModeRef} />
// 			<Pokemons viewModeRef={viewModeRef} />
// 		</>
// 	)
// }



// // what's the purpose of using nextjs, instead of sticking to React, it's all for SSR/SSG...
// // I think what I should do is:
// // 1. make the APP work using Next.js
// // 2. take advantage of Next's function, e.g. fetch data from the server.
// // 3. instead of storing data as state, take use of urlParams



// // if we have a client component that useState, and we pass that state to another component, will that component be client or server?
// // client, all the tree down below a client component will be client.


// // if we're gonna manage state using urlParams, how are we gonna structure the APP
// // 
