import { Suspense } from "react";
import { getEndpointData, getData } from "@/app/_utils/api";
import Pokemons from "../_components/pokemonData/pokemons";
import Search from "../_components/search/search";
import { CachedAllPokemonNamesAndIds, CachedPokemonSpecies } from "../_components/pokemonData/pokemon-data-slice";
import { LanguageOption } from "../_components/display/display-slice";
import { getIdFromURL, getNameByLanguage } from "@/app/_utils/util";

// this component is still rendered at reuqest time but only ONCE, why?

const languageOptions = {
	en: 'English',
	ja: '日本語',
	// zh_Hant: '繁體中文',
	// zh_Hans: '简体中文',
	// ko: '한국어',
	// fr: 'Français',
	// de: 'Deutsch',
};

export const dynamic = 'force-static'

export async function generateStaticParams() {
	return Object.keys(languageOptions).map(lan => ({
		// language: lan as LanguageOption
		language: lan
	}));
};
export const dynamicParams = false;

type PageProps = {
	params: {
		language: LanguageOption
	}
}


export default async function Page({params}: PageProps) {
	console.log('SEARCH')
	const {language} = params;
	
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



	return (
		<>
			{/* <Suspense fallback={<h1>Loading client Search</h1>}>
				<Search
					generations={generations}
					types={types}
					namesAndIds={pokemonsNamesAndId}
				/>
			</Suspense> */}
			{/* // this suspense will show up if we search --> go back to /en then search again, why? */}
			<Suspense fallback={<h1>Loading client Pokemons</h1>}>
				<Pokemons generations={generations} types={types} />
			</Suspense>
		</>
	);
};
