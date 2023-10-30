'use client'
import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "@/app/_app/hooks";
import type { RootState } from "@/app/_app/store";
import { getPokemons } from "@/app/_utils/api";
import { getIdFromURL, getNameByLanguage } from "@/app/_utils/util";

export type SelectedGenerations = {
	[name: string]: {
		name: string,
		url: string
	}[]
};


export type SelectedTypes = string[];

type SearchType = {
	searchParam: string
	advancedSearch: {
		generations: SelectedGenerations
		types: SelectedTypes
	}
};

const initialState: SearchType = {
	searchParam: '',
	advancedSearch: {
		generations: {},
		types: [],
	},
};

const searchSlice = createSlice({
	name: 'search',
	initialState,
	reducers: {
		advancedSearchReset: state => {
			// can't just use shallowEqual since advancedSearch contains array/object, it would work if we have a selectAdvancedSearchTypes select thogh, but not selectAdvancedSearchGenerations since it also contains object.
			if (state.advancedSearch.types.length) {
				state.advancedSearch.types = [];
			};
			if (Object.keys(state.advancedSearch.generations).length) {
				state.advancedSearch.generations = {};
			};
			state.searchParam = '';
		},
	},
	extraReducers: builder => {
		builder
			.addCase(searchPokemon.fulfilled, (state, action) => {
				const {searchParam, selectedGenerations, selectedTypes} = action.payload;
				state.advancedSearch.generations = selectedGenerations || state.advancedSearch.generations;
				state.advancedSearch.types = selectedTypes || state.advancedSearch.types;
				state.searchParam = searchParam;
			})
	}
});

type SearchPokemonParamsType = {
	searchParam: string,
	selectedGenerations?: SelectedGenerations,
	selectedTypes?: SelectedTypes,
	matchMethod?: 'all' | 'part'
}

export const searchPokemon = createAppAsyncThunk('search/searchPokemon', async({searchParam, selectedGenerations, selectedTypes, matchMethod}: SearchPokemonParamsType, {dispatch, getState}) => {
	const pokeData = getState().pokeData;
	const dispalyData = getState().display;
	const allNamesAndIds = pokeData.allPokemonNamesAndIds;

	// get range
	let pokemonRange: {
		name: string,
		url: string
	}[] = [];
	// when searching in error page, selectedGenerations will be undefined.
	if (!selectedGenerations || Object.keys(selectedGenerations).length === 0) {
		pokemonRange = Object.values(pokeData.generation).map(gen => gen.pokemon_species).flat();
	} else {
		pokemonRange = Object.values(selectedGenerations).flat();
	};

	// handle search param
	const trimmedText = searchParam.trim();

	let searchResult: typeof pokemonRange;
	if (trimmedText === '') {
		// no input or only contains white space(s)
		searchResult = pokemonRange;
	} else if (isNaN(Number(trimmedText))) {
		// search by name
		const language = dispalyData.language;
		searchResult = pokemonRange.filter(pokemon => {
			if (language === 'en') {
				return pokemon.name.toLowerCase().includes(trimmedText.toLowerCase())
			} else {
				const speciesData = pokeData.pokemonSpecies[getIdFromURL(pokemon.url)]
				return getNameByLanguage(pokemon.name.toLowerCase(), language, speciesData).toLocaleLowerCase().includes(trimmedText.toLowerCase());
			};
		});
	} else {
		// search by id
		searchResult = pokemonRange.filter(pokemon => String(getIdFromURL(pokemon.url)).padStart(4 ,'0').includes(String(trimmedText)));
	};

	// get intersection
	let intersection = searchResult.map(pokemon => getIdFromURL(pokemon.url));

	// handle types
	if (selectedTypes?.length) {
		if (matchMethod === 'all') {
			const matchedTypeArray = selectedTypes.reduce<number[][]>((pre, cur) => {
				pre.push(pokeData.type[cur].pokemon.map(entry => getIdFromURL(entry.pokemon.url)));
				return pre;
			}, []);
			for (let i = 0; i < matchedTypeArray.length; i ++) {
				intersection = intersection.filter(pokemon => matchedTypeArray[i].includes(pokemon));
			};
		} else if (matchMethod === 'part') {
			const matchedTypeIds = selectedTypes.reduce<number[]>((pre, cur) => {
				pokeData.type[cur].pokemon.forEach(entry => pre.push(getIdFromURL(entry.pokemon.url)));
				return pre;
			}, []);
			intersection = intersection.filter(id => matchedTypeIds.includes(id));
		};
	};
	const {fetchedPokemons, pokemonsToDisplay, nextRequest} = await getPokemons(pokeData.pokemon, allNamesAndIds, dispatch, intersection, dispalyData.sortBy);
	return {intersection, searchParam, selectedGenerations, selectedTypes, fetchedPokemons, nextRequest, pokemonsToDisplay};
});

export default searchSlice.reducer;
export const {advancedSearchReset} = searchSlice.actions;
export const selectSearchParam = (state: RootState) => state.search.searchParam;
export const selectAdvancedSearch = (state: RootState) => state.search.advancedSearch;