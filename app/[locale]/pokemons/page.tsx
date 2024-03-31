import { getEndpointData, getData } from "@/lib/api";
import Pokemons from "@/components/pokemons/pokemons";
import i18nConfig from "@/i18nConfig";

export async function generateStaticParams() {
	return i18nConfig.locales.map(locale => ({ locale }));
}
export const dynamicParams = false;

export default async function Page() {
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
	const initialRequestIds = [...Array(24).keys()].map(num => num + 1);
	const pokemonData = await getData("pokemon", initialRequestIds, "id");
	const speciesData = await getData("pokemonSpecies", initialRequestIds, "id");
	const pokemonCount = Object.values(generations).reduce((pre, cur) => {
		return pre + cur.pokemon_species.length
	}, 0);
	const intersection = [...Array(pokemonCount).keys()].map(n => n + 1);

	return (
		<>
			<Pokemons
				sortedIntersection={intersection}
				types={types}
				pokemonData={pokemonData}
				speciesData={speciesData}
			/>
		</>
	);
}