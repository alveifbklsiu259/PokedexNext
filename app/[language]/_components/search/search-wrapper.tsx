'use client';
import { CachedAllPokemonNamesAndIds, CachedGeneration, CachedType } from "../pokemonData/pokemon-data-slice";
import Search from "./search";


type SearchWrapperProps = {
	generations: CachedGeneration,
	types: CachedType,
    namesAndIds: CachedAllPokemonNamesAndIds
};

export default function SearchWrapper({generations, types, namesAndIds}: SearchWrapperProps) {
    return <Search generations={generations} types={types} namesAndIds={namesAndIds}/>
};