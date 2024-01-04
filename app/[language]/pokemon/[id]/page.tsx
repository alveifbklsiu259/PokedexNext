// import { getAbilities2, getData, getEndpointData, getEvolutionChains, getItemsFromChain, testServerRequest } from "@/app/_utils/api";
// import Pokemon from "@/app/[language]/_components/pokemonData/pokemon";
// import { LanguageOption, languageOptions } from "@/app/[language]/_components/display/display-slice";
// import { getIdFromURL } from "@/app/_utils/util";

// type PageProps = {
// 	params: {
// 		language: LanguageOption,
// 		id: string
// 	}
// };

// // I can have the /pokemon/x SSR or SSG

// // this is not working
// // export const dynamicParams = false;

// // export async function generateStaticParams() {
// // 	const speciesResponse = await getEndpointData('pokemonSpecies');
// // 	const pokemonCount = speciesResponse.count;

// // 	const staticParams = Object.keys(languageOptions).map(lan => ({
// // 		language: lan,
// // 		id: null
// // 	}));

// // 	// const staticParams: {language: string, id: string}[] = [];

// // 	// const languageOptions2 = {
// // 	// 	'en': 's',
// // 	// }

// // 	// Object.keys(languageOptions2).forEach(lan => {
// // 	// 	for (let i = 1; i <= 100; i ++) {
// // 	// 		staticParams.push({language: lan, id: String(i)});
// // 	// 	};
// // 	// });

// // 	return staticParams;
// // };

// // export const dynamicParams = true;

// // 	Object.keys(languageOptions).forEach(lan => {
// // 		for (let i = 1; i < pokemonCount; i ++) {
// // 			staticParams.push({id: String(i), language: lan});
// // 		};
// // 	});

// // 	console.log(staticParams)

// // export function generateStaticParams() {
// // 	return Object.keys(languageOptions).map(lan => {
// // 		return {
// // 			language: lan
// // 		};
// // 	});
// // };

// // 	// have to handle non-default-form
// // 	return staticParams;
// // };

// export default async function Page({params}: PageProps) {
// 	// requests: ['pokemon', 'pokemonSpecies', 'evolutionChain', 'ability', 'item'], moves

// 	// the current pattern is like the docs says, all or nothing
// 	// https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#:~:text=are%20not%20blocked.-,Blocking,-Data%20Requests%3A
// 	// other approaches are paralle or prefetch. what about streaming?
// 	// if we move the data fetching to the component that needs it, and wrap all of em in a suspense, will i see a lot of spinner?

// 	const {language, id} = params;

// 	const pokemonCount = (await getEndpointData('pokemonSpecies')).count;

// 	const pokemonData = await getData('pokemon', id);
// 	const speciesData = await getData('pokemonSpecies', getIdFromURL(pokemonData.species.url));

// 	// evolution chain
// 	const chainId = getIdFromURL(speciesData.evolution_chain.url);
// 	const chainData = await getEvolutionChains(chainId);

// 	const pokemonsInChain = [...new Set(chainData.chains.flatMap(chain => chain))];
// 	const pokemons = await getData('pokemon', pokemonsInChain, 'id');
// 	const species = await getData('pokemonSpecies', pokemonsInChain, 'id');

// 	// ability
// 	const abilityData = await getAbilities2(pokemonData);

// 	// item
// 	const requiredItems = getItemsFromChain(chainData.details);
// 	const itemData = await getData('item', requiredItems, 'name');

// 	// stats
// 	const statResponse = await getEndpointData('stat');
// 	const statToFetch = statResponse.results.map(data => data.url);
// 	const stats = await getData('stat', statToFetch, 'name');

// 	// version
// 	const versionResponse = await getEndpointData('version');
// 	const versionToFetch = versionResponse.results.map(data => data.url);
// 	const versions = await getData('version', versionToFetch, 'name');

// 	// move-damage-class
// 	const moveDamageClassResponse = await getEndpointData('moveDamageClass');
// 	const moveDamageClassToFetch = moveDamageClassResponse.results.map(data => data.url);
// 	const moveDamageClass = await getData('moveDamageClass', moveDamageClassToFetch, 'name');

// 	// const movesToFetch = pokemonData.moves.map(entry => getIdFromURL(entry.move.url));
// 	// const moves = getData('move', movesToFetch, 'name');

// 	// generation
// 	const generationResponse = await getEndpointData('generation');
// 	const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

// 	// type
// 	const typeResponse = await getEndpointData('type');
// 	const typeData = await getData('type', typeResponse.results.map(entry => entry.name), 'name');
// 	// await testServerRequest();

// 	return (
// 		<Pokemon
// 			language={language}
// 			id={id}
// 			pokemonCount={pokemonCount}
// 			pokemonData={pokemonData}
// 			speciesData={speciesData}
// 			chainId={chainId}
// 			chainData={chainData}
// 			abilityData={abilityData}
// 			itemData={itemData}
// 			typeData={typeData}
// 			stats={stats}
// 			pokemons={pokemons}
// 			generations={generations}
// 			species={species}
// 			versions={versions}
// 			moveDamageClass={moveDamageClass}
// 		/>
// 	);
// };

