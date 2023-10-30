// import Moves from "./moves";
// import { getEndpointData, getData, getEvolutionChains, getAbilities2, getItemsFromChain } from "@/app/_utils/api";
// import { getIdFromURL } from "@/app/_utils/util";
// import { LanguageOption } from "../display/displaySlice";
// import { CachedGeneration, CachedMoveDamageClass, CachedPokemon, CachedType, CachedVersion } from "./pokemonDataSlice";
// import { EvolutionChain, PokemonSpecies } from "@/typeModule";

// type MovesWrapperProps = {
// 	id: string ,
// 	language: LanguageOption,
// 	types: CachedType,
// 	versionData: CachedVersion,
// 	generationData: CachedGeneration,
// 	speciesData: PokemonSpecies.Root,
// 	pokemons: CachedPokemon,
// 	chainData: EvolutionChain.Root,
// 	moveDamageClass: CachedMoveDamageClass,
// }

// export default async function MovesWarpper ({
// 	id,
// 	language,
// 	types,
// 	versionData,
// 	generationData,
// 	speciesData,
// 	pokemons,
// 	chainData,
// 	moveDamageClass
// }: MovesWrapperProps) {
	
// 	const pokemonCount = (await getEndpointData('pokemonSpecies')).count;

// 	const pokemonData = await getData('pokemon', id);
// 	// const speciesData = await getData('pokemonSpecies', id);

// 	// evolution chain
// 	const chainId = getIdFromURL(speciesData.evolution_chain.url);
// 	// const chainData = await getEvolutionChains(chainId);


// 	const pokemonsInChain = [...new Set(chainData.chains.flatMap(chain => chain))];
// 	// const pokemons = await getData('pokemon', pokemonsInChain, 'id');
// 	const species = await getData('pokemonSpecies', pokemonsInChain, 'id');

// 	// ability
// 	const abilityData = await getAbilities2(pokemonData);

// 	// item
// 	const requiredItems = getItemsFromChain(chainData.details);
// 	const itemData = await getData('item', requiredItems, 'name');

// 	// stats
// 	const statResponse = await getEndpointData('stat');
// 	const statToFetch = statResponse.results.map(data => data.url);
// 	const stats = await getData('stat', statToFetch, 'name');

// 	// version
// 	const versionResponse = await getEndpointData('version');
// 	const versionToFetch = versionResponse.results.map(data => data.url);
// 	const versions = await getData('version', versionToFetch, 'name');



// 	const movesToFetch = pokemonData.moves.map(entry => entry.move.url);
// 	const moves = await getData('move', movesToFetch, 'name');

// 	return <>
// 		<Moves
// 			id={id}
// 			language={language}
// 			types={types}
// 			versionData={versionData}
// 			moveData={moves}
// 			machines={{}}
// 			generationData={generationData}
// 			speciesData={speciesData}
// 			pokemons={pokemons}
// 			chainData={chainData}
// 			movesDamageClass={moveDamageClass}
		
// 		/>
// 	</>
// }