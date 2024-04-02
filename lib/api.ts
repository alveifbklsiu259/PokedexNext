import { getIdFromURL, transformToKeyName, transformToDash, toEndPointString } from "./util";
import { type SortOption } from '@/components/pokemons/sort';
import type { Pokemon, EndPointData, PokemonForm, GetStringOrNumberKey, EvolutionChain, EvolutionChainResponse, CachedPokemon, CachedAbility, CachedAllPokemonNamesAndIds, PokemonDataTypes } from './definitions';

const BASE_URL = 'https://pokeapi.co/api/v2';

export type EndPointRequest = keyof Omit<PokemonDataTypes, 'pokemonCount' | 'allPokemonNamesAndIds'> | 'pokemonForm';

export const getEndpointData = async (dataType: EndPointRequest) => {
	const response = await fetch(`${BASE_URL}/${toEndPointString(dataType)}?limit=99999`, { cache: 'force-cache' });
	const data: EndPointData.Root = await response.json();
	return data;
};

type CachedEntries = Pick<PokemonDataTypes, 'pokemon' | 'pokemonSpecies' | 'ability' | 'move' | 'machine' | 'evolutionChain' | 'item'>;
type CachedData = CachedEntries[keyof CachedEntries];

export const getDataToFetch = <T extends string | number>(cachedData: CachedData, dataToDisplay: T[]): T[] => dataToDisplay.filter(data => !cachedData[data]);

const isFulfilled = <T,>(response: PromiseSettledResult<T>): response is PromiseFulfilledResult<T> => {
	return response.status === 'fulfilled'
};

// CachedEvolutionChain and CachedEvolutionChain[number] is the modified version, not the original response from the API.
type PokemonDataResponseType = {
	[K in keyof PokemonDataTypes]: K extends 'evolutionChain' ? { [chainId: string | number]: EvolutionChainResponse.Root } : PokemonDataTypes[K]
};

type GetStringOrNumberKeysOfUnion<T> = T extends any ? GetStringOrNumberKey<Required<T>> : never;
export type GetReturnedDataType<T extends EndPointRequest, K> = K extends (number | string)[] ? T extends keyof PokemonDataResponseType ? PokemonDataResponseType[T] : { [name: string]: PokemonForm.Root } : T extends keyof PokemonDataResponseType ? PokemonDataResponseType[T][number] : PokemonForm.Root;

export async function getData<T extends EndPointRequest, S extends number | string>(dataType: T, dataToFetch: S): Promise<GetReturnedDataType<T, S>>;
export async function getData<T extends EndPointRequest, S extends number | string, K extends GetStringOrNumberKey<Required<GetReturnedDataType<T, undefined>>>>(dataType: T, dataToFetch: S[], resultKey: K): Promise<GetReturnedDataType<T, S[]>>;
export async function getData<T extends EndPointRequest, S extends number | string, K extends GetStringOrNumberKey<Required<GetReturnedDataType<T, undefined>>>>(dataType: T, dataToFetch: S | S[], resultKey?: K): Promise<GetReturnedDataType<T, S>>;
export async function getData(dataType: EndPointRequest, dataToFetch: (number | string) | (number | string)[], resultKey?: GetStringOrNumberKeysOfUnion<GetReturnedDataType<EndPointRequest, undefined>>): Promise<GetReturnedDataType<EndPointRequest, (number | string) | (number | string)[]>> {
	let request: (number | string)[] = [];
	if (Array.isArray(dataToFetch)) {
		request = dataToFetch.map(element => {
			if (typeof element === "string" && element.includes(BASE_URL)) {
				return getIdFromURL(element);
			} else {
				return element;
			};
		});
	} else {
		if (typeof dataToFetch === 'string' && dataToFetch.includes(BASE_URL)) {
			request = [getIdFromURL(dataToFetch)];
		} else {
			request = [dataToFetch];
		};
	};

	const dataResponses = await Promise.allSettled(request.map(entry => fetch(`${BASE_URL}/${toEndPointString(dataType)}/${entry}`, { cache: 'force-cache' })));
	const finalData: Array<GetReturnedDataType<EndPointRequest, undefined>> = await Promise.all(dataResponses.filter(isFulfilled).map(response => response.value.json()));

	if (resultKey) {
		const returnedData: GetReturnedDataType<EndPointRequest, []> = {};
		if (Array.isArray(dataToFetch)) {
			for (let i of finalData) {
				const key = transformToKeyName(String(i[resultKey as keyof typeof i]));
				returnedData[key] = i;
			};
		} else {
			const data = finalData[0];
			const key = transformToKeyName(String(data[resultKey as keyof typeof data]));
			returnedData[key] = data;
		};
		return returnedData;
	} else {
		return finalData[0];
	};
	// reference: https://stackoverflow.com/questions/69783310/type-is-assignable-to-the-constraint-of-type-t-but-t-could-be-instantiated#:~:text=a%20type%20assertion-,to%20any,-(I%20could%20have
};

export function getAbilitiesToDisplay(pokemonData: Pokemon.Root | Pokemon.Root[]): string[] {
	const data = Array.isArray(pokemonData) ? pokemonData : [pokemonData];
	return [
		...Object.values(data).reduce<Set<string>>((pre, cur) => {
			cur.abilities.forEach(entry => pre.add(transformToKeyName(entry.ability.name)));
			return pre;
		}, new Set())
	];
};

export const getAbilities = async (pokemonData: Pokemon.Root | Pokemon.Root[]) => {
	const abilitiesToDisplay = getAbilitiesToDisplay(pokemonData);
	return await getData('ability', abilitiesToDisplay.map(ability => transformToDash(ability)), 'name');
};

