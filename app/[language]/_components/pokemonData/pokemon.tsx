import React, { memo, Suspense } from "react";
import { CachedType, CachedAbility, CachedItem, CachedStat, CachedPokemon, CachedGeneration, CachedPokemonSpecies, CachedVersion, CachedMoveDamageClass } from "./pokemon-data-slice";
import { LanguageOption } from "../display/display-slice";
import BasicInfo from "@/app/[language]/_components/pokemonData/basicInfo";
import Detail from "./detail";
import Stats from "./stats";
import EvolutionChains from "./evolution-chains";
// import ScrollToTop from "@/app/_components/scroll-to-top";
// import Moves from "./moves";
import Varieties from "./varieties";
import Link from "next/link";
import Image from "next/image";
import { EvolutionChain, Pokemon, PokemonSpecies } from "@/typeModule";
import { getIdFromURL } from "@/app/_utils/util";
// import MovesWarpper from "./movesWrapper";
import Spinner from "@/app/_components/spinner";

type PokemonProps = {
	language: LanguageOption,
	id: string,
	pokemonCount: number,
	pokemonData: Pokemon.Root,
	speciesData: PokemonSpecies.Root,
	chainId: number,
	chainData: EvolutionChain.Root,
	abilityData: CachedAbility,
	itemData: CachedItem,
	typeData: CachedType,
	stats: CachedStat,
	pokemons: CachedPokemon,
	generations: CachedGeneration,
	species: CachedPokemonSpecies,
	versions: CachedVersion,
	moveDamageClass: CachedMoveDamageClass
}

export default function Pokemon({
	language,
	id,
	pokemonCount,
	pokemonData,
	speciesData,
	chainId,
	chainData,
	abilityData,
	itemData,
	typeData,
	stats,
	pokemons,
	generations,
	species,
	versions,
	moveDamageClass
}: PokemonProps) {

	// const pokemons = useAppSelector(selectPokemons)
	// enable searching pokemon name in url bar in English.
	// let id = pokeId;
	// if (isNaN(Number(id))) {
	// 	// namesAndIds will always have the english names.
	// 	// if we can't find the corresponding id, use what it is. 
	// 	id = String(namesAndIds[id.toLowerCase()] || Object.values(pokemons).find(pokemon => pokemon.name.toLowerCase() === id.toLowerCase())?.id);
	// };
	
	let content;
	// if (status === 'idle' && isDataReady) {
		const nationalNumber = getIdFromURL(pokemonData.species.url);
		const nextPokemonId = nationalNumber === pokemonCount ? 1 : nationalNumber + 1;
		const previousPokemonId = nationalNumber === 1 ? pokemonCount! : nationalNumber - 1;
		content = (
			<>
				<RelatedPokemon language={language} pokemonId={previousPokemonId} order='previous'/>
				<RelatedPokemon language={language} pokemonId={nextPokemonId} order='next'/>
				<div className={`container p-0 ${speciesData!.varieties.length > 1 ? "marginWithVarieties" : 'marginWithoutVarieties'} `}>
					<div className="row justify-content-center">
						{speciesData.varieties.length > 1 && (
							<Varieties
								language={language}
								pokemonData={pokemonData}
								speciesData={speciesData}
							/>
						)}
						<div className='basicInfoContainer row col-8 col-sm-6 justify-content-center'>
							<BasicInfo pokemonData={pokemonData} language={language} speciesData={speciesData} types={typeData} />
						</div>
						 <Detail
							language={language}
							pokemonData={pokemonData}
							speciesData={speciesData}
							abilityData={abilityData}
						/>
						
						<Stats 
							language={language}
							pokemonData={pokemonData}
							stats={stats}
						/>
						<EvolutionChains
							language={language}
							pokemons={pokemons}
							chainData={chainData}
							species={species}
							generations={generations}
							typeData={typeData}
							chainId={chainId}
							items={itemData}
						/>
						{/* <Suspense fallback={<Spinner />} >
							<MovesWarpper 
								id={id}
								language={language}
								types={typeData}
								versionData={versions}
								generationData={generations}
								speciesData={speciesData}
								pokemons={pokemons}
								chainData={chainData}
								moveDamageClass={moveDamageClass}
								// reset Moves' states when navigating to pokemon through chains or varieties when the target pokemon's data is cached.
								key={id}
							/>
						</Suspense> */}
						<div className="row justify-content-center">
							<div className="w-50 m-3 btn btn-block btn-secondary">
								<Link href={`/${language}`}>Explore More Pokemons</Link>
							</div>
						</div>
					</div>
				</div>
				{/* <ScrollToTop /> */}
			</>
		)
	// } else if (status === 'loading') {
	// 	content = (
	// 		<div style={{position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
	// 			<Spinner />
	// 		</div>
	// 	)
	// } else if (status === 'error') {
	// 	content = (
	// 		<ErrorPage />
	// 	)
	// 	throw new Error('error')
	// };

	return (
		<>
			{content}
		</>
	)
};

type RelatedPokemonProps = {
	language: LanguageOption,
	pokemonId: number
	order: 'previous' | 'next'
}

const RelatedPokemon = memo<RelatedPokemonProps>(function RelatedPokemon ({language, pokemonId, order}) {
	return (
		// should read the params then add it to the path
		<Link href={`./${pokemonId}`}>
			<div className={`navigation ${order}`}>
				<span>{String(pokemonId).padStart(4, '0')}</span>
				<Image width='475' height='475' src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`} alt={String(pokemonId)} />
			</div>
		</Link>
	)
});


// where should I fetch moves/machine? on the server or on the client?

// parallel rendering seems like: fetch data at the smae component at the same time, then wrap one of the component in a Suspense boundry, with this approach, both data are fetched on the server, but the Moves component is client side rendered.
// because the move data is pretty large, can we not fetch it at the beginning?
// like can we wapr the client Moves component in a server Move component, then fetch data in the server Move component?, this way other server components will not be blocked, yet the move data is still fetched from the server? is it good?



// i want to fetch the move's data on the server, but after loading pokemon/xx the upper part, 
// can suspense be used with client component?

// how to preserve search params, does it have to come at the end of the url?, say navigate to en/pokemon/1, wherer should the search params stay