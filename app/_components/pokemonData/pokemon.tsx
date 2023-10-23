'use client'
import React, { useEffect, memo, useMemo } from "react";
import { selectSpeciesById, selectChainDataByChainId, selectAllIdsAndNames, selectPokemonCount, getRequiredDataThunk, selectPokemons } from "./pokemonDataSlice";
import { selectStatus, error } from "../display/displaySlice";
import BasicInfo from "./basicInfo";
import Detail from "./detail";
import Stats from "./stats";
import EvolutionChains from "./evolutionChains";
import Spinner from "../spinner";
import ScrollToTop from "../scrollToTop";
import Moves from "./moves";
import ErrorPage from "../errorPage";
import Varieties from "./varieties";
import PrefetchOnNavigation from "../prefetchOnNavigation";
import { getIdFromURL } from "../../_utils/util";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "../../_app/hooks";
import { Pokemon as PokemonType } from "../../../typeModule";
import Image from "next/image";

type PokemonProps = {
	pokeId: string
}

export default function Pokemon({pokeId}: PokemonProps) {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const status = useAppSelector(selectStatus);
	const namesAndIds = useAppSelector(selectAllIdsAndNames);
	const pokemonCount = useAppSelector(selectPokemonCount);
	const pokemons = useAppSelector(selectPokemons)
	// enable searching pokemon name in url bar in English.
	let id = pokeId;
	if (isNaN(Number(id))) {
		// namesAndIds will always have the english names.
		// if we can't find the corresponding id, use what it is. 
		id = String(namesAndIds[id.toLowerCase()] || Object.values(pokemons).find(pokemon => pokemon.name.toLowerCase() === id.toLowerCase())?.id);
	};
	
	const pokemon = pokemons[id] as PokemonType.Root | undefined;
	const speciesData = useAppSelector(state => selectSpeciesById(state, id));
	const chainId = getIdFromURL(speciesData?.evolution_chain?.url);
	const chainData = useAppSelector(state => selectChainDataByChainId(state, chainId));
	const isDataReady = [pokemon, speciesData, chainData].every(Boolean);

	useEffect(() => {
		if (!isDataReady && status === 'idle') {
			const getPokemonData = async () => {
				try {
					await dispatch(getRequiredDataThunk({
						requestPokemonIds: [id],
						requests: ['pokemon', 'pokemonSpecies', 'evolutionChain', 'ability', 'item']
					})).unwrap();
				} catch(err) {
					console.error(err)
					dispatch(error());
				};
			}
			getPokemonData();
		};
	}, [dispatch, isDataReady, id, status]);

	const rootLink = useMemo(() => <div onClick={() => router.push('/')} className="w-50 m-3 btn btn-block btn-secondary">Explore More Pokemons</div>, [router]);

	let content;
	if (status === 'idle' && isDataReady) {
		const nationalNumber = getIdFromURL(pokemon!.species.url);
		const nextPokemonId = nationalNumber === pokemonCount ? 1 : nationalNumber + 1;
		const previousPokemonId = nationalNumber === 1 ? pokemonCount! : nationalNumber - 1;
		content = (
			<>
				<RelatedPokemon pokemonId={previousPokemonId} order='previous'/>
				<RelatedPokemon pokemonId={nextPokemonId} order='next'/>
				<div className={`container p-0 ${speciesData!.varieties.length > 1 ? "marginWithVarieties" : 'marginWithoutVarieties'} `}>
					<div className="row justify-content-center">
						{speciesData!.varieties.length > 1 && (
							<Varieties pokeId={id} />
						)}
						<div className='basicInfoContainer row col-8 col-sm-6 justify-content-center'>
							<BasicInfo pokeId={id} />
						</div>
						<Detail pokeId={id} />
						<Stats pokeId={id} />
						<EvolutionChains chainId={chainId!} />
						<Moves
							pokeId={id}
							chainId={chainId!}
							// reset Moves' states when navigating to pokemon through chains or varieties when the target pokemon's data is cached.
							key={pokemon!.id}
						/>
						<div className="row justify-content-center">
							{rootLink}
						</div>
					</div>
				</div>
				<ScrollToTop />
			</>
		)
	} else if (status === 'loading') {
		content = (
			<div style={{position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)'}}>
				<Spinner />
			</div>
		)
	} else if (status === 'error') {
		content = (
			<ErrorPage />
		)
		throw new Error('error')
	};

	return (
		<>
			{content}
		</>
	)
};

type RelatedPokemonProps = {
	pokemonId: number
	order: 'previous' | 'next'
}

const RelatedPokemon = memo<RelatedPokemonProps>(function RelatedPokemon ({pokemonId, order}) {
	return (
		<PrefetchOnNavigation
			requestPokemonIds={pokemonId}
			customClass={`navigation ${order} `}
		>
			<span>{String(pokemonId).padStart(4, '0')}</span>
			<Image width='475' height='475' src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`} alt={String(pokemonId)} />
		</PrefetchOnNavigation>
	)
});