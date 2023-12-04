import { CachedGeneration, CachedType, CachedPokemon, CachedPokemonSpecies, CachedAllPokemonNamesAndIds } from "../_components/pokemonData/pokemon-data-slice";
import { LanguageOption,SortOption  } from "../_components/display/display-slice";
import { getIntersection, getIdFromURL, getNameByLanguage } from "@/app/_utils/util";
import { getPokemons2, getData, getEndpointData } from "@/app/_utils/api";
import {memo, Suspense} from 'react'
import PrerenderedPokemons from "./PrerenderedPokemons";
type PokemonsServerProps = {
	language: LanguageOption,
}

const PokemonsServer = (async function PokemonsServer({language}: PokemonsServerProps) {
	console.time('PokemonsServer')
	
	const speciesResponse = await getEndpointData('pokemonSpecies');

	const generationResponse = await getEndpointData('generation');
	const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

	// types
	const typeResponse = await getEndpointData('type');
	const types = await getData('type', typeResponse.results.map(entry => entry.name), 'name');

	const initialPokemonIds: number[] = [];
	for(let i = 1; i <= 24; i ++) {
		initialPokemonIds.push(i)
	}

	const pokemonData = await getData('pokemon', initialPokemonIds, 'id');
	const speciesData = await getData('pokemonSpecies', initialPokemonIds, 'id');

	console.timeEnd('PokemonsServer')

	return (
		<>
			<Suspense fallback={<h1>loading pokemons</h1>}>
				<PrerenderedPokemons
					// key={JSON.stringify(searchParams)}
					generations={generations}
					types={types}
					initialPokemonData={pokemonData}
					initialSpeciesData={speciesData}
				/>
			</Suspense>
		</>
	)
});

export default PokemonsServer;
// can we wrap a server component with memo, does it make any difference?


// because PokemonsWrapper is dynamically rendered on the server, whenever when change route(searchParams), this will cause the PokemonWrappers to be rendered on the server again, then the client Pokemons will render on the client, this is not the only problem, even PokemonsWrapper is wrapped inside a Suspense, when it is rendered at subsequent request, the Suspense fallback will not be activated, why?

/* 
 ways to fix it:
 1. let suspense run when PokemonsWrapper is rendering on the server
 2. on subsequent request, only render on the client
	(create a new route /s/ which is client component (it can't be a static route, because we need searchParams, and using searchParams will make the route dynamic which will cause the same issue at root) that renders the same content as root except only render the client component, then we're gonna have to handle data fetching in the client component, so there's some change to make to the Search and Pokemons components, 
	2-1 the props passed to them should be the data fetched from the server or undefined
	2-2 those two components have to handle data fetching inside of them 
	or maybe we can put Search in the /[language]'s layout and only refactor Pokemons.)

 */