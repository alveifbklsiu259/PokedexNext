import { Suspense } from "react";

import { getData, getEndpointData } from "../../_utils/api";
import { getIdFromURL, getNameByLanguage } from "../../_utils/util";
import { LanguageOption } from "../_components/display/display-slice";
import Sort from "../_components/display/sort";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemonSpecies,
} from "../_components/pokemonData/pokemon-data-slice";
import Search from "../_components/search/search";

type LayoutProps = {
	children: React.ReactNode;
	params: { language: LanguageOption };
};

export default async function Layout({ children, params }: LayoutProps) {
	console.log("/[language].layout.tsx");

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

	// get pokemon count, all names and ids
	const speciesResponse = await getEndpointData("pokemonSpecies");

	let speciesData: CachedPokemonSpecies,
		pokemonsNamesAndId: CachedAllPokemonNamesAndIds;

	if (language !== "en") {
		speciesData = await getData(
			"pokemonSpecies",
			speciesResponse.results.map((entry) => getIdFromURL(entry.url)),
			"id"
		);
		pokemonsNamesAndId = Object.values(
			speciesData
		).reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
			pre[getNameByLanguage(cur.name, language, cur)] = cur.id;
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

	// we may not have to memo Search or Sort because subsequent navigation (searchParams change) will not cause layout to render again.

	return (
		<>
			{/* This route is statically rendered, on subsequent navigation, the props will not be the same, why? (initial load's props !== navigation1's props, navigation1's props !== navigation2's props, i.e. each navigation will cause the props to change, and cause re-render.) */}
			<div className="container mb-5">
				<Search
					generations={generations}
					types={types}
					namesAndIds={pokemonsNamesAndId}
				/>
				<Sort />
				{children}
			</div>
		</>
	);
}

// maybe new path structure e.g.
// /[language]/pokemons?query=xxx
// /[language]/pokemon/1
// so later we can have /[language]/berries, /[language]/items ...

// use route group
// Navigating across multiple root layouts will cause a full page load (as opposed to a client-side navigation). For example, navigating from /cart that uses app/(shop)/layout.js to /blog that uses app/(marketing)/layout.js will cause a full page load. This only applies to multiple root layouts.

// does it affet to non root layout groups?


// 