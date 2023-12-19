import { ReadonlyURLSearchParams } from "next/navigation";
import type { Pokemon, PokemonSpecies } from "../../typeModule";
import { LanguageOption } from "../[language]/_components/display/display-slice";
import type { EndPointRequest } from "./api";
import { CachedGeneration, CachedType } from "../[language]/_components/pokemonData/pokemon-data-slice";

export function getIdFromURL<T extends string | undefined>(url: T): T extends string ? number : undefined;
export function getIdFromURL(url: string | undefined): number | undefined {
	return url ? Number(url.slice(url.lastIndexOf('/', url.lastIndexOf('/') - 1) + 1, url.lastIndexOf('/'))) : undefined;
};

export function transformToKeyName<T extends string | undefined>(name: T): T extends string ? string : undefined;
export function transformToKeyName(name: string | undefined): string | undefined {
	return name ? name.replaceAll('-', '_') : undefined;
};

export function transformToDash<T extends string | undefined>(name: T): T extends string ? string : undefined;
export function transformToDash (name: string | undefined): string | undefined {
	return name ? name.replaceAll('_', '-') : undefined;
};

type NameInstance = PokemonSpecies.Name

type NameEntries = {
	names: NameInstance[],
	form_names?: NameInstance[]
} | undefined

type GetNameByLanguage = {
	(defaultName: string, language: LanguageOption, entries: NameEntries | undefined): string
}
export const getNameByLanguage: GetNameByLanguage = (defaultName, language, entries) => {
	if (!entries) {
		return defaultName;
	} else {
		const getMatchName = (lang: typeof language | 'ja-Hrkt') => (entries['form_names'] || entries.names).find(entry => entry.language.name === transformToDash(lang))?.name;
		return getMatchName(language) ? getMatchName(language)! : language === 'ja' ? getMatchName('ja-Hrkt') || defaultName : defaultName;
	};
};

export const getFormName = (speciesData: PokemonSpecies.Root | undefined, language: LanguageOption, pokemonData: Pokemon.Root) => {
	let pokemonName = getNameByLanguage(pokemonData.name, language, speciesData);
	let formName: string;

	if (!pokemonData.is_default) {
		if (pokemonData.formData) {
			formName = getNameByLanguage(pokemonData.formData.form_name, language, pokemonData.formData);
		} else {
			formName = pokemonData.name;
		};
		
		if (formName.toLowerCase().includes(pokemonName.toLowerCase())) {
			pokemonName = formName;
		} else {
			pokemonName = pokemonName.concat(`(${formName})`);
		};
	};
	return pokemonName;
};

type Version = {
	name: string,
	url: string
}

type BaseEntry = {
	language: {
		name: string,
		url: string
	},
};

type FlavorTextInstance = BaseEntry & {
	flavor_text: string,
	version?: Version
	version_group?: Version
}

type EffectInstance = BaseEntry & {
	effect: string
}

export function getTextByLanguage<T extends FlavorTextInstance | EffectInstance>(language: LanguageOption, entries: T[], dataType: Extract<keyof T, 'flavor_text' | 'effect'>, version?: T extends FlavorTextInstance ? string : never): string {
	let result: string = '';
	const getText = (language: LanguageOption): string | undefined => {
		const ignoreVersion = entries.find(entry => entry.language.name === transformToDash(language))?.[dataType] as string | undefined;
		
		if (version) {
			return (entries).find(entry => entry.language.name === transformToDash(language) && (entry as FlavorTextInstance)?.version_group?.name === version)?.[dataType] as string | undefined || ignoreVersion;
		} else {
			return ignoreVersion;
		};
	};
	result = getText(language) || getText('en') || 'No Data To Show';

	if (language === 'ja' || language === 'zh_Hant' || language === 'zh_Hans') {
		result = result?.replace(/　|\n/g, '');
	};

	return result;
};

export function toEndPointString(str: EndPointRequest) {
	let endPointString: string = '';
	const characters = str.split('');
	for (let i = 0; i < characters.length; i++ ) {
		if (characters[i] !== '-' && characters[i] === characters[i].toUpperCase()) {
			endPointString += `-${characters[i].toLowerCase()}`
		} else {
			endPointString += characters[i];
		};
	};
	return endPointString;
};

// export const updateSearchParam = (searchParams: ReadonlyURLSearchParams, key: string, value: string): string => {
// 	const params = new URLSearchParams(searchParams);
// 	params.set(key, value);
// 	return params.toString();
// };
export const updateSearchParam = (searchParams: ReadonlyURLSearchParams, newParams: {
	[key: string]: string
}): string => {
	const params = new URLSearchParams(searchParams);
	const keyValuePairs = Object.entries(newParams);
	for (let i = 0; i < keyValuePairs.length; i++) {
		const [key, value] = keyValuePairs[i];
		if (value === '') {
			params.delete(key);
		} else {
			params.set(key, value);
		};
	};
	return params.toString();
};

export const updateSearchParam2 = (newParams: {
	[key: string]: string
}): string => {

	let newSearchParams: string = '';
	Object.keys(newParams).forEach(params => {
		if (newParams[params] !== '') {
			newSearchParams += `${params}=${newParams[params]}`;
		};
	});

	return newSearchParams;
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

export const getIntersection = (searchParams: {[key: string]: string | string[] | undefined} , generations: CachedGeneration, types: CachedType, language: LanguageOption): number[] => {
	const {query, type, gen, match, sort} = searchParams;
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
	return intersection.sort((a, b) => a - b);
	// const {fetchedPokemons, pokemonsToDisplay, nextRequest} = await getPokemons(pokeData.pokemon, allNamesAndIds, dispatch, intersection, dispalyData.sortBy);

	// return {intersection, searchParam, selectedGenerations, selectedTypes, fetchedPokemons, nextRequest, pokemonsToDisplay};
};

type SearchParams = {
	[key: string]: string
}

export const getIntersection2 = (searchParams: SearchParams , generations: CachedGeneration, types: CachedType, language: LanguageOption): number[] => {
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
	return intersection.sort((a, b) => a - b);
	// const {fetchedPokemons, pokemonsToDisplay, nextRequest} = await getPokemons(pokeData.pokemon, allNamesAndIds, dispatch, intersection, dispalyData.sortBy);

	// return {intersection, searchParam, selectedGenerations, selectedTypes, fetchedPokemons, nextRequest, pokemonsToDisplay};
};