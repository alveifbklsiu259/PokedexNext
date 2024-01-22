import { getEndpointData, getData, GetReturnedDataType, getDataToFetch, sortPokemons } from "@/lib/api";
import { getIdFromURL, getIntersection, getNameByLanguage } from "@/lib/util";
import { LanguageOption, SortOption } from "@/slices/display-slice";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemon,
} from "@/slices/pokemon-data-slice";
import Pokemons from "@/components/pokemons/pokemons";

type PokemonsServer = {
	params: {
		language: LanguageOption;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

const PokemonsServer = async function PokemonsServer({
	params,
	searchParams,
}: PokemonsServer) {
	const { language } = params;
	
	console.time('pokemonsServer')

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

	// names and ids
	const speciesResponse = await getEndpointData("pokemonSpecies");

	let allNamesAndIds: CachedAllPokemonNamesAndIds;
	if (language !== "en") {
		const speices = await getData(
			"pokemonSpecies",
			speciesResponse.results.map((entry) => getIdFromURL(entry.url)),
			"id"
		);
		allNamesAndIds = Object.values(speices).reduce<CachedAllPokemonNamesAndIds>(
			(pre, cur) => {
				pre[getNameByLanguage(cur.name, language, cur)] = cur.id;
				return pre;
			},
			{}
		);
	} else {
		allNamesAndIds =
			speciesResponse.results.reduce<CachedAllPokemonNamesAndIds>(
				(pre, cur) => {
					pre[cur.name] = getIdFromURL(cur.url);
					return pre;
				},
				{}
			);
	}

	// have a early return based on searchPrams?

	const intersection = getIntersection(
		searchParams,
		generations,
		types,
		language
	);
	let sort: SortOption;
	if (Array.isArray(searchParams.sort)) {
		throw new Error("invalid sorting param");
	}
	sort = (searchParams.sort as SortOption) || "numberAsc";

	// refactor getPokemons2, this is the cause for long loading

	let pokemonData: CachedPokemon | undefined, sortedIntersection: number[];
	if (sort === "numberAsc") {
		pokemonData = await getData("pokemon", intersection.slice(0, 24), "id");
		sortedIntersection = intersection;
	} else {
		
		let fetchedPokemons: GetReturnedDataType<'pokemon', []> | undefined,
			pokemonsToDisplay: number[],
			allPokemons = {};
			const isSortByNameOrId = (sort.includes('number') || sort.includes('name'));
		// when sort by options other than number or name, it requires all the pokemon data in intersection to make some comparison.
		if (!isSortByNameOrId) {
			fetchedPokemons = await getData('pokemon', intersection, 'id');
			allPokemons = {...fetchedPokemons};
		};

		sortedIntersection = sortPokemons(allPokemons, sort, allNamesAndIds, intersection).slice();
		pokemonsToDisplay = sortedIntersection.slice().splice(0, 24);

		if (isSortByNameOrId) {
			const pokemonsToFetch = getDataToFetch(allPokemons, pokemonsToDisplay);
			fetchedPokemons = await getData('pokemon', pokemonsToFetch, 'id');
		};
		
		pokemonData = sortedIntersection
			.slice(0, 24)
			.reduce<CachedPokemon>((pre, cur) => {
				pre[cur] = fetchedPokemons![cur];
				return pre;
			}, {});
		
	}

	// if (sort !== 'numberAsc') {
	// 	// the data fetching should prolong the loading content display time, why it instead affect the unresponsiveness of url change??????
	// 	await new Promise(res => setTimeout(() => res('success'), 10000));
	// 	const responses = await Promise.all([...Array(1000).keys()].map(num => fetch(`https://pokeapi.co/api/v2/pokemon/${num + 1}`)));
	// 	const datas = responses.map(res => res.json());

	// 	const data = await Promise.all(datas);


	// };

		// notice that pokemons2 --> pokemons2?xxxx will be slow, but pokemons2?xxx --> pokemons2?xxx will be fast, why>?
	const speciesData = await getData(
		"pokemonSpecies",
		sortedIntersection.slice(0, 24),
		"id"
	);

	console.timeEnd('pokemonsServer')

	return (
		<>
			<Pokemons
				types={types}
				pokemonData={pokemonData!}
				speciesData={speciesData}
				sortedIntersection={sortedIntersection}
			/>
		</>
	);
};

export default PokemonsServer;
