import { getEndpointData, getData, getPokemons2 } from "@/lib/api";
import {
	getIdFromURL,
	getIntersection,
	getNameByLanguage,
} from "@/lib/util";
import {
	LanguageOption,
	SortOption,
} from "../../_components/display/display-slice";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemon,
	CachedPokemonSpecies,
} from "../../_components/pokemonData/pokemon-data-slice";
import Pokemons from "../pokemons";

// can we export non next-defined things from page/layout...?
// I tried importing languageOptions from other files, but encounter build error(can't get staticParams)

type DynamicPokemonsProps = {
	params: {
		language: LanguageOption;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

// try fetching data concurrently and see if it reduces time
const DynamicPokemons = async function DynamicPokemons({
	params,
	searchParams,
}: DynamicPokemonsProps) {
	console.time("dynamicPokemons");
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
	// const { fetchedPokemons: pokemonData, sortedRequest } = await getPokemons2({}, allNamesAndIds, intersection, sort);

	let pokemonData: CachedPokemon | undefined, sortedIntersection: number[];
	if (sort === "numberAsc") {
		pokemonData = await getData("pokemon", intersection.slice(0, 24), "id");
		sortedIntersection = intersection;
	} else {
		({ fetchedPokemons: pokemonData, sortedRequest: sortedIntersection } =
			await getPokemons2({}, allNamesAndIds, intersection, sort));
		// only pass the first 24 pokemons
		pokemonData = sortedIntersection.slice(0, 24).reduce<CachedPokemon>((pre, cur) => {
			pre[cur] = pokemonData![cur];
			return pre
		}, {});
	};

	const speciesData = await getData(
		"pokemonSpecies",
		sortedIntersection.slice(0, 24),
		"id"
	);

	console.timeEnd("dynamicPokemons");

	// when passing speciesData down(when language !== en, this object will be too big), this can be solved by using graphQL, manually manipulate the object...

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

export default DynamicPokemons;
