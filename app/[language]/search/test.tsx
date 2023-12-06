import { getEndpointData, getData } from "@/app/_utils/api";
import { Suspense } from "react";
import Pokemons from "../_components/pokemonData/pokemons";


export default async function Test() {
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
}