import { getData, getEndpointData } from "@/lib/api";
import { getIdFromURL, getNameByLanguage, transformToKeyName } from "@/lib/util";
import { i18nNamespaces, type Locale } from "@/i18nConfig";
import Sort from "@/components/pokemons/sort";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemonSpecies,
} from "@/lib/definitions";
import Search from "@/components/pokemons/search";
import ViewMode from "@/components/pokemons/view-mode";
import { Suspense } from "react";
import { SortSkeleton, ViewModeSkeleton } from "@/components/skeletons";
import { initTranslationsServer } from "@/lib/i18n";

type LayoutProps = {
	children: React.ReactNode;
	params: { locale: Locale };
};

export default async function Layout({ children, params }: LayoutProps) {
	const { locale } = params;
	const generationResponse = await getEndpointData("generation");
	const generations = await getData(
		"generation",
		generationResponse.results.map((entry) => entry.name),
		"name"
	);
	const { t } = await initTranslationsServer(locale, i18nNamespaces);

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

	const statResponse = await getEndpointData('stat');
	const statToFetch = statResponse.results.map(data => data.url);
	const [stats, pokemon] = await Promise.all([getData('stat', statToFetch, 'name'), getData('pokemon', 1)]);
	const statsToDisplay = pokemon.stats.map(entry => transformToKeyName(entry.stat.name));
	const statNames = statsToDisplay.reduce<{ [key: string]: string }>((pre, cur) => {
		pre[cur] = getNameByLanguage(
			cur,
			locale,
			stats[cur]
		)
		return pre;
	}, {});

	return (
		<>
			<div className="container mb-5">
				<Search
					generations={generations}
					types={types}
					namesAndIds={pokemonsNamesAndId}
				/>
				<div className="d-flex mb-3">
					<Suspense fallback={<ViewModeSkeleton />}>
						<ViewMode />
					</Suspense>
					<Suspense fallback={<SortSkeleton t={t} />}>
						<Sort statNames={statNames} />
					</Suspense>
				</div>
				<div id="pokemonsContainer">{children}</div>
			</div>
		</>
	);
}