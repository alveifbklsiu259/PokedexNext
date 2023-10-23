'use client'
import { useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch, type TypedUseSelectorHook } from "react-redux";
import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "./store";
import { type LanguageOption, selectLanguage, dataLoading } from "../_components/display/displaySlice";
import { type GetRequiredData, CachedPokemon, getRequiredDataThunk } from "../_components/pokemonData/pokemonDataSlice";
import { getRequiredData, getData } from '../_utils/api';


export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState,
	dispatch: AppDispatch,
	rejectValue: string
}>();

type Request = GetRequiredData.Request;

type PrefetchOnNavigation = ((requestPokemonIds: number[], requests: Request[], lang?: LanguageOption) => void);
type NavigationUnresolvedDataRef = React.MutableRefObject<Promise<GetRequiredData.FetchedData> | null>;
type PrefetchOnScroll = ((pokemonsToFetch: number[])=> void);
type ScrollUnresolvedDataRef = React.MutableRefObject<Promise<CachedPokemon> | null>;

export function usePrefetch<T extends 'scroll' | 'navigation'>(action: T): T extends 'navigation' ? [NavigationUnresolvedDataRef, PrefetchOnNavigation] : [ScrollUnresolvedDataRef, PrefetchOnScroll];
export function usePrefetch(action: 'scroll' | 'navigation'): [NavigationUnresolvedDataRef, PrefetchOnNavigation] | [ScrollUnresolvedDataRef, PrefetchOnScroll] {
	const unresolvedDataRef = useRef<Promise<GetRequiredData.FetchedData> | Promise<CachedPokemon> | null>(null);
	const pokeData = useAppSelector(state => state.pokeData);
	const language = useAppSelector(selectLanguage);
	// let prefetch: PrefetchOnScroll | PrefetchOnNavigation;
	let prefetch: typeof action extends 'scroll' ? PrefetchOnScroll : PrefetchOnNavigation;

	if (action === 'navigation') {
		prefetch = (requestPokemonIds, requests, lang = language) => {
			unresolvedDataRef.current = getRequiredData(pokeData, requestPokemonIds, requests, lang);
		};
	} else {
		prefetch = (pokemonsToFetch) => {
			unresolvedDataRef.current = getData('pokemon', pokemonsToFetch, 'id');
		};
	};
	return [unresolvedDataRef, prefetch];
};

export function useNavigateToPokemon() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	
	const navigateToPokemon = useCallback(async (requestPokemonIds: number[], requests: Request[], lang?: LanguageOption, unresolvedData?: Promise<GetRequiredData.FetchedData>) => {
		if (unresolvedData) {
			dispatch(dataLoading());
			const fetchedData = await unresolvedData;
			dispatch(getRequiredDataThunk.fulfilled({fetchedData}, 'pokeData/getRequiredData', {requestPokemonIds: [], requests: []}));
		} else {
			dispatch(getRequiredDataThunk({requestPokemonIds, requests, language: lang}));
		};
		router.push(`/pokemons/${requestPokemonIds[0]}`);
	}, [dispatch, router]);

	return navigateToPokemon;
};