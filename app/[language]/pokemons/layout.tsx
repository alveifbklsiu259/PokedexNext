import { getData, getEndpointData } from "@/lib/api";
import { getIdFromURL, getNameByLanguage } from "@/lib/util";
import { LanguageOption } from "../page";
import Sort from "@/components/pokemons/sort";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemonSpecies,
} from "@/slices/pokemon-data-slice";
import Search from "@/components/pokemons/search";

type LayoutProps = {
	children: React.ReactNode;
	params: { language: LanguageOption };
};

export default async function Layout({ children, params }: LayoutProps) {
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

	// we may not have to memo Search or Sort because subsequent navigation (searchParams change) will not cause layout to render again. (This statement is partly correct, since Search and Sort are client components, partial rendering does not apply to them(according to my test))

	return (
		<>
			{/* This route is statically rendered, on subsequent navigation, the props will not be the same, why? (initial load's props !== navigation1's props, navigation1's props !== navigation2's props, i.e. each navigation will cause the props to change, and cause re-render.) */}
			<div className="container mb-5">
				<Search
					generations={generations}
					types={types}
					namesAndIds={pokemonsNamesAndId}
				/>
				<Sort />
				<div id="pokemonsContainer">
					{children}
				</div>
			</div>
		</>
	);
}

// maybe new path structure e.g.
// /[language]/pokemons?query=xxx
// /[language]/pokemon/1
// so later we can have /[language]/berries, /[language]/items ...

// use route group
// Navigating across multiple root layouts will cause a full page load (as opposed to a client-side navigation). For example, navigating from /cart that uses app/(shop)/layout.js to /blog that uses app/(marketing)/layout.js will cause a full page load. This only applies to multiple root layouts.

// does it affet to non root layout groups?


//   see commit:769df10a


// learn transition --> transition between different routes(route1 --> route2) and within same route (route1 --> route1 or route1 --> route1?q=123)
// learn next + Framer Motion
// startTransition / useTransition
// can transition be used in CSR? (pure React APP)
// what I want is showing stale data when navigation if the destination suspends <Suspense> runs
// can we use Suspense with transition