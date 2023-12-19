// 'use client';
// import { useEffect, useState, useMemo } from 'react';
// import { CachedGeneration, CachedPokemon, CachedPokemonSpecies, CachedType } from "./pokemon-data-slice"
// import BasicInfo from "./basicInfo"
// import { LanguageOption, SortOption } from "../display/display-slice";
// // import Sort from "../display/sort";
// import { getData, getDataToFetch } from '@/app/_utils/api';
// import { useParams, useSearchParams, useRouter } from 'next/navigation';
// import Spinner from '@/app/_components/spinner';
// import { flushSync } from 'react-dom';
// import { getIdFromURL } from '@/app/_utils/util';
// import dynamic from 'next/dynamic';

// export type TableInfoRefTypes = {
// 	sortBy?: SortOption
// 	page?: number
// 	rowsPerPage?: number
// };

// type PokemonsProps = {
// 	initialPokemonData: CachedPokemon,
// 	initialSpeciesData: CachedPokemonSpecies,
// 	language: LanguageOption,
// 	searchParams: {
// 		[key: string]: string | string[] | undefined
// 	},
// 	generations: CachedGeneration,
// 	types: CachedType,
// 	intersection: number[]
// };

// export default function Pokemons({types, generations, initialPokemonData, initialSpeciesData, language, searchParams, intersection}: PokemonsProps) {
// 	// should we pass searchParams down or use useSearchParams?
// 	// const intersection =  getIntersection(searchParams, generations, types, language);

// 	// should be handled on the server?

// 	// const intersection = intersection.sort((a, b) => a - b);
// 	const [isLoading, setIsLoading] = useState(false);
// 	const [cachedData, setCachedData] = useState({pokemon: initialPokemonData, species: initialSpeciesData});
// 	const [display, setDisplay] = useState(intersection.slice().splice(0, 24));
// 	const nextRequest = intersection.slice().splice(display.length, 24);
// 	// how to cache types, generations

// 	// console.log(cachedData.pokemon)
// 	// console.log(cachedData)
// 	// fix this, this will cause layout shift, currently keeping it for better understanding how client component is rendered on the server
// 	// reference:https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr
// 	// When using React.lazy() and Suspense, Client Components will be pre-rendered (SSR) by default.
// 	// also notice that when scroll down to load new pokemon data and immediately scroll to top, the Sort will disappear for a moment, I think that's because the pokemon data is fetched from the server, and below we have {ssr: false}.
// 	const Sort = dynamic(() => import('../display/sort'), {ssr: false});

// 	const router = useRouter();

// 	// console.log(cachedData.pokemon)
// 	// console.log(initialPokemonData)

// 	const getDataOnScroll = async () => {
// 		if ((window.innerHeight + document.documentElement.scrollTop > document.documentElement.offsetHeight * 0.98) && nextRequest.length && !isLoading) {
// 			const pokemonsToFetch = getDataToFetch(cachedData.pokemon, nextRequest);
// 			const speciesToFetch = getDataToFetch(cachedData.species, nextRequest);
// 			let fetchedPokemons: CachedPokemon | undefined;
// 			let fetchedSpecies: CachedPokemonSpecies | undefined;
// 			// console.log(pokemonsToFetch)
// 			if (pokemonsToFetch.length || speciesToFetch.length) {
// 				// change isLoading immediately to make sure the code inside the condtion will not be executed multiple times, because getDataOnScroll can be executed multiple times when scrolling.
// 				flushSync(() => {
// 					setIsLoading(true);
// 				})
// 			};

// 			if (pokemonsToFetch.length) {
// 				fetchedPokemons = await getData('pokemon', pokemonsToFetch, 'id');
// 			};

// 			if (speciesToFetch.length) {
// 				fetchedSpecies = await getData('pokemonSpecies', speciesToFetch, 'id');
// 			};

// 			if ((fetchedPokemons && Object.keys(fetchedPokemons).length) || (fetchedSpecies && Object.keys(fetchedSpecies).length)) {
// 				setCachedData({pokemon: {...cachedData.pokemon, ...fetchedPokemons}, species: {...cachedData.species, ...fetchedSpecies}});
// 			};

// 			// Since getDataOnScroll will be called multiple times when scrolling, using updater function may accdiently queue multiple updates to the state.
// 			setDisplay([...display, ...nextRequest]);
// 			setIsLoading(false);
// 		};
// 	};
// 	// console.log(intersection)

// 	// synchronizing
// 	useEffect(() => {
// 		if (initialPokemonData !== cachedData.pokemon) {
// 			setCachedData({pokemon: {...initialPokemonData, ...cachedData.pokemon}, species: {...initialSpeciesData, ...cachedData.species}});
// 		};

// 		setDisplay(intersection.slice().splice(0, 24));

// 	}, [searchParams])

// 	// pokemonData, speciesData for the initial display will be fetched from the server.
// 	useEffect(() => {
// 		window.addEventListener('scroll', getDataOnScroll);
// 		return () => {
// 			window.removeEventListener('scroll', getDataOnScroll);
// 		}
// 	}, [getDataOnScroll]);

// 	const handleClick = (id: number) => {
// 		router.push(`./${language}/pokemon/${id}`)
// 	};

// 	// console.log(cachedData.pokemon)

// 	// I want to try:
// 	// 1. cache fetched data on the client myself
// 	// 2. then use 3-rd party libraries to cache fetch request (swr...)
// 	// I think we can actually fetch all pokemons and all species on the server, but when i tried this, it fails very often fetching on the server.

// 	// bug:
// 	// scroll bug
// 	// when scrollup fetch still gets triggered.

// 	return (
// 		<>
// 			<div className="container">
// 				{/* <div ref={viewModeRef} className="viewModeContainer">
// 					<ViewMode tableInfoRef={tableInfoRef} />
// 				</div> */}
// 				<Sort />
// 				<div className="row g-5">
// 					{Object.values(display).map(id => {
// 						const pokemonData = cachedData.pokemon[id];
// 						const imgSrc = pokemonData.sprites?.other?.['official-artwork']?.front_default;
// 						return (
// 							<div
// 								key={id}
// 								className={`col-6 col-md-4 col-lg-3 card pb-3 pokemonCard ${!imgSrc ? 'justify-content-end' : ''}`}
// 								// onClick={() => navigateToPokemon(navigateIds,['pokemon', 'pokemonSpecies', 'evolutionChain', 'ability', 'item'])}
// 								onClick={() => handleClick(id)}
// 							>
// 							{/*  should fetch data in Pokemons or in BasicInfo?  if the data is fetched in Pokemons, multiple requests will be concurrent, if in BasicInfo, we can use suspense, which is better?*/}

// 								{/* Dynamic Routes: prefetch default to automatic. Only the shared layout down until the first loading.js file is prefetched and cached for 30s. This reduces the cost of fetching an entire dynamic route, and it means you can show an instant loading state for better visual feedback to users. */}
// 								{/* Prefetching is not enabled in development, only in production. */}
// 								{/* Link's children changes when isLoading change, why? but BasicInfo is cached it does not change. */}
// 								{/* <Link href={`./${language}/pokemon/${id}`}> */}
// 									{/* <div onClick={() => handleClick(id)}> */}
// 									<BasicInfo
// 										pokemonData={pokemonData}
// 										language={language}
// 										speciesData={cachedData.species[id]}
// 										types={types}
// 									/>
// 									{/* </div> */}
// 								{/* </Link> */}

// 							</div>

// 						)
// 					})}
// 				</div>
// 			</div>
// 			{isLoading && (
// 				<Spinner/>
// 			)}

// 		</>
// 	)
// };

// // if we land on /en, then immediately scroll to end, the getDataOnScroll will not be triggered, and if we have a console.log() when Pokemons component mounts, the log shows up a while after the page loads, is it because when the page loads, it's the static HTML rendered from the server, so the page is actually not hydrated yet, then how can we solve this problem?
// // the same behavior can be observed when we land on /en, then immediately click  show advanced search, it woun't work.

// // does fetched results get cached in SSR route?
"use client";
import { useEffect, useState, useMemo, memo } from "react";
import type {
	CachedAllPokemonNamesAndIds,
	CachedGeneration,
	CachedPokemon,
	CachedPokemonSpecies,
	CachedType,
} from "./pokemon-data-slice";
import BasicInfo from "./basicInfo";
import type { LanguageOption, SortOption } from "../display/display-slice";
import { getData, getDataToFetch, getPokemons2 } from "@/app/_utils/api";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Spinner from "@/app/_components/spinner";
import { flushSync } from "react-dom";
import { getIntersection2 } from "@/app/_utils/util";

export type TableInfoRefTypes = {
	sortBy?: SortOption;
	page?: number;
	rowsPerPage?: number;
};

type PokemonsProps = {
	initialPokemonData?: CachedPokemon;
	initialSpeciesData?: CachedPokemonSpecies;
	allNamesAndIds?: CachedAllPokemonNamesAndIds;
	generations: CachedGeneration;
	types: CachedType;
};

const Pokemons = memo(
	function Pokemons({
		types,
		generations,
		initialPokemonData,
		initialSpeciesData,
		allNamesAndIds,
	}: PokemonsProps) {
		const searchParams = useSearchParams();
		const params = useParams();
		const router = useRouter();
		const { language } = params;

		const query = searchParams.get("query") || "";
		const type = searchParams.get("type") || "";
		const gen = searchParams.get("gen") || "";
		const match = searchParams.get("match") || "";
		const sort = searchParams.get("sort") as SortOption | null;

		const intersection = useMemo(
			() =>
				getIntersection2(
					{ query, type, gen, match },
					generations,
					types,
					language as LanguageOption
				),
			[query, type, gen, match, generations, types, language]
		);
		const [sortedIntersection, setSortedIntersection] = useState(intersection);

		// const [isLoading, setIsLoading] = useState(false);
		const [cachedData, setCachedData] = useState({
			pokemon: initialPokemonData || {},
			species: initialSpeciesData || {},
		});
		const [loadCount, setLoadCount] = useState(1);
		const display = useMemo(
			() => sortedIntersection.slice().splice(0, 24 * loadCount),
			[sortedIntersection, loadCount]
		);
		const isReady = display.every((id) => cachedData.pokemon[id]);

		const isSortByNameOrId = sort ? (sort.includes('number') || sort.includes('name')) : false;
		// const isReady2 = !isSortByNameOrId && (Object.keys(cachedData.pokemon).length !== Object.keys(allNamesAndIds).length);




		const [loadingState, setLoadingState] = useState<
			"idle" | "loading" | "scrolling"
		>(isReady ? "idle" : "loading"); // idle | loading | scrolling

		const nextRequest = useMemo(
			() => sortedIntersection.slice().splice(loadCount * 24, 24),
			[sortedIntersection, loadCount]
		);

		// handle searchParams not accessible cases?
		// the current rendering pattern is, searchparams change --> pokemons renders -- effect runs --> fetch data --> pokemons run again, it would be better if we can fetch data at the same time we change searchParams, maybe use reducer or redux thunk. (I think the reason is because we currently don't have a centralized place to manage state.)

		// attach scroll event
		useEffect(() => {
			const getDataOnScroll = async () => {
				if (
					window.innerHeight + document.documentElement.scrollTop >
						document.documentElement.offsetHeight * 0.98 &&
					nextRequest.length &&
					loadingState === "idle"
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
							// setIsLoading(true);
							setLoadingState("scrolling");
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

					// Since getDataOnScroll will be called multiple times when scrolling, using updater function may accdiently queue multiple updates to the state.
					// setDisplay([...display, ...nextRequest]);
					setLoadCount(loadCount + 1);
					// setIsLoading(false);
					setLoadingState("idle");
				}
			};

			window.addEventListener("scroll", getDataOnScroll);
			return () => {
				window.removeEventListener("scroll", getDataOnScroll);
			};
		}, [
			nextRequest,
			loadingState,
			cachedData,
			setLoadingState,
			setCachedData,
			setLoadCount,
		]);

		const handleClick = (id: number) => {
			router.push(`/${language}/pokemon/${id}`);
		};
		console.log(isReady)
		useEffect(() => {
			const sortPokemons = async () => {
				let fetchedPokemons: CachedPokemon | undefined,
					sortedRequest: number[] | undefined;
				if (sort) {
				console.log('sortPokemons')

					// setIsLoading(true);
					setLoadingState("loading");
					({ fetchedPokemons, sortedRequest } = await getPokemons2(
						cachedData.pokemon,
						allNamesAndIds!,
						intersection,
						sort
					));

					// this is not good, it can be undefined or an empty array(getData)
				}
				if (fetchedPokemons && Object.keys(fetchedPokemons).length) {
					setCachedData((previousCached) => ({
						...previousCached,
						pokemon: { ...previousCached.pokemon, ...fetchedPokemons },
					}));
				}
				// setSortedIntersection((prviousSortedIntersection) =>{
				// 	return  JSON.stringify(prviousSortedIntersection) !== JSON.stringify(sortedRequest) ? sortedRequest! : prviousSortedIntersection
				// });
				setSortedIntersection((prviousSortedIntersection) => {
					return sortedRequest
						? JSON.stringify(prviousSortedIntersection) !==
						  JSON.stringify(sortedRequest)
							? sortedRequest!
							: prviousSortedIntersection
						: intersection;
				});
				// setIsLoading(false);
				setLoadingState("idle");
				setLoadCount(1);
			};
			sortPokemons();
		}, [sort, cachedData, intersection, setLoadingState, setLoadCount, setSortedIntersection, setCachedData]);

		useEffect(() => {
			if (!isReady) {
				console.log(999)
				const getInitialData = async () => {
					const pokemonsToFetch = getDataToFetch(cachedData.pokemon, display);
					const speciesToFetch = getDataToFetch(cachedData.species, display);
					let fetchedPokemons: CachedPokemon | undefined;
					let fetchedSpecies: CachedPokemonSpecies | undefined;

					// seems like there's no need to wrap setIsLoading in a condition, because we have setIsLoadin(true) and setIsLoadin(false), and there's no data fetching, those two setters will be queued in the same render pass, and since setting the state to the same value will not cause a re-render.
					// setIsLoading(true);
					setLoadingState("loading");

					if (pokemonsToFetch) {
						fetchedPokemons = await getData("pokemon", pokemonsToFetch, "id");
					}

					if (speciesToFetch) {
						fetchedSpecies = await getData(
							"pokemonSpecies",
							pokemonsToFetch,
							"id"
						);
					}

					if (fetchedPokemons) {
						setCachedData((previousCachedData) => ({
							...previousCachedData,
							pokemon: { ...previousCachedData.pokemon, ...fetchedPokemons },
						}));
					}

					if (fetchedSpecies) {
						setCachedData((previousCachedData) => ({
							...previousCachedData,
							species: { ...previousCachedData.species, ...fetchedSpecies },
						}));
					}
					// setIsLoading(false)
					setLoadingState("idle");
				};
				getInitialData();
			}
		}, [display, cachedData, isReady]);

		let content;

		if (!display.length) {
			content = <p className="text-center">No Matched Pokemons</p>;
		} else if (loadingState === "loading") {
			content = <Spinner />;
		} else if (loadingState === "idle" || "scrolling") {
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
								// onClick={() => navigateToPokemon(navigateIds,['pokemon', 'pokemonSpecies', 'evolutionChain', 'ability', 'item'])}
								onClick={() => handleClick(id)}
							>
								{/*  should fetch data in Pokemons or in BasicInfo?  if the data is fetched in Pokemons, multiple requests will be concurrent, if in BasicInfo, we can use suspense, which is better?*/}

								{/* Dynamic Routes: prefetch default to automatic. Only the shared layout down until the first loading.js file is prefetched and cached for 30s. This reduces the cost of fetching an entire dynamic route, and it means you can show an instant loading state for better visual feedback to users. */}
								{/* Prefetching is not enabled in development, only in production. */}
								{/* Link's children changes when isLoading change, why? but BasicInfo is cached it does not change. */}
								{/* <Link href={`./${language}/pokemon/${id}`}> */}
								{/* <div onClick={() => handleClick(id)}> */}
								<BasicInfo
									pokemonData={pokemonData}
									language={language as LanguageOption}
									speciesData={cachedData.species[id]}
									types={types}
								/>
								{/* </div> */}
								{/* </Link> */}
							</div>
						);
					})}
					{loadingState === "scrolling" && <Spinner />}
				</>
			);
		} else {
			content = "???";
		}

		return (
			<>
				<div className="container">
					{/* <div ref={viewModeRef} className="viewModeContainer">
					<ViewMode tableInfoRef={tableInfoRef} />
				</div> */}
					<div className="row g-5">{content}</div>
				</div>
				{/* {isLoading && (
				<Spinner/>
			)} */}
			</>
		);
	},
	() => true
);

// if the memo is removed, when we change generations, types and search, the display will be stale, but using memo will fix it why?
export default Pokemons;

// if we land on /en, then immediately scroll to end, the getDataOnScroll will not be triggered, and if we have a console.log() when Pokemons component mounts, the log shows up a while after the page loads, is it because when the page loads, it's the static HTML rendered from the server, so the page is actually not hydrated yet, then how can we solve this problem?
// the same behavior can be observed when we land on /en, then immediately click  show advanced search, it woun't work.

// does fetched results get cached in SSR route?

// useSearchParams is the cause why even though /[language] is statically rendered, the loading.tsx still runs on initial visit/refrsh
// because Pokemons is rendered on the client,even though data is fetched instantly, browser still have to wait for Pokemons to be rendered on the client side(which means we have to download the JS files --> reconcile/hydrate the page --> then the content will be shown, if you check the build profiler, you'll see that during the initial visit, Pokemons is rendered on the client, and also if you check network, you'll see that a lot of JS files have been downloaded, then a while (rendering) later the content will be shown)
// (so, using useSearchParams will cause a component to be rendered on the client, does that mean this is just like pure CSR? which is bad for SEO? if it's true, should we avoid using searchParams as a technique to manage state?)
// If a route is statically rendered, calling useSearchParams() will cause the tree up to the closest Suspense boundary to be client-side rendered. This allows a part of the page to be statically rendered while the dynamic part that uses searchParams is client-side rendered.
// reference: https://nextjs.org/docs/app/api-reference/functions/use-search-params
// can we further divide this component to only a small part that reads searchParams/params? so other part can still be statically rendered.

// I want to try:
// 1. cache fetched data on the client myself
// 2. then use 3-rd party libraries to cache fetch request (swr...)
// I think we can actually fetch all pokemons and all species on the server, but when i tried this, it fails very often fetching on the server.

// bug:
// scroll bug
// when scrollup fetch still gets triggered.

// unknown behavior:
// props passed from server component to client component will not be the same between navigations.
// memo behaves differently when used with server component and useSearchParams

// fix this, this will cause layout shift, currently keeping it for better understanding how client component is rendered on the server
// reference:https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading#skipping-ssr
// When using React.lazy() and Suspense, Client Components will be pre-rendered (SSR) by default.
// also notice that when scroll down to load new pokemon data and immediately scroll to top, the Sort will disappear for a moment, I think that's because the pokemon data is fetched from the server, and below we have {ssr: false}.
// const Sort = dynamic(() => import('../display/sort'), {ssr: false});
