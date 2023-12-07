import { Suspense } from "react";
import { getData, getEndpointData } from "../_utils/api";
import { getIdFromURL, getNameByLanguage } from "../_utils/util";
import { LanguageOption } from "./_components/display/display-slice";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemonSpecies,
} from "./_components/pokemonData/pokemon-data-slice";
import ServerSearch from "./_components/search/serverSearch";
import Form from "./_components/search/Form";
import PrerenderedSearch from "./_test/PrerenderedSearch";
import Search from "./_components/search/search";
import NewSearch from "./_components/search/newSearch";

type LayoutProps = {
	children: React.ReactNode;
	params: { language: LanguageOption };
};

export default async function Layout({ children, params }: LayoutProps) {
	console.log("/[language].layout.tsx");

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

	// get pokemon count, all names and ids
	const speciesResponse = await getEndpointData("pokemonSpecies");

	let speciesData: CachedPokemonSpecies,
		pokemonsNamesAndId: CachedAllPokemonNamesAndIds;

	if (language !== "en") {
		speciesData = await getData(
			"pokemonSpecies",
			speciesResponse.results.map((entry) => getIdFromURL(entry.url)),
			"id"
		);
		pokemonsNamesAndId = Object.values(
			speciesData
		).reduce<CachedAllPokemonNamesAndIds>((pre, cur) => {
			pre[getNameByLanguage(cur.name, language, cur)] = cur.id;
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

	return (
		<>
			{/* <Suspense fallback={
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
			</Suspense> */}
			{/* 
			<Suspense fallback={<h1>Loading Search</h1>}>
				<Search
					generations={generations}
					types={types}
					namesAndIds={pokemonsNamesAndId}
				/>
			</Suspense> */}

			{/* This route is statically rendered, on subsequent navigation, the props will not be the same, why? (initial load's props !== navigation1's props, navigation1's props !== navigation2's props, i.e. each navigation will cause the props to change, and cause re-render.) */}
			<NewSearch
				generations={generations}
				types={types}
				namesAndIds={pokemonsNamesAndId}
			/>

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
};


// the expected behavior is :
// initial land on / refresh  /[language]: since this route is statically rendered, and it renders some client component that use useSearchParams, but they're wrapped by Suspense, this means that the part that use search params will be only rendered on the client, so they're not rendered on the server, and the initial HTML will show the server rendered result + the fallback of those Suspense.
// the result is as expected.

// initial land on / refresh  /[language]/search: this route is also statically rendered on the server, and it has the smae structure as /[language], but the reuslt is different, it seems that the client parts that use search params do not get suspended, Suspenses' fallback is not triggered, but the client components are rendered immediately.