type GetSortField<T extends SortOption> = T extends `${infer A}Asc` ? A : SortOption extends `${infer B}Desc` ? B : never;
type SortField = GetSortField<SortOption>;

export type Stat = Exclude<SortField, "number" | "height" | "name" | "weight">

export const sortPokemons = (allPokemons: CachedPokemon, sortOption: SortOption, allPokemonNamesAndIds: CachedAllPokemonNamesAndIds, request: number[]) => {
	const sortPokemonsByName = () => {
		let sortedNames: string[];
		const sort = sortOption.includes('Asc') ? 'asc' : 'desc';
		if (sort === 'asc') {
			sortedNames = Object.keys(allPokemonNamesAndIds).sort((a, b) => a.localeCompare(b));
		} else {
			sortedNames = Object.keys(allPokemonNamesAndIds).sort((a, b) => b.localeCompare(a));
		};
		return sortedNames.map(name => allPokemonNamesAndIds[name])
			.filter(id => request.includes(id));
	};

	const sortPokemonsByWeightOrHeight = (sortBy: 'weight' | 'height') => {
		let sortedPokemons: Pokemon.Root[];
		const sort = sortOption.includes('Asc') ? 'asc' : 'desc';
		if (sort === 'asc') {
			sortedPokemons = Object.values(allPokemons).sort((a, b) => a[sortBy] - b[sortBy]);
		} else {
			sortedPokemons = Object.values(allPokemons).sort((a, b) => b[sortBy] - a[sortBy]);
		};
		return sortedPokemons.map(pokemon => pokemon.id)
			.filter(id => request.includes(id));
	};

	const sortPokemonsByStat = (stat: Stat) => {
		let sortedPokemons: Pokemon.Root[];
		const getBaseStat = (pokemon: Pokemon.Root) => {
			if (stat === 'total') {
				const total = pokemon.stats.reduce((pre, cur) => pre + cur.base_stat, 0);
				return total;
			} else {
				const statVal = pokemon.stats.find(entry => entry.stat.name === stat)!.base_stat;
				return statVal;
			};
		};
		const sort = sortOption.includes('Asc') ? 'asc' : 'desc';
		if (sort === 'asc') {
			sortedPokemons = Object.values(allPokemons).sort((a, b) => getBaseStat(a) - getBaseStat(b));
		} else {
			sortedPokemons = Object.values(allPokemons).sort((a, b) => getBaseStat(b) - getBaseStat(a));
		};
		return sortedPokemons.map(pokemon => pokemon.id)
			.filter(id => request.includes(id));
	};

	switch (sortOption) {
		case 'numberAsc': {
			return [...request].sort((a, b) => a - b);
		}
		case 'numberDesc': {
			return [...request].sort((a, b) => b - a);
		}
		case 'nameAsc':
		case 'nameDesc': {
			return sortPokemonsByName();
		}
		case 'heightAsc':
		case 'heightDesc': {
			return sortPokemonsByWeightOrHeight('height');
		}
		case 'weightAsc':
		case 'weightDesc': {
			return sortPokemonsByWeightOrHeight('weight');
		}
		default: {
			let stat: Stat;
			if (sortOption.includes('Asc')) {
				stat = sortOption.slice(0, sortOption.indexOf('Asc')) as Stat;
			} else {
				stat = sortOption.slice(0, sortOption.indexOf('Desc')) as Stat;
			};
			return sortPokemonsByStat(stat);
		};
	};
};

export const getEvolutionChains = async (chainId: number) => {
	const evolutionChainResponse = await getData('evolutionChain', chainId);

	// get chains, details
	let evolutionDetails: EvolutionChain.Root['details'] = {};
	let chainIds: { [depth: string]: number }[] = [];
	let index = 0;
	let depth = 1;
	chainIds[index] = {};
	const getIdsFromChain = (chains: EvolutionChainResponse.Chain) => {
		// get details
		if (chains.evolution_details.length) {
			evolutionDetails[getIdFromURL(chains.species.url)] = chains.evolution_details;
		};
		// get ids
		chainIds[index][`depth-${depth}`] = getIdFromURL(chains.species.url);
		if (chains.evolves_to.length) {
			depth++;
			chains.evolves_to.forEach((chain, index, array) => {
				getIdsFromChain(chain);
				// the last chain of each depth
				if (index === array.length - 1) {
					depth--;
				};
			});
		} else {
			if (index !== 0) {
				const minDepth = Number(Object.keys(chainIds[index])[0].split('-')[1]);
				for (let i = 1; i < minDepth; i++) {
					// get pokemon ids from the prvious chain, since they share the same pokemon(s)
					chainIds[index][`depth-${i}`] = chainIds[index - 1][`depth-${i}`];
				};
			};
			index++;
			chainIds[index] = {};
		};
	};
	getIdsFromChain(evolutionChainResponse.chain);
	chainIds.pop();
	// sort chains
	const sortedChains = chainIds.map(chain => {
		// sort based on depth
		const sortedKeys = Object.keys(chain).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
		const sortedChain = sortedKeys.reduce<typeof chain>((previousReturn, currentElement) => {
			previousReturn[currentElement] = chain[currentElement];
			return previousReturn;
		}, {});
		return Object.values(sortedChain);
	});
	return { chains: sortedChains, details: evolutionDetails };
};

export const getItemsFromChain = (chainDetails: EvolutionChain.Root['details']) => {
	const requiredItems: string[] = [];
	Object.values(chainDetails).forEach(evolutionDetails => {
		evolutionDetails.forEach(detail => {
			const item: undefined | string = detail['item']?.name || detail['held_item']?.name;
			if (item) {
				requiredItems.push(item);
			};
		})
	});
	return requiredItems;
};