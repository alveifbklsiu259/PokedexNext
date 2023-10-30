'use client'
import { configureStore } from "@reduxjs/toolkit";
import pokemonDataReducer from '@/app/[language]/_components/pokemonData/pokemonDataSlice';
import searchSliceReducer from "@/app/[language]/_components/search/searchSlice";
import displaySliceReducer from "@/app/[language]/_components/display/displaySlice";

const store = configureStore({
	reducer: {
		pokeData: pokemonDataReducer,
		search: searchSliceReducer,
		display: displaySliceReducer
	},
	middleware: getDefaultMiddleware => getDefaultMiddleware({serializableCheck: false}),
	devTools: {
		actionSanitizer: action => {
			return action.type === 'pokeData/pokemonsLoaded' || action.type === 'pokeData/pokemonSpeciesLoaded' ? { ...action, payload: '<<LONG_BLOB>>' } : action
		},
		stateSanitizer: (state: any) => ({...state, pokeData: {...state.pokeData , pokemon: '<<LONG_BLOB>>', pokemonSpecies: '<<LONG_BLOB>>'}}),
		trace: true
	},
});
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;