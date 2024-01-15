"use client";
import { useEffect, useState, useMemo, memo } from "react";
import type {
	CachedPokemon,
	CachedPokemonSpecies,
	CachedType,
} from "../_components/pokemonData/pokemon-data-slice";
import BasicInfo from "../_components/pokemonData/basicInfo";
import type { LanguageOption } from "../_components/display/display-slice";
import { getData, getDataToFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import Spinner from "@/app/_components/spinner";
import { flushSync } from "react-dom";

type PokemonsProps = {
	pokemonData: CachedPokemon;
	speciesData: CachedPokemonSpecies;
	types: CachedType;
	sortedIntersection: number[];
};

const Pokemons = memo(
	function Pokemons({
		types,
		pokemonData,
		speciesData,
		sortedIntersection,
	}: PokemonsProps) {
		const params = useParams();
		const router = useRouter();
		const { language } = params;

		const [cachedData, setCachedData] = useState({
			pokemon: pokemonData,
			species: speciesData,
		});
		const [loadCount, setLoadCount] = useState(1);

		const display = useMemo(
			() => sortedIntersection.slice().splice(0, 24 * loadCount),
			[sortedIntersection, loadCount]
		);

		const [isScrolling, setIsScrolling] = useState(false);

		const nextRequest = useMemo(
			() => sortedIntersection.slice().splice(loadCount * 24, 24),
			[sortedIntersection, loadCount]
		);
		useEffect(() => {
			const getDataOnScroll = async () => {
				if (
					window.innerHeight + document.documentElement.scrollTop >
						document.documentElement.offsetHeight * 0.98 &&
					nextRequest.length &&
					!isScrolling
				) {
					const pokemonsToFetch = getDataToFetch(
						cachedData.pokemon,
						nextRequest
					);
					const speciesToFetch = getDataToFetch(
						cachedData.species,
						nextRequest
					);
					let fetchedPokemons: CachedPokemon | undefined,
						fetchedSpecies: CachedPokemonSpecies | undefined;

					if (pokemonsToFetch.length || speciesToFetch.length) {
						// change isLoading immediately to make sure the code inside the condtion will not be executed multiple times, because getDataOnScroll can be executed multiple times when scrolling.
						flushSync(() => {
							setIsScrolling(true);
						});
					}

					if (pokemonsToFetch.length) {
						fetchedPokemons = await getData("pokemon", pokemonsToFetch, "id");
					}

					if (speciesToFetch.length) {
						fetchedSpecies = await getData(
							"pokemonSpecies",
							speciesToFetch,
							"id"
						);
					}

					if (
						(fetchedPokemons && Object.keys(fetchedPokemons).length) ||
						(fetchedSpecies && Object.keys(fetchedSpecies).length)
					) {
						setCachedData({
							pokemon: { ...cachedData.pokemon, ...fetchedPokemons },
							species: { ...cachedData.species, ...fetchedSpecies },
						});
					}
					setLoadCount(loadCount + 1);

					setIsScrolling(false);
				}
			};

			window.addEventListener("scroll", getDataOnScroll);
			return () => {
				window.removeEventListener("scroll", getDataOnScroll);
			};
		}, [
			nextRequest,
			isScrolling,
			cachedData,
			setIsScrolling,
			setCachedData,
			setLoadCount,
			loadCount,
		]);

		const handleClick = (id: number) => {
			router.push(`/${language}/pokemon/${id}`);
		};

		let content;

		if (!display.length) {
			content = <p className="text-center">No Matched Pokemons</p>;
		} else {
			content = (
				<>
					{Object.values(display).map((id) => {
						const pokemonData = cachedData.pokemon[id];
						const imgSrc =
							pokemonData.sprites?.other?.["official-artwork"]?.front_default;
						return (
							<div
								key={id}
								className={`col-6 col-md-4 col-lg-3 card pb-3 pokemonCard ${
									!imgSrc ? "justify-content-end" : ""
								}`}
								onClick={() => handleClick(id)}
							>
								<BasicInfo
									pokemonData={pokemonData}
									language={language as LanguageOption}
									speciesData={cachedData.species[id]}
									types={types}
								/>
							</div>
						);
					})}
					{isScrolling && <Spinner />}
				</>
			);
		}

		return (
			<>
				<div className="container">
					<div className="row g-5">{content}</div>
				</div>
			</>
		);
	},
	() => true
);

export default Pokemons;