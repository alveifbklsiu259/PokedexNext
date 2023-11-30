import Pokemons from "./pokemons";
import { CachedGeneration, CachedType, CachedPokemon, CachedPokemonSpecies, CachedAllPokemonNamesAndIds } from "./pokemon-data-slice";
import { LanguageOption,SortOption  } from "../display/display-slice";
import { getIntersection, getIdFromURL, getNameByLanguage } from "@/app/_utils/util";
import { getPokemons2, getData, getEndpointData } from "@/app/_utils/api";

type PokemonsWrapperProps = {
	generations: CachedGeneration,
	types: CachedType,
	language: LanguageOption,
	searchParams: { [key: string]: string | string[] | undefined }
}

export default async function PokemonsWrapper({generations, types, language, searchParams}: PokemonsWrapperProps) {
	let pokemonData: CachedPokemon = {};
	let speciesData: CachedPokemonSpecies = {};
	const speciesResponse = await getEndpointData('pokemonSpecies');
	const sort = searchParams.sort || 'numberAsc';

	console.log('dynamic')


	let pokemonsNamesAndId = speciesResponse.results.reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
		pre[cur.name] = getIdFromURL(cur.url);
		return pre;
	}, {});

	const intersection = getIntersection(searchParams, generations, types, language);

	const {sortedIntersection, fetchedPokemons} = await getPokemons2(pokemonData, pokemonsNamesAndId ,intersection , sort as SortOption)

	pokemonData = fetchedPokemons!;

	const initialPokemonIds = [...sortedIntersection].splice(0, 24);

	if (language === 'en') {
		speciesData = await getData('pokemonSpecies', initialPokemonIds, 'id');
	} else {
		speciesData = await getData('pokemonSpecies', speciesResponse.results.map(entry => getIdFromURL(entry.url)), 'id');
		pokemonsNamesAndId = Object.values(speciesData).reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
			pre[getNameByLanguage(cur.name, language, cur)] = cur.id;
			return pre;
		}, {});
	};

	return (
		<>
			<Pokemons
				// key={JSON.stringify(searchParams)}
				generations={generations}
				types={types}
				initialPokemonData={pokemonData}
				initialSpeciesData={speciesData}
			/>
		</>
	)
}