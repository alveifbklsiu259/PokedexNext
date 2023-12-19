import { Suspense } from "react";
import { getEndpointData, getData, testServerRequest } from "@/app/_utils/api";
import Pokemons from "../../../_components/pokemonData/pokemons";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemonSpecies,
} from "@/app/[language]/_components/pokemonData/pokemon-data-slice";
import { getIdFromURL, getNameByLanguage } from "@/app/_utils/util";
import { LanguageOption } from "@/app/[language]/_components/display/display-slice";

// this component is still rendered at reuqest time but only ONCE, why?

const languageOptions = {
	en: "English",
	ja: "日本語",
	// zh_Hant: '繁體中文',
	// zh_Hans: '简体中文',
	// ko: '한국어',
	// fr: 'Français',
	// de: 'Deutsch',
};

// don't use export const dynamic = 'force-static' with components that use useSearchParams, this will cause some error..
// what error?
// export const dynamic = 'force-static'

export async function generateStaticParams() {
	return Object.keys(languageOptions).map((lan) => ({
		// language: lan as LanguageOption
		language: lan,
	}));
}
export const dynamicParams = false;

type PageProps = {
	params: {
		language: LanguageOption;
	};
};

export default async function Page({ params }: PageProps) {
	console.log("/[language]/search/page.tsx");
	const { language } = params;

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

	// why don't I pass pokemons and species here in this route, the data is cached when we fetch them in /[language]/pokemons
	// names and ids
	const speciesResponse = await getEndpointData("pokemonSpecies");

	let allNamesAndIds: CachedAllPokemonNamesAndIds,
		speciesData: CachedPokemonSpecies;
	const initialRequestIds = speciesResponse.results
		.slice(0, 24)
		.map((entry) => getIdFromURL(entry.url));

	if (language !== "en") {
		speciesData = await getData(
			"pokemonSpecies",
			speciesResponse.results.map((entry) => getIdFromURL(entry.url)),
			"id"
		);
		allNamesAndIds = Object.values(
			speciesData
		).reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
			pre[getNameByLanguage(cur.name, language, cur)] = cur.id;
			return pre;
		}, {});
	} else {
		speciesData = await getData("pokemonSpecies", initialRequestIds, "id");
		allNamesAndIds =
			speciesResponse.results.reduce<CachedAllPokemonNamesAndIds>(
				(pre, cur) => {
					pre[cur.name] = getIdFromURL(cur.url);
					return pre;
				},
				{}
			);
	}
	const pokemonData = await getData("pokemon", initialRequestIds, "id");

	return (
		<>
			{/* because the route is statically rendered on the server, Pokemons uses useSearchParams and makes it only render on the client, this is why this Suspense gets fired
		// The special file loading.js helps you create meaningful Loading UI with React Suspense. With this convention, you can show an instant loading state from the server while the content of a route segment loads. The new content is automatically swapped in once rendering is complete.
		*/}
			<Suspense fallback={<h1>Loading client Pokemons</h1>}>
				<Pokemons
					generations={generations}
					types={types}
					// initialPokemonData={pokemonData}
					// initialSpeciesData={speciesData}
					allNamesAndIds={allNamesAndIds}
				/>
			</Suspense>
		</>
	);
}

/* 
This route renders the same "Pokemons component" as /[language]/page.tsx does, why do we still keep this route?
There're a couple of reasons:
1. I want to shown the initial Pokemons for /[language] for better SEO, this mean that /[language] can be either statically or dynamically rendered.
2. If we don't have another route /[language]/search and just append search params to /[language] when searching pokemons, then:
2-1 if /[language] is dynamically rendered, when we search and navigate to /[language]?query=xxx, this is considered a subsequent navigation, because Pokemons is a client component, it will only render on the client side, but since /[language] is dynamically rendered, each subsequent navigation will also cause /[language]/page.tsx to be rendered on the server again, which is not so good.
2-2 if /[language] is statically rendered, navigating to /[language]?query=xxx will not have the same issue as 2-1, but if we refresh the after searching e.g. /en?query=xxx, the user will see the initial Pokemons (from the fallback), which is also not good.

By having another statically rendered route, we can solve the above two issues (we can sove 2-2 by wrapping Pokemons in /[language]/search in another suspense, and provide a spinner or whatever as fallback, we don't have to worry about SEO, because the initial Pokemons is provided by /[language]'s suspense fallback)
Note: A client component that uses useSearchParams will have different render behaviors depends on whether the route is static or dynamic.

here's another question: what's the point of rendering this route statically on the server? would it be better off if we render this route only on the client side?
first of all, Pokemons need some data, so we have to fetch the data in a server component.
second, what's the point of marking this route as a client component? it will still be statically rendered on the server(client component will also be rendered on the server), which is the same as rendering as a server component.

*/



// when navigating to a static route, if this route fetched a lot of data ,navigation is slow, why? it's not like the route is dynamic which will be rendered at request time.
// I'm not sure if this is an intended behavior, you can check https://leerob.io/guestbook (the vice president of vercel's blog), when navigating to blog or guestbook, this also happens(the page is a bit unresponsive, and url change also lags a bit)

// I think I find the problem: consider this structure:
// route1/page.tsx: statically rendered on the server, fetch a lot of data, and it renders a client component;
// if route1/page.tsx is passing fetched down to the clinet component, navigating to this route will be slow eve though this route is statically generated at build time.
// if route1/page.tsx is NOT passing fetched down to the clinet component, navigating to this route will be blazing fast.