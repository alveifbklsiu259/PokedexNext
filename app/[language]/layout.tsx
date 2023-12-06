import { Suspense } from "react";
import { getData, getEndpointData } from "../_utils/api";
import { getIdFromURL, getNameByLanguage } from "../_utils/util";
import { LanguageOption } from "./_components/display/display-slice";
import { CachedAllPokemonNamesAndIds, CachedPokemonSpecies } from "./_components/pokemonData/pokemon-data-slice";
import ServerSearch from "./_components/search/serverSearch";
import Form from "./_components/search/Form";
import PrerenderedSearch from "./_test/PrerenderedSearch";
import Search from "./_components/search/search";

type LayoutProps = {
	children: React.ReactNode;
	params: {language: LanguageOption}
};

export default async function Layout({ children, params }: LayoutProps) {
	console.log('/[language].layout.tsx')

	const {language} = params;

	const generationResponse = await getEndpointData('generation');
	const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

	// types
	const typeResponse = await getEndpointData('type');
	const types = await getData('type', typeResponse.results.map(entry => entry.name), 'name');

	// get pokemon count, all names and ids
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
			<Suspense fallback={
				<PrerenderedSearch
					generations={generations}
					types={types}
					namesAndIds={pokemonsNamesAndId}
				/>
			}>
				<Search
					generations={generations}
					types={types}
					namesAndIds={pokemonsNamesAndId}
				/>
			</Suspense>
			{/* <ServerSearch>
				<Suspense fallback={null}>
					<Form 
						generations={generations}
						types={types}
						namesAndIds={pokemonsNamesAndId}
					/>
				</Suspense>
			</ServerSearch> */}

			{children}
		</>
	);
}
