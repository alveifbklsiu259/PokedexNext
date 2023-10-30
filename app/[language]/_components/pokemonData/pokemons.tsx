'use client';
import { useEffect, useState, useRef } from 'react';
import { CachedGeneration, CachedPokemon, CachedPokemonSpecies, CachedType } from "./pokemonDataSlice"
import BasicInfo from "./basicInfo"
import { LanguageOption, SortOption } from "../display/displaySlice";
import Sort from "../display/sort";
import { GetReturnedDataType, getData, getDataToFetch } from '@/app/_utils/api';
import { getIdFromURL } from '@/app/_utils/util';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export type TableInfoRefTypes = {
	sortBy?: SortOption
	page?: number
	rowsPerPage?: number
};

type PokemonsProps = {
	pokemonData: CachedPokemon,
	speciesData: CachedPokemonSpecies,
	language: LanguageOption,
	searchParams: {
		[key: string]: string | string[] | undefined
	},
	generations: CachedGeneration,
	types: CachedType
};


function getArrFromParam (searchParam: string | string[] | undefined): string[] {
	if (!searchParam) {
		return [];
	} else if (Array.isArray(searchParam)) {
		return searchParam.filter(param => param.trim() !== '');
	} else {
		return searchParam.split(',');
	};
};

function getStringFromParam (searchParam: string | string[] | undefined): string {
	if (!searchParam) {
		return '';
	} else if (Array.isArray(searchParam)) {
		return searchParam.join();
	} else {
		return searchParam
	};
};

const getIntersection = (searchParams: PokemonsProps['searchParams'] , generations: CachedGeneration, types: CachedType, language: LanguageOption): number[] => {
	const {query, type, gen, match} = searchParams;
	const selectedTypes = getArrFromParam(type);
	const selectedGenerations = getArrFromParam(gen);
	let matchMethod = getStringFromParam(match);
	matchMethod = matchMethod === '' ? 'all' : matchMethod;
	// should handle cases that user types in unaccessible param value early.


	// get range
	let pokemonRange: {
		name: string,
		url: string
	}[] = [];
	// when searching in error page, selectedGenerations will be undefined.
	if (selectedGenerations.length === 0) {
		pokemonRange = Object.values(generations).flatMap(gen => gen.pokemon_species);
	} else {
		pokemonRange = selectedGenerations.flatMap(gen => generations[`generation_${gen}`].pokemon_species);
	};

	// handle search param
	const trimmedText = getStringFromParam(query).trim();

	let searchResult: typeof pokemonRange;
	if (trimmedText === '') {
		// no input or only contains white space(s)
		searchResult = pokemonRange;
	} else if (isNaN(Number(trimmedText))) {
		// search by name
		searchResult = pokemonRange.filter(pokemon => {
			if (language === 'en') {
				return pokemon.name.toLowerCase().includes(trimmedText.toLowerCase())
			} else {
				// const speciesData = pokeData.pokemonSpecies[getIdFromURL(pokemon.url)]
				// return getNameByLanguage(pokemon.name.toLowerCase(), language, speciesData).toLocaleLowerCase().includes(trimmedText.toLowerCase());

				// handle non-en

			};
		});
	} else {
		// search by id
		searchResult = pokemonRange.filter(pokemon => String(getIdFromURL(pokemon.url)).padStart(4 ,'0').includes(String(trimmedText)));
	};

	// get intersection
	let intersection = searchResult.map(pokemon => getIdFromURL(pokemon.url));

	// handle types
	if (selectedTypes.length) {
		if (matchMethod === 'all') {
			const matchedTypeArray = selectedTypes.reduce<number[][]>((pre, cur) => {
				pre.push(types[cur].pokemon.map(entry => getIdFromURL(entry.pokemon.url)));
				return pre;
			}, []);
			for (let i = 0; i < matchedTypeArray.length; i ++) {
				intersection = intersection.filter(pokemon => matchedTypeArray[i].includes(pokemon));
			};
		} else if (matchMethod === 'part') {
			const matchedTypeIds = selectedTypes.reduce<number[]>((pre, cur) => {
				types[cur].pokemon.forEach(entry => pre.push(getIdFromURL(entry.pokemon.url)));
				return pre;
			}, []);
			intersection = intersection.filter(id => matchedTypeIds.includes(id));
		};
	};
	return intersection;
	// const {fetchedPokemons, pokemonsToDisplay, nextRequest} = await getPokemons(pokeData.pokemon, allNamesAndIds, dispatch, intersection, dispalyData.sortBy);

	// return {intersection, searchParam, selectedGenerations, selectedTypes, fetchedPokemons, nextRequest, pokemonsToDisplay};
};

