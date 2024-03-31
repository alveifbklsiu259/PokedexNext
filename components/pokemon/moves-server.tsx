import { memo } from "react";
import MovesClient from "./moves-client";
import { getData, getEndpointData, getEvolutionChains } from "@/lib/api";
import { type Locale } from "@/i18nConfig";
import { getIdFromURL } from "@/lib/util";
import { PokemonForm } from "@/lib/definitions";

type MovesServerProps = {
	pokemonId: number;
	locale: Locale;
};

const MovesServer = memo<MovesServerProps>(async function MovesServer({
	pokemonId,
	locale,
}) {

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
		if (pokemonForm.is_battle_only === false) {
			debutGeneration = Object.values(generations).find(generation => generation.version_groups.some(version => version.name === pokemonForm!.version_group.name))!.name;
		} else {
			// use the default form's pokemon data.
			pokemonData = await getData('pokemon', getIdFromURL(pokemonData.species.url));
		};
	};

	// all moves for current pokemon (leaned by machine, level-up...)
	const moves = await getData('move', pokemonData.moves.map(entry => getIdFromURL(entry.move.url)), 'name');

	return (
		<>
			<MovesClient
				locale={locale}
				pokemonData={pokemonData}
				speciesData={speciesData}
				types={types}
				versionData={versions}
				moveData={moves}
				generationData={generations}
				debutGeneration={debutGeneration}
				chainData={chainData}
				movesDamageClass={moveDamageClass}
			/>
		</>
	)
});

export default MovesServer;