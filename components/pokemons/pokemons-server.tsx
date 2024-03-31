import {
	getEndpointData,
	getData,
	GetReturnedDataType,
	getDataToFetch,
	sortPokemons,
	Stat,
} from "@/lib/api";
import {
	getIdFromURL,
	getIntersection,
	getNameByLanguage,
	getStringFromParam,
	transformToKeyName,
} from "@/lib/util";
import { type SortOption } from "./sort";
import { type Locale } from "@/i18nConfig";
import {
	CachedAllPokemonNamesAndIds,
	CachedPokemon,
	CachedPokemonSpecies,
	CachedStat,
} from "@/lib/definitions";
import Pokemons from "@/components/pokemons/pokemons";
import { type View } from "./view-mode";
import PokemonTable from "./pokemons-table";
import Image from "next/image";

type PokemonsServerProps = {
	params: {
		locale: Locale;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

export type PokemonNames =
	| {
		[key: string | number]: string;
	}
	| undefined;

// pokemon table
type Stats = Record<Exclude<Stat, "total">, number>;
export type PokemonTableData = {
	hp: number;
	"special-attack": number;
	"special-defense": number;
	attack: number;
	defense: number;
	speed: number;
	number: JSX.Element;
	name: string;
	type: JSX.Element;
	height: number;
	weight: number;
	total: JSX.Element;
}[];

const PokemonsServer = async function PokemonsServer({
	params,
	searchParams,
}: PokemonsServerProps) {
	const { locale } = params;
	const view = (getStringFromParam(searchParams.view) || "card") as View;

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

	// names and ids
	const speciesResponse = await getEndpointData("pokemonSpecies");

	let allNamesAndIds: CachedAllPokemonNamesAndIds;
	if (locale !== "en") {
		const speices = await getData(
			"pokemonSpecies",
			speciesResponse.results.map((entry) => getIdFromURL(entry.url)),
			"id"
		);
		allNamesAndIds = Object.values(speices).reduce<CachedAllPokemonNamesAndIds>(
			(pre, cur) => {
				pre[getNameByLanguage(cur.name, locale, cur)] = cur.id;
				return pre;
			},
			{}
		);
	} else {
		allNamesAndIds =
			speciesResponse.results.reduce<CachedAllPokemonNamesAndIds>(
				(pre, cur) => {
					pre[cur.name] = getIdFromURL(cur.url);
					return pre;
				},
				{}
			);
	}

	const intersection = getIntersection(
		searchParams,
		generations,
		types,
		locale,
		allNamesAndIds
	);

	const sort = (getStringFromParam(searchParams.sort) ||
		"numberAsc") as SortOption;

	let pokemonData: CachedPokemon,
		sortedIntersection: number[],
		speciesData: CachedPokemonSpecies,
		stats: CachedStat,
		content: React.ReactNode,
		pokemonNames: PokemonNames | undefined;

	if (view === "card") {
		if (sort === "numberAsc") {
			pokemonData = await getData("pokemon", intersection.slice(0, 24), "id");
			sortedIntersection = intersection;
		} else {
			let fetchedPokemons: GetReturnedDataType<"pokemon", []> | undefined,
				pokemonsToDisplay: number[],
				allPokemons = {};
			const isSortByNameOrId = sort.includes("number") || sort.includes("name");
			// when sort by options other than number or name, it requires all the pokemon data in intersection to make some comparison.
			if (!isSortByNameOrId) {
				fetchedPokemons = await getData("pokemon", intersection, "id");
				allPokemons = { ...fetchedPokemons };
			}

			sortedIntersection = sortPokemons(
				allPokemons,
				sort,
				allNamesAndIds,
				intersection
			).slice();
			pokemonsToDisplay = sortedIntersection.slice().splice(0, 24);

			if (isSortByNameOrId) {
				const pokemonsToFetch = getDataToFetch(allPokemons, pokemonsToDisplay);
				fetchedPokemons = await getData("pokemon", pokemonsToFetch, "id");
			}

			pokemonData = sortedIntersection
				.slice(0, 24)
				.reduce<CachedPokemon>((pre, cur) => {
					pre[cur] = fetchedPokemons![cur];
					return pre;
				}, {});
		}
		speciesData = await getData(
			"pokemonSpecies",
			sortedIntersection.slice(0, 24),
			"id"
		);
		content = (
			<Pokemons
				key={JSON.stringify(searchParams)}
				types={types}
				pokemonData={pokemonData!}
				speciesData={speciesData}
				sortedIntersection={sortedIntersection}
			/>
		);
	} else {
		if (locale !== "en") {
			const unresolvedPokemons = getData("pokemon", intersection, "id");
			const unresolvedSpeciesData = getData(
				"pokemonSpecies",
				intersection,
				"id"
			);
			[pokemonData, speciesData] = await Promise.all([
				unresolvedPokemons,
				unresolvedSpeciesData,
			]);
			pokemonNames = Object.keys(speciesData).reduce<
				NonNullable<typeof pokemonNames>
			>((pre, cur) => {
				pre[cur] = getNameByLanguage(
					speciesData[cur].name,
					locale,
					speciesData[cur]
				);
				return pre;
			}, {});
		} else {
			pokemonData = await getData("pokemon", intersection, "id");
		}

		const statResponse = await getEndpointData("stat");
		const statToFetch = statResponse.results.map((data) => data.url);
		stats = await getData("stat", statToFetch, "name");


		// get table data
		const pokemonTableData: PokemonTableData = intersection.map((id) => {
			const pokemon = pokemonData[id];
			const pokemonName = pokemonNames ? pokemonNames[id] : pokemon.name;

			const idContent = (
				// data-value is for sorting
				<div data-value={id} className={`idData idData-${id}`}>
					<div data-tag="allowRowEvents">{String(id).padStart(4, "0")}</div>
					<Image
						width={96}
						height={96}
						data-tag="allowRowEvents"
						src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${[
							id,
						]}.png`}
						alt={pokemonName}
						className="id"
					/>
				</div>
			);
			const typeContent = (
				<div className="typeData">
					{pokemon.types.map((entry) => {
						const type = entry.type.name;
						return (
							<span
								data-tag="allowRowEvents"
								key={type}
								className={`type-${type} type`}
							>
								{getNameByLanguage(type, locale, types[type])}
							</span>
						);
					})}
				</div>
			);

			const total = pokemon.stats.reduce(
				(accumulator, currentVal) => accumulator + currentVal.base_stat,
				0
			);
			const totalContent = (
				<span
					data-tag="allowRowEvents"
					data-value={total}
					className="totalData"
				>
					{total}
				</span>
			);

			const stats = pokemon.stats.reduce<{ [x: string]: number }>(
				(pre, cur) => {
					pre[cur.stat.name] = cur.base_stat;
					return pre;
				},
				{}
			) as Stats;

			const basicInfo = {
				number: idContent,
				name: pokemonName,
				type: typeContent,
				height: pokemon.height * 10,
				weight: (pokemon.weight * 100) / 1000,
				total: totalContent,
			};
			return { ...basicInfo, ...stats };
		});

		const columnHeaders = Object.keys(pokemonTableData[0] || []).reduce<{
			[key: string]: string;
		}>((pre, cur) => {
			pre[cur] = getNameByLanguage(
				cur,
				locale,
				stats[transformToKeyName(cur)]
			);
			return pre;
		}, {});

		content = (
			<PokemonTable data={pokemonTableData} columnHeaders={columnHeaders} />
		);
	}

	return <>{content}</>;
};

export default PokemonsServer;