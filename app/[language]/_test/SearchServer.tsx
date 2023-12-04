
import { CachedAllPokemonNamesAndIds, CachedPokemonSpecies } from "../_components/pokemonData/pokemon-data-slice";
import { getEndpointData, getData } from "@/app/_utils/api";
import { getIdFromURL, getNameByLanguage } from "@/app/_utils/util";
import { LanguageOption } from "../_components/display/display-slice";
import PrerenderedSearch from "./PrerenderedSearch";
import Search from "../_components/search/search";
import { Suspense} from 'react'

type SearchServerProps = {
	language: LanguageOption
};

export default async function SearchServer({language}: SearchServerProps) {
	console.log('SearchServer renders')
	console.time('SerchServer')
	const generationResponse = await getEndpointData('generation');
	const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

	// types
	const typeResponse = await getEndpointData('type');
	const types = await getData('type', typeResponse.results.map(entry => entry.name), 'name');

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
	console.timeEnd('SerchServer')

	return (
		// <PrerenderedSearch
		// 	generations={generations}
		// 	types={types}
		// 	namesAndIds={pokemonsNamesAndId}
		// />
		<Suspense fallback={<h1>Loading client Search</h1>}>
			<Search
				generations={generations}
				types={types}
				namesAndIds={pokemonsNamesAndId}
			/>
		</Suspense>
	)


}