export default function Pokemons({types, generations, pokemonData, speciesData, language, searchParams}: PokemonsProps) {
	// const [isLoading, setIsLoading] = useState(false);
	const isLoading = useRef(false);
	const [pokeData, setPokeData] = useState(pokemonData);
	const [species, setSpecies] = useState(speciesData);

	const intersection = getIntersection(searchParams, generations, types, language);
	// const intersectionRef = useRef(intersection);
	const sortedIntersection = intersection.sort((a, b) => a - b);

	const [display, setDisplay] = useState([...sortedIntersection].splice(0, 24));
	const nextRequest = [...sortedIntersection].filter(id => !display.includes(id)).splice(0, 24);

	// get intersection based on query/type/generation
	// filter pokemon based on intersection
	// keep dispaly in state the state will probably persists after navigation? or maybe have a client layout and have the state there?
	
	useEffect(() => {
		let fetchedPokemons: GetReturnedDataType<'pokemon', []>;
		let fetchedSpecies: GetReturnedDataType<'pokemonSpecies', []>;

		const getPokemonsOnScroll = async() => {
			const pokemonsToFetch = getDataToFetch(pokeData, nextRequest);
			const speciesToFetch = getDataToFetch(species, nextRequest);
			if (pokemonsToFetch.length) {
				isLoading.current = true;
				fetchedPokemons = await getData('pokemon', pokemonsToFetch, 'id');
			};
			if (speciesToFetch.length) {
				isLoading.current = true;
				fetchedSpecies = await getData('pokemonSpecies', speciesToFetch, 'id');
			};
			setPokeData({...pokeData, ...fetchedPokemons});
			setSpecies({...species, ...fetchedSpecies});
			setDisplay(display => [...intersection].splice(0, display.length + 24)); 
			isLoading.current = false;
		};

		const handleScroll = async () => {
			if (window.innerHeight + document.documentElement.scrollTop > document.documentElement.offsetHeight * 0.8 && isLoading.current === false && nextRequest.length) {
				// console.log(nextRequest)
				await getPokemonsOnScroll();
			};
	
			// if (window.innerHeight + document.documentElement.scrollTop > document.documentElement.offsetHeight * 0.98 && status === 'idle' && nextRequest !== null) {
			// 	dispatch(getPokemonsOnScroll({unresolvedData: unresolvedDataRef.current}));
			// 	unresolvedDataRef.current = null;
			// };
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, [pokeData, species, nextRequest, isLoading.current]);



	// how to use suspense here? or should I do it like before, using spinner?

	const isDataReady = display.every(id => pokeData[id]) && display.every(id => species[id]);

	const content = isDataReady ? (
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
						<Link href={`./${language}/pokemon/${id}`}>


					{/*  should fetch data in Pokemons or in BasicInfo?  if the data is fetched in Pokemons, multiple requests will be concurrent, if in BasicInfo, we can use suspense, which is better?*/}

						<BasicInfo pokemonData={pokeData[id]} language={language} speciesData={species[id]} types={undefined} />
						</Link>

					</div>
					
				))}
			</div>
		</div>
	) : (
		<h1>loading....</h1>
	)



	return (
		<>
			{content}
		</>
	)
};