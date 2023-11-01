import { getAbilities2, getData, getEndpointData, getEvolutionChains, getItemsFromChain } from "@/app/_utils/api";
import Pokemon from "@/app/[language]/_components/pokemonData/pokemon";
import { LanguageOption, languageOptions } from "@/app/[language]/_components/display/display-slice";
import { getIdFromURL } from "@/app/_utils/util";

type PageProps = {
	params: {
		language: LanguageOption,
		id: string
	}
};

// I can have the /pokemon/x SSR or SSG


// this is not working
// export const dynamicParams = false;



// export async function generateStaticParams() {
// 	const speciesResponse = await getEndpointData('pokemonSpecies');
// 	const pokemonCount = speciesResponse.count;

// 	// const languages = Object.keys(languageOptions).map(lan => ({
// 	// 	language: lan
// 	// }));

// 	const staticParams: {language: string, id: string}[] = [];

// 	const languageOptions2 = {
// 		'en': 's',

// 	}

// 	// Object.keys(languageOptions2).forEach(lan => {
// 	// 	for (let i = 1; i <= 100; i ++) {
// 	// 		staticParams.push({language: lan, id: String(i)});
// 	// 	};
// 	// });

// 	return staticParams;


// 	Object.keys(languageOptions).forEach(lan => {
// 		for (let i = 1; i < pokemonCount; i ++) {
// 			staticParams.push({id: String(i), language: lan});
// 		};
// 	});

// 	console.log(staticParams)










// 	// have to handle non-default-form
// 	return staticParams;
// };

export default async function Page ({params}: PageProps) {
	// requests: ['pokemon', 'pokemonSpecies', 'evolutionChain', 'ability', 'item'], moves


	// the current pattern is like the docs says, all or nothing
	// https://nextjs.org/docs/app/building-your-application/data-fetching/patterns#:~:text=are%20not%20blocked.-,Blocking,-Data%20Requests%3A
	// other approaches are paralle or prefetch. what about streaming?
	// if we move the data fetching to the component that needs it, and wrap all of em in a suspense, will i see a lot of spinner?

	const {language, id} = params;

	const pokemonCount = (await getEndpointData('pokemonSpecies')).count;

	const pokemonData = await getData('pokemon', id);
	const speciesData = await getData('pokemonSpecies', getIdFromURL(pokemonData.species.url));

	// evolution chain
	const chainId = getIdFromURL(speciesData.evolution_chain.url);
	const chainData = await getEvolutionChains(chainId);


	const pokemonsInChain = [...new Set(chainData.chains.flatMap(chain => chain))];
	const pokemons = await getData('pokemon', pokemonsInChain, 'id');
	const species = await getData('pokemonSpecies', pokemonsInChain, 'id');

	// ability
	const abilityData = await getAbilities2(pokemonData);

	// item
	const requiredItems = getItemsFromChain(chainData.details);
	const itemData = await getData('item', requiredItems, 'name');

	// stats
	const statResponse = await getEndpointData('stat');
	const statToFetch = statResponse.results.map(data => data.url);
	const stats = await getData('stat', statToFetch, 'name');

	// version
	const versionResponse = await getEndpointData('version');
	const versionToFetch = versionResponse.results.map(data => data.url);
	const versions = await getData('version', versionToFetch, 'name');

	// move-damage-class
	const moveDamageClassResponse = await getEndpointData('moveDamageClass');
	const moveDamageClassToFetch = moveDamageClassResponse.results.map(data => data.url);
	const moveDamageClass = await getData('moveDamageClass', moveDamageClassToFetch, 'name');




	// const movesToFetch = pokemonData.moves.map(entry => getIdFromURL(entry.move.url));
	// const moves = getData('move', movesToFetch, 'name');






	// generation
	const generationResponse = await getEndpointData('generation');
	const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');



	// type
	const typeResponse = await getEndpointData('type');
	const typeData = await getData('type', typeResponse.results.map(entry => entry.name), 'name');

	return (
		<Pokemon 
			language={language}
			id={id}
			pokemonCount={pokemonCount}
			pokemonData={pokemonData}
			speciesData={speciesData}
			chainId={chainId}
			chainData={chainData}
			abilityData={abilityData}
			itemData={itemData}
			typeData={typeData}
			stats={stats}
			pokemons={pokemons}
			generations={generations}
			species={species}
			versions={versions}
			moveDamageClass={moveDamageClass}
		/>
	);
};


// if using context, all the listeners will be client components..., if not, prop drilling...
// but come to think of it, currently most of the components under /pokemon/xxx are Server component, maybe we can just fetch data in those component instead of passing them down as props.









// to do :
// 1. parallel routes for Modal
// 2. error.tsx
// 3. 404.tsx
// 4. pokemon table
// 5. show loading, if pokemon/x is SSG, it's fast between navigation, but if it's SSR, it lags a bit before navigating.