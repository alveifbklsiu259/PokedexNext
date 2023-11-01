'use client';
import { useEffect, useState } from 'react';
import { CachedGeneration, CachedPokemon, CachedPokemonSpecies, CachedType } from "./pokemon-data-slice"
import BasicInfo from "./basicInfo"
import { LanguageOption, SortOption } from "../display/display-slice";
import Sort from "../display/sort";
import { getData, getDataToFetch } from '@/app/_utils/api';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getIntersection } from '../../page';
import Spinner from '@/app/_components/spinner';
import { flushSync } from 'react-dom';

export type TableInfoRefTypes = {
	sortBy?: SortOption
	page?: number
	rowsPerPage?: number
};


type PokemonsProps = {
	initialPokemonData: CachedPokemon,
	initialSpeciesData: CachedPokemonSpecies,
	language: LanguageOption,
	searchParams: {
		[key: string]: string | string[] | undefined
	},
	generations: CachedGeneration,
	types: CachedType
};

export default function Pokemons({types, generations, initialPokemonData, initialSpeciesData, language, searchParams}: PokemonsProps) {
	const intersection = getIntersection(searchParams, generations, types, language);
	const sortedIntersection = intersection.sort((a, b) => a - b);
	const [isLoading, setIsLoading] = useState(false);
	// const [pokemonData, setPokemonData] = useState(initialPokemonData);
	// const [speciesData, setSpeciesData] = useState(initialSpeciesData);
	const [cachedData, setCachedData] = useState({pokemon: initialPokemonData, species: initialSpeciesData});
	const [display, setDisplay] = useState(sortedIntersection.slice().splice(0, 24));
	const nextRequest = sortedIntersection.slice().splice(display.length, 24);

	const router = useRouter();

	// pokemonData, speciesData for the initial display will be fetched from the server.
	useEffect(() => {
		const getDataOnScroll = async () => {
			if ((window.innerHeight + document.documentElement.scrollTop > document.documentElement.offsetHeight * 0.8) && nextRequest.length && !isLoading) {

				const pokemonsToFetch = getDataToFetch(cachedData.pokemon, nextRequest);
				const speciesToFetch = getDataToFetch(cachedData.species, nextRequest);
				let fetchedPokemons: CachedPokemon | undefined;
				let fetchedSpecies: CachedPokemonSpecies | undefined;


				// solve this problem
				if (pokemonsToFetch.length || speciesToFetch.length) {
					flushSync(()=> {
						setIsLoading(true);
					})
				};

				if (pokemonsToFetch.length) {
					fetchedPokemons = await getData('pokemon', pokemonsToFetch, 'id');
				};
				if (speciesToFetch.length) {
					fetchedSpecies = await getData('pokemonSpecies', speciesToFetch, 'id');
				};


				if ((fetchedPokemons && Object.keys(fetchedPokemons).length) || (fetchedSpecies && Object.keys(fetchedSpecies).length)) {
					setCachedData({pokemon: {...cachedData.pokemon, ...fetchedPokemons}, species: {...cachedData.species, ...fetchedSpecies}});
					setIsLoading(false);
				};
				setDisplay(display => [...display, ...nextRequest]);

			};
		};

		window.addEventListener('scroll', getDataOnScroll);
		return () => {
			window.removeEventListener('scroll', getDataOnScroll);
		}

	}, [nextRequest, isLoading, cachedData]);

	


	// I want to try:
	// 1. cache fetched data on the client myself
	// 2. then use 3-rd party libraries to cache fetch request (swr...)

	// bug:
	// scroll bug
	// when scrollup fetch still gets triggered.



	return (
		<>
			<div className="container">
				{/* <div ref={viewModeRef} className="viewModeContainer">
					<ViewMode tableInfoRef={tableInfoRef} />
				</div> */}
				<Sort />
				<div className="row g-5">
					{Object.values(display).map(id => (
						<div 
							key={id}
							className="col-6 col-md-4 col-lg-3 card pb-3 pokemonCard"
							// onClick={() => navigateToPokemon(navigateIds,['pokemon', 'pokemonSpecies', 'evolutionChain', 'ability', 'item'])}
						>
						{/*  should fetch data in Pokemons or in BasicInfo?  if the data is fetched in Pokemons, multiple requests will be concurrent, if in BasicInfo, we can use suspense, which is better?*/}
							
							{/* Link's children changes when isLoading change, why? but BasicInfo is cached it does not change. */}
							<Link href={`./${language}/pokemon/${id}`}>
								{/* <div onClick={() => handleClick(id)}> */}
								<BasicInfo 
									pokemonData={cachedData.pokemon[id]} 
									language={language} 
									speciesData={cachedData.species[id]} 
									types={types}
								/>
								{/* </div> */}
							</Link>

						</div>
						
					))}
				</div>
			</div>
			{isLoading && (
				<Spinner/>
			)}
		
		</>
	)
};