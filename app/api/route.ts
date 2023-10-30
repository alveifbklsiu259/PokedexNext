import type{ CachedGeneration, CachedType, CachedAllPokemonNamesAndIds } from "@/app/[language]/_components/pokemonData/pokemonDataSlice";
import { getEndpointData, getData } from "../_utils/api";
import { getIdFromURL } from "../_utils/util";

export async function GET() {
	let generationData: CachedGeneration, typeData: CachedType, pokemonsNamesAndId: CachedAllPokemonNamesAndIds = {};
	// get pokemon count, all names and ids
	const speciesResponse = await getEndpointData('pokemonSpecies');
	for (let pokemon of speciesResponse.results) {
		pokemonsNamesAndId[pokemon.name] = getIdFromURL(pokemon.url);
	};
	
	// get generation
	const generationResponse = await getEndpointData('generation');
	generationData = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

	// get type
	const typeResponse = await getEndpointData('type');
	typeData = await getData('type', typeResponse.results.map(entry => entry.name), 'name');
	
	// return {generationData, typeData, pokemonsNamesAndId}
	return new Response(JSON.stringify({generationData, typeData, pokemonsNamesAndId}));
}