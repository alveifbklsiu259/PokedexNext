import { Suspense } from 'react'
import { LanguageOption, languageOptions } from "@/app/[language]/_components/display/displaySlice";
import { getEndpointData, getData } from "../_utils/api";
import Search from "./_components/search/searchWrapper";
import { CachedAllPokemonNamesAndIds } from "@/app/[language]/_components/pokemonData/pokemonDataSlice";
import { getIdFromURL } from "../_utils/util";
import Pokemons from "./_components/pokemonData/pokemons";


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
export const dynamicParams = false;

export async function generateStaticParams() {
	return Object.keys(languageOptions).map(lan => ({
		// language: lan as LanguageOption
		language: lan
	}));
};

type PageProps = {
	params: {
		language: LanguageOption
	}
	searchParams: {
		[key: string]: string | string[] | undefined
	}
}

export default async function Page({params, searchParams}: PageProps) {

	console.log('root')
	const { language } = params;
	const range: number[] = [];
	for (let i = 1; i <= 24; i ++) {
		range.push(i)
	};
	const pokemonData = await getData('pokemon', range, 'id');
	const speciesData = await getData('pokemonSpecies', range, 'id');

	const generationResponse = await getEndpointData('generation');
	const generationData = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

	// get type
	const typeResponse = await getEndpointData('type');
	const typeData = await getData('type', typeResponse.results.map(entry => entry.name), 'name');


	let pokemonsNamesAndId: CachedAllPokemonNamesAndIds = {};
	// get pokemon count, all names and ids
	const speciesResponse = await getEndpointData('pokemonSpecies'); // will this be dedeupe?
	for (let pokemon of speciesResponse.results) {
		pokemonsNamesAndId[pokemon.name] = getIdFromURL(pokemon.url);
	}; // this should be the corresponding names, have to get all species data if !== 'en'




	return (
		<>
			{/* <Suspense fallback={<Spinner/>}> */}
			<Search generations={generationData} types={typeData} namesAndIds={pokemonsNamesAndId} />
			{/* </Suspense> */}
			{/* what's the use of Suspense here? we're not fetching any data in the Search
				reference: https://nextjs.org/docs/app/api-reference/functions/use-search-params#static-rendering
			*/}
			<Pokemons types={typeData} generations={generationData} pokemonData={pokemonData} speciesData={speciesData} language={language} searchParams={searchParams} />
		</>
		
	)
}

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





/* 
Caching



*/






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
