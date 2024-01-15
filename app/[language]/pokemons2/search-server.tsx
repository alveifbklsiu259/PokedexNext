import { getData, getEndpointData } from "../../../lib/api";
import { getIdFromURL, getNameByLanguage } from "../../../lib/util";
import { LanguageOption } from "../_components/display/display-slice";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemonSpecies,
} from "../_components/pokemonData/pokemon-data-slice";
import Search from "../_components/search/search";

type SearchServerProps = {
	language: LanguageOption;
};

export default async function SearchServer({ language }: SearchServerProps) {
	console.time('search')
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
	console.timeEnd('search')


	// we may not have to memo Search or Sort because subsequent navigation (searchParams change) will not cause layout to render again. (This statement is partly correct, since Search and Sort are client components, partial rendering does not apply to them(according to my test))

	return (
		<>
			{/* This route is statically rendered, on subsequent navigation, the props will not be the same, why? (initial load's props !== navigation1's props, navigation1's props !== navigation2's props, i.e. each navigation will cause the props to change, and cause re-render.) */}
			<Search
				generations={generations}
				types={types}
				namesAndIds={pokemonsNamesAndId}
			/>
		</>
	);
}
