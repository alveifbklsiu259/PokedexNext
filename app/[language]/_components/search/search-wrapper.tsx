import { CachedGeneration, CachedType, CachedPokemonSpecies, CachedAllPokemonNamesAndIds } from "../pokemonData/pokemon-data-slice";
import { getEndpointData, getData } from "@/app/_utils/api";
import { getIdFromURL, getNameByLanguage } from "@/app/_utils/util";
import { LanguageOption } from "../display/display-slice";
import Search from "./search";

type SearchWrapperProps = {
	generations: CachedGeneration,
	types: CachedType,
	language: LanguageOption
};

export default async function SearchWrapper({generations, types, language}: SearchWrapperProps) {

	// get pokemon count, all names and ids
	const speciesResponse = await getEndpointData('pokemonSpecies');

	let speciesData: CachedPokemonSpecies, pokemonsNamesAndId: CachedAllPokemonNamesAndIds;
	if (language !== 'en') {
		speciesData = await getData('pokemonSpecies', speciesResponse.results.map(entry => getIdFromURL(entry.url)), 'id');
		pokemonsNamesAndId = Object.values(speciesData).reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
			pre[getNameByLanguage(cur.name, language, cur)] = cur.id;
			return pre;
		}, {});
	} else {
		pokemonsNamesAndId = speciesResponse.results.reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
			pre[cur.name] = getIdFromURL(cur.url);
			return pre;
		}, {});
	};

	return (
		<Search
			generations={generations}
			types={types}
			namesAndIds={pokemonsNamesAndId}
		/>
	)


}