// // if using context, all the listeners will be client components..., if not, prop drilling...
// // but come to think of it, currently most of the components under /pokemon/xxx are Server component, maybe we can just fetch data in those component instead of passing them down as props.

// // to do :
// // 1. parallel routes for Modal
// // 2. error.tsx
// // 3. 404.tsx
// // 4. pokemon table
// // 5. show loading, if pokemon/x is SSG, it's fast between navigation, but if it's SSR, it lags a bit before navigating.
import {
	getAbilities2,
	getData,
	getEndpointData,
	getEvolutionChains,
	getItemsFromChain,
	testServerRequest,
} from "@/app/_utils/api";
import Pokemon from "@/app/[language]/_components/pokemonData/pokemon";
import {
	LanguageOption,
	languageOptions,
} from "@/app/[language]/_components/display/display-slice";
import { getIdFromURL } from "@/app/_utils/util";
import Link from "next/link";
import { Suspense, memo } from "react";
import Image from "next/image";
import Varieties from "./varieties";
import BasicInfo from "./basicInfo";
import Detail from "./detail";
import Stats from "./stats";
import MovesServer from "./moves-server";
import EvolutionChains from "./evolution-chains";
import { Skeleton, Typography } from "@mui/material";
import { BasicInfoSkeleton, DetailSkeleton, EvolutionChainSkeleton, RelatedPokemonSkeleton, StatsSkeleton } from "@/app/_components/skeleton";

type PageProps = {
	params: {
		language: LanguageOption;
		id: string;
	};
};

// I can have the /pokemon/x SSR or SSG

// this is not working
// export const dynamicParams = false;

// export async function generateStaticParams() {
// 	const speciesResponse = await getEndpointData('pokemonSpecies');
// 	const pokemonCount = speciesResponse.count;

// 	const staticParams = Object.keys(languageOptions).map(lan => ({
// 		language: lan,
// 		id: null
// 	}));

// 	// const staticParams: {language: string, id: string}[] = [];

// 	// const languageOptions2 = {
// 	// 	'en': 's',
// 	// }

// 	// Object.keys(languageOptions2).forEach(lan => {
// 	// 	for (let i = 1; i <= 100; i ++) {
// 	// 		staticParams.push({language: lan, id: String(i)});
// 	// 	};
// 	// });

// 	return staticParams;
// };

// export const dynamicParams = true;

// 	Object.keys(languageOptions).forEach(lan => {
// 		for (let i = 1; i < pokemonCount; i ++) {
// 			staticParams.push({id: String(i), language: lan});
// 		};
// 	});

// 	console.log(staticParams)

// export function generateStaticParams() {
// 	return Object.keys(languageOptions).map(lan => {
// 		return {
// 			language: lan
// 		};
// 	});
// };

// 	// have to handle non-default-form
// 	return staticParams;
// };

export default async function Page({ params }: PageProps) {
	const { language, id } = params;

	// const pokemonData = await getData('pokemon', id);
	// const speciesData = await getData('pokemonSpecies', getIdFromURL(pokemonData.species.url));

	// // evolution chain
	// const chainId = getIdFromURL(speciesData.evolution_chain.url);
	// const chainData = await getEvolutionChains(chainId);

	// const pokemonsInChain = [...new Set(chainData.chains.flatMap(chain => chain))];
	// const pokemons = await getData('pokemon', pokemonsInChain, 'id');
	// const species = await getData('pokemonSpecies', pokemonsInChain, 'id');

	// // ability
	// const abilityData = await getAbilities2(pokemonData);

	// // item
	// const requiredItems = getItemsFromChain(chainData.details);
	// const itemData = await getData('item', requiredItems, 'name');

	// // stats
	// const statResponse = await getEndpointData('stat');
	// const statToFetch = statResponse.results.map(data => data.url);
	// const stats = await getData('stat', statToFetch, 'name');

	// // version
	// const versionResponse = await getEndpointData('version');
	// const versionToFetch = versionResponse.results.map(data => data.url);
	// const versions = await getData('version', versionToFetch, 'name');

	// // move-damage-class
	// const moveDamageClassResponse = await getEndpointData('moveDamageClass');
	// const moveDamageClassToFetch = moveDamageClassResponse.results.map(data => data.url);
	// const moveDamageClass = await getData('moveDamageClass', moveDamageClassToFetch, 'name');

	// // const movesToFetch = pokemonData.moves.map(entry => getIdFromURL(entry.move.url));
	// // const moves = getData('move', movesToFetch, 'name');

	// generation
	console.time('generations')
	const generationResponse = await getEndpointData('generation');
	const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');
	await new Promise(res => setTimeout(() => res('success'), 2000))
	console.timeEnd('generations')

	// // type
	// const typeResponse = await getEndpointData('type');
	// const typeData = await getData('type', typeResponse.results.map(entry => entry.name), 'name');
	// // await testServerRequest();

	const pokemonId = Number(id);

	// check if all the memo in the server components needed?

	return (
		<>
			<Suspense fallback={<RelatedPokemonSkeleton order="previous"/>}>
				<RelatedPokemon pokemonId={pokemonId} order="previous" />
			</Suspense>
			<Suspense fallback={<RelatedPokemonSkeleton order="next"/>}>
				<RelatedPokemon pokemonId={pokemonId} order="next" />
			</Suspense>

			<div className="row justify-content-center mainContainer">
				{/* <Suspense fallback={null}>
					<Varieties language={language} pokemonId={pokemonId} />
				</Suspense>

				<div className="basicInfoContainer row col-8 col-sm-6 justify-content-center">
					<Suspense
						fallback={
							<BasicInfoSkeleton/>
						}
					>
						<BasicInfo language={language} pokemonId={pokemonId} />
					</Suspense>
				</div>
				<div className="detail row text-center col-12 col-sm-6">
					<Suspense fallback={<DetailSkeleton/>}>
						<Detail
							language={language}
							pokemonId={pokemonId}
						/>
					</Suspense>
				</div>
				<Suspense fallback={<StatsSkeleton />}>
					<Stats language={language} pokemonId={pokemonId} />
				</Suspense> */}
				<Suspense fallback={<EvolutionChainSkeleton />}>
					<EvolutionChains
						language={language}
						pokemonId={pokemonId}
						// typeData={typeData}
						// items={itemData}
					/>
				</Suspense>

				<Suspense fallback={<h1>loading moves</h1>}>
					<MovesServer
						pokemonId={pokemonId}
						language={language}
						// reset Moves' states when navigating to pokemon through chains or varieties when the target pokemon's data is cached.
						// key={id}
					/>
				</Suspense>

				{/* this button can be in /pokemon/layout.tsx */}
				<div className="row justify-content-center">
					<div className="w-50 m-3 btn btn-block btn-secondary">
						<Link prefetch={true} href={`/${language}/pokemons`}>
							Explore More Pokemons
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}

type RelatedPokemonProps = {
	pokemonId: number;
	order: "previous" | "next";
};

const RelatedPokemon = memo<RelatedPokemonProps>(async function RelatedPokemon({
	pokemonId,
	order,
}) {
	const pokemonCount = (await getEndpointData("pokemonSpecies")).count;

	const pokemonData = await getData("pokemon", pokemonId);
	const nationalNumber = getIdFromURL(pokemonData.species.url);

	let relatedId;
	if (order === "next") {
		relatedId = nationalNumber === pokemonCount ? 1 : nationalNumber + 1;
	} else {
		relatedId = nationalNumber === 1 ? pokemonCount : nationalNumber - 1;
	}

	return (
		// should read the params then add it to the path
		<Link prefetch={true} href={`./${relatedId}`}>
			<div className={`navigation ${order}`}>
				<span>{String(relatedId).padStart(4, "0")}</span>
				<Image
					width="475"
					height="475"
					src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${relatedId}.png`}
					alt={String(relatedId)}
				/>
			</div>
		</Link>
	);
});

// if using context, all the listeners will be client components..., if not, prop drilling...
// but come to think of it, currently most of the components under /pokemon/xxx are Server component, maybe we can just fetch data in those component instead of passing them down as props.

// to do :
// 1. parallel routes for Modal
// 2. error.tsx
// 3. 404.tsx
// 4. pokemon table
// 5. show loading, if pokemon/x is SSG, it's fast between navigation, but if it's SSR, it lags a bit before navigating.




// if pokemon is dynamic, there're some same data being fetched when navigating to a new /id, but since they're cached, it should be fast.

// just getting chain data can be as slow as almost 800 ms,(but shared chain is fast, about 1x ms), I want this part to be streaming in which means SSG is not an option.
/* 
	const chainId = getIdFromURL(speciesData.evolution_chain.url);
	const chainData = await getEvolutionChains(chainId);
	const pokemonsInChain = [...new Set(chainData.chains.flatMap(chain => chain))];
	const pokemons = await getData('pokemon', pokemonsInChain, 'id');
	const species = await getData('pokemonSpecies', pokemonsInChain, 'id');

*/

// but I think we can still give SSG a shot, maybe we'll encounter build error?


// say if /pokemon/xxx is dynamic, and it fetches generations, types... some commonly used data, when the first time we land on /pokemon/xxx, since it's the first time to fetch, they're not cached, it should take a while, but what if we fetch those data(like the prefetch approach in the Next docs) in a static route(say root layout), will this make the first time landing on /pokemon/xxx faster?