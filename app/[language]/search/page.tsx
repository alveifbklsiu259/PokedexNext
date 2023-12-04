import { Suspense } from "react";
import { getEndpointData, getData } from "@/app/_utils/api";
import Pokemons from "../_components/pokemonData/pokemons";

// this component is still rendered at reuqest time but only ONCE, why?
export const dynamic = 'force-static'

const languageOptions = {
	en: 'English',
	ja: '日本語',
	// zh_Hant: '繁體中文',
	// zh_Hans: '简体中文',
	// ko: '한국어',
	// fr: 'Français',
	// de: 'Deutsch',
};

export async function generateStaticParams() {
	return Object.keys(languageOptions).map(lan => ({
		// language: lan as LanguageOption
		language: lan
	}));
};
export const dynamicParams = false;



export default async function Page() {
	console.log('SEARCH')
	
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

	return (
		// this suspense will show up if we search --> go back to /en then search again, why?
		<Suspense fallback={<h1>Loading po...</h1>}>
			<Pokemons generations={generations} types={types} />
		</Suspense>
	);
};
