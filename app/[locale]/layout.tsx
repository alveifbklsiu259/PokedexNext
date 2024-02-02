import { getData, getEndpointData } from "@/lib/api";
import { getIdFromURL, getNameByLanguage } from "@/lib/util";
import { LanguageOption } from "./page";

import {
	CachedAllPokemonNamesAndIds,
	CachedPokemonSpecies,
} from "@/slices/pokemon-data-slice";
import NavBar from "@/components/navbar";

type LayoutProps = {
	children: React.ReactNode;
	params: {
		language: LanguageOption;
	};
};
export default async function Layout({ children, params }: LayoutProps) {
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

	let speciesData: CachedPokemonSpecies,
		pokemonsNamesAndId: CachedAllPokemonNamesAndIds;
	const speciesResponse = await getEndpointData("pokemonSpecies");

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


	return (
		<>
			<NavBar
				generations={generations}
				types={types}
				namesAndIds={pokemonsNamesAndId}
				language={language}
			/>
			{children}
		</>
	);
}
