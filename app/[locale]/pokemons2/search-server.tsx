import { getData, getEndpointData } from "@/lib/api";
import { getIdFromURL, getNameByLanguage } from "@/lib/util";
import { type Locale } from "@/i18nConfig";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemonSpecies,
} from "@/slices/pokemon-data-slice";
import Search from "@/components/pokemons/search";

type SearchServerProps = {
	locale: Locale;
};

export default async function SearchServer({ locale }: SearchServerProps) {
	console.time('search server')
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

	if (locale !== "en") {
		speciesData = await getData(
			"pokemonSpecies",
			speciesResponse.results.map((entry) => getIdFromURL(entry.url)),
			"id"
		);
		pokemonsNamesAndId = Object.values(
			speciesData
		).reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
			pre[getNameByLanguage(cur.name, locale, cur)] = cur.id;
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
	console.timeEnd('search server')

	return (
		<>
			<Search
				generations={generations}
				types={types}
				namesAndIds={pokemonsNamesAndId}
			/>
		</>
	);
}
