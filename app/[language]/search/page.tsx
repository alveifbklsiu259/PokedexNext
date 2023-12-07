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

// export const dynamic = 'force-static'

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

/* 
This route renders the same "Pokemons component" as /[language]/page.tsx does, why do we still keep this route?
There're a couple of reasons:
1. I want to shown the initial Pokemons for /[language] for better SEO, this mean that /[language] can be either statically or dynamically rendered.
2. If we don't have another route /[language]/search and just append search params to /[language] when searching pokemons, then:
2-1 if /[language] is dynamically rendered, when we search and navigate to /[language]?query=xxx, this is considered a subsequent navigation, because Pokemons is a client component, it will only render on the client side, but since /[language] is dynamically rendered, each subsequent navigation will also cause /[language]/page.tsx to be rendered on the server again, which is not so good.
2-2 if /[language] is statically rendered, navigating to /[language]?query=xxx will not have the same issue as 2-1, but if we refresh the after searching e.g. /en?query=xxx, the user will see the initial Pokemons (from the fallback), which is also not good.

By having another statically rendered route, we can solve the above two issues (we can sove 2-2 by wrapping Pokemons in /[language]/search in another suspense, and provide a spinner or whatever as fallback, we don't have to worry about SEO, because the initial Pokemons is provided by /[language]'s suspense fallback)
Note: A client component that uses useSearchParams will have different render behaviors depends on whether the route is static or dynamic.

here's another question: what's the point of rendering this route statically on the server? would it be better off if we render this route only on the client side?
first of all, Pokemons need some data, so we have to fetch the data in a server component.
second, what's the point of marking this route as a client component? it will still be statically rendered on the server(client component will also be rendered on the server), which is the same as rendering as a server component.

*/
