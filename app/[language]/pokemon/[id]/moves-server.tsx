import { memo } from "react";
import MovesClient from "./moves-client";
import { getData, getEndpointData, getEvolutionChains } from "@/app/_utils/api";
import { LanguageOption } from "../../_components/display/display-slice";
import { getIdFromURL, transformToKeyName } from "@/app/_utils/util";
import { Machine, Pokemon, PokemonForm } from "@/typeModule";
import { CachedMachine } from "../../_components/pokemonData/pokemon-data-slice";

type MovesServerProps = {
	pokemonId: number;
	language: LanguageOption;
};

const MovesServer = memo<MovesServerProps>(async function MovesServer({
	pokemonId,
	language,
}) {
	// try fetching data concurrently

	// type
	const typeResponse = await getEndpointData("type");
	const types = await getData(
		"type",
		typeResponse.results.map((entry) => entry.name),
		"name"
	);

	// generation
	const generationResponse = await getEndpointData('generation');
	const generations = await getData('generation', generationResponse.results.map(entry => getIdFromURL(entry.url)), 'name');

	// move-damage-class
	const moveDamageClassResponse = await getEndpointData("moveDamageClass");
	const moveDamageClassToFetch = moveDamageClassResponse.results.map(
		(data) => data.url
	);
	const moveDamageClass = await getData(
		"moveDamageClass",
		moveDamageClassToFetch,
		"name"
	);

	// version
	const versionResponse = await getEndpointData('version');
	const versionToFetch = versionResponse.results.map(data => data.url);
	const versions = await getData('version', versionToFetch, 'name');
	
	// pokemon/species data
	let pokemonData = await getData('pokemon', pokemonId);
	const speciesId = getIdFromURL(pokemonData.species.url);
	const speciesData = await getData('pokemonSpecies', speciesId);

	// chain data
	const chainId = getIdFromURL(speciesData.evolution_chain.url);
	const chainData = await getEvolutionChains(chainId);
	let pokemonForm: PokemonForm.Root | undefined;

	let debutGeneration = speciesData.generation.name;
	if (!pokemonData.is_default) {
		pokemonForm = await getData('pokemonForm', getIdFromURL(pokemonData.forms[0].url));
		// if (pokemonData.formData && pokemonData.formData.is_battle_only === false) {
		if (pokemonForm.is_battle_only === false) {
			debutGeneration = Object.values(generations).find(generation => generation.version_groups.some(version => version.name === pokemonData.formData!.version_group.name))!.name;
		} else {
			// use the default form's pokemon data.
			pokemonData = await getData('pokemon', getIdFromURL(pokemonData.species.url));
		};
	};


	// console.time('moves')
	// all moves for current pokemon (leaned by machine, level-up...)
	const moves = await getData('move', pokemonData.moves.map(entry => getIdFromURL(entry.move.url)), 'name');
	// console.timeEnd('moves')















	




	// get machine on teh client
	


	// const generationNames = Object.values(generations).map(generation => generation.name)
	// const generationOptions = generationNames.slice(generationNames.indexOf(debutGeneration))
	// const versionOptions = generationOptions.reduce<string[]>((pre, cur) => {
	// 	pre.push(...generations[transformToKeyName(cur)].version_groups.map(version => version.name));
	// 	return pre;
	// }, []);


	// // machine
	// const movesLearnedByMachine = (() => {
	// 	const conditions = {
	// 		move_learn_method: 'machine',
	// 		version_group: versionOptions
	// 	};
	// 	type ConditionKey = keyof typeof conditions;
		
	// 	const test = (versionDetail: Pokemon.VersionGroupDetail) => Object.keys(conditions).every(key => {
	// 		const entry = conditions[key as ConditionKey];
	// 		if (Array.isArray(entry)) {
	// 			return entry.some(condition => versionDetail[key as ConditionKey].name === condition);
	// 		} else {
	// 			return entry === versionDetail[key as ConditionKey].name;
	// 		};
	// 	});

	// 	const matches = pokemonData.moves.filter(move => move.version_group_details.some(test));
	// 	const results = matches.map(move => ({...move, version_group_details: move.version_group_details.filter(test)}));
	// 	return results;
	// })();

	// const machinesToFetch: string[] = [];
	// movesLearnedByMachine.forEach(entry => {
	// 	const keyName = transformToKeyName(entry.move.name);
	// 	machinesToFetch.push(...moves[keyName].machines.map(entry => entry.machine.url));
	// });


	// const dataResponses = await Promise.all(machinesToFetch.map(url => fetch(url)));
	// const datas = dataResponses.map(response => response.json());
	// const machines = await Promise.all<Promise<Machine.Root>[]>(datas);
	// const machineData: CachedMachine = {};
	// machines.forEach(machine => {
	// 	const keyName = transformToKeyName(machine.move.name);
	// 	machineData[keyName] = {version_groups: {}};
	// 	machineData[keyName].version_groups = {
	// 		...machineData[keyName].version_groups,
	// 		[transformToKeyName(machine.version_group.name)]: machine.item.name
	// 	};
	// });
	// // some machine data is lacking in the API, but we still have to cache them to correctly check whether machine data ready or not.
	// movesLearnedByMachine.forEach(machine => {
	// 	const keyName = transformToKeyName(machine.move.name);
	// 	if (!machineData[keyName]) {
	// 		machineData[keyName] = {version_groups: {}};
	// 	};
	// });











	return <MovesClient 
		language={language}
		pokemonData={pokemonData}
		speciesData={speciesData}
		types={types}
		versionData={versions}
		moveData={moves}
		generationData={generations}
		debutGeneration={debutGeneration}
		chainData={chainData}
		movesDamageClass={moveDamageClass}
	/>;
});

export default MovesServer;


// because DataTable can only be a client component, we can't render it on the server, we have to pass fetched data down.

// try: 
//1. just pass fetched data down
//2.  get the initial column and data on the server, then pass the data down instead of the fetched data
// see which on is faster