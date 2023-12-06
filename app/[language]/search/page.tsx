import { Suspense } from "react";
import { getEndpointData, getData } from "@/app/_utils/api";
import Pokemons from "../_components/pokemonData/pokemons";

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

export default async function Page() {
	console.log('/[language]/search/page.tsx')

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
		<>
		{/* because the route is statically rendered on the server, Pokemons uses useSearchParams and makes it only render on the client, this is why this Suspense gets fired
		// The special file loading.js helps you create meaningful Loading UI with React Suspense. With this convention, you can show an instant loading state from the server while the content of a route segment loads. The new content is automatically swapped in once rendering is complete.
		*/}
			<Suspense  fallback={<h1>Loading client Pokemons</h1>}>
				<Pokemons generations={generations} types={types} />
			</Suspense>
		</>
	);
};


// what's the point of rendering this route statically on the server? would it be better if we render this route only on the client side?