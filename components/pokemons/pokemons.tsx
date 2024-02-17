"use client";
import { useEffect, useState, useMemo, memo } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import type {
	CachedPokemon,
	CachedPokemonSpecies,
	CachedType,
} from "@/slices/pokemon-data-slice";
import { type Locale } from "@/i18nConfig";
import BasicInfo from "../basicInfo";
import { getData, getDataToFetch } from "@/lib/api";
import Spinner from "@/components/spinner";
import { useTransitionRouter } from "../transition-provider";
import { useCurrentLocale } from "@/lib/hooks";

type PokemonsProps = {
	pokemonData: CachedPokemon;
	speciesData: CachedPokemonSpecies;
	types: CachedType;
	sortedIntersection: number[];
};

const Pokemons =
	/*memo(*/
	function Pokemons({
		types,
		pokemonData,
		speciesData,
		sortedIntersection,
	}: PokemonsProps) {
		const [isPending] = useTransitionRouter();
		const currentLocale = useCurrentLocale();
		const router = useRouter();

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
			router.push(`/${currentLocale}/pokemon/${id}`);
		};

		let content;

		if (!display.length) {
			content = <p className="text-center">No Matched Pokemons</p>;
		} else {
			content = (
				<>
					{Object.values(display).map((id, index) => {
						const pokemonData = cachedData.pokemon[id];
						const imgSrc =
							pokemonData.sprites?.other?.["official-artwork"]?.front_default;
						return (
							<div
								key={id}
								className={`col-6 col-md-4 col-lg-3 card pb-3 pokemonCard ${
									!imgSrc ? "justify-content-end" : ""
								}`}
								data-aos={index < 4 ? "flip-left" : ""}
								data-aos-delay={index < 4 && `${index}00`}
								onClick={() => handleClick(id)}
							>
								<BasicInfo
									pokemonData={pokemonData}
									locale={currentLocale as Locale}
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
				<div className={`container ${isPending ? "pending" : "done"}`}>
					<div className="row g-5">{content}</div>
				</div>
			</>
		);
	}; /*,
	() => true
);*/

export default Pokemons;

// change form seleting g1 --> g1, g2 --> g1,g2, g3, even though the data passed down to Pokmeons (still the initial 24 pokemon and species) is the smae, the pokemons component still re-render, any way to prevent it?
// server component renders --> client component (pokemons) renders (but only renders on the client side)
