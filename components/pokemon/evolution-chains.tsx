import React, { memo, Suspense } from "react";
import Link from "next/link";
import BasicInfoServer from "./basic-info-server";
import { getIdFromURL } from "@/lib/util";
import { Pokemon } from "@/lib/definitions";
import { i18nNamespaces, type Locale } from "@/i18nConfig";
import { getData, getEndpointData, getEvolutionChains } from "@/lib/api";
import EvolutionDetails from "./evolution-details";
import Spinner from "../spinner";
import { initTranslationsServer } from "@/lib/i18n";

type EvolutionChainsProps = {
	locale: Locale,
	pokemonId: number,
}

const EvolutionChains = memo<EvolutionChainsProps>(async function EvolutionChains({
	locale,
	pokemonId,
}) {
	const {t} = await initTranslationsServer(locale, i18nNamespaces);
	const pokemonData = await getData('pokemon', pokemonId);
	const speciesId = getIdFromURL(pokemonData.species.url);
	const speciesData = await getData('pokemonSpecies', speciesId)

	// evolution chain
	const chainId = getIdFromURL(speciesData.evolution_chain.url);
	const chainData = await getEvolutionChains(chainId);
	const pokemonsInChain = [...new Set(chainData.chains.flatMap(chain => chain))];
	const species = await getData('pokemonSpecies', pokemonsInChain, 'id');

	const pokemonsToFetch: number[] = [];
	Object.values(species).forEach(speciesData => {
		speciesData.varieties.forEach(variety => {
			pokemonsToFetch.push(getIdFromURL(variety.pokemon.url))
		});
	});
	const pokemons = await getData('pokemon', pokemonsToFetch, 'id');

	const formsToFetch: number[] = [];
	Object.values(pokemons).forEach(pokemon => {
		if (!pokemon.is_default) {
			formsToFetch.push(getIdFromURL(pokemon.forms[0].url));
		};
	});
	const forms = await getData('pokemonForm', formsToFetch, 'id');

	// generation
	const generationResponse = await getEndpointData('generation');
	const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

	let evolutionChains = chainData.chains;
	/* 
	since the API doesn't provide evolution relationship between non-default-form, and there isn't really a specific pattern to check their relationship, here's how I'll implement and reason about their relationship:
	Note: a pokemon may have multiple evolution chains, a pokemon may have multiple non-battle-forms.
	Goal: show every possible chain, including non-default-form, and since only non-battle-form can possibly be an option in a chain, we can treat battle-only-form (g-max, mega...) as default-form, we may add a new chain or replace the current chain. (we'll check chain by chain instead of the entire chains)
	1. check if all pokemons in the chain have non-battle-form, if false, goes to 2, if true, link the forms that have something in common(same form-name or come from same generation) together. e.g pokemon A's form 1 is coming from the same generation as pokemon B's form 2, then they should be linked together. Then Add a new chain of those linked forms. 
	2. check if some pokemons in the chain has non-battle-form, if false, it means all of them only have default-form, then just return the original chain; if ture, check if the pokemons(default) in the the chain are from the same generation, if true, return the original chain (this case happens when a pokemon originally has its evolution chain, then in the newer generation, a new form and new pokemon is added to this pokemon's evolution chain, e.g wooper), if false goes to 3.
	3. the pokemons in this chain are not all from the same generation, and only some of them has non-battle-form, this may indicate:
		- the pokemon that does not have non-battle from is a new pokemon added in a newer generation.
		- the pokemon in the chain that has non-battle-form may appear in the newer generation as the non-battle-form, and evoles to(or from) the said pokemon, in this case, we should return a new chain with non-battle-form and the pokemon that does not have non-battle-form. 
	Note: The result chains may contain incorrect chain (i.e. 999)
	*/

	if (pokemonsInChain.length > 1) {
		// nbf stands for non-battle-form.
		const nbfs = pokemonsInChain.reduce<{
			[id: number]: Pokemon.Root[]
		}>((pre, cur) => {
			let match: Pokemon.Root[] = [];
			species[cur].varieties
				.forEach(variety => {
					if (!variety.is_default) {
						const pokemonData = pokemons[getIdFromURL(variety.pokemon.url)]
						const formData = forms[getIdFromURL(pokemonData.forms[0].url)];
						if (formData.is_battle_only === false) {
							match.push(pokemonData);
						};
					}
				});
			pre[cur] = match;
			return pre;
		}, {});

		const nbfTest = (id: number) => !!nbfs[id].length;
		const allHasNbf = (chain: number[]) => chain.every(nbfTest);
		const someHasNbf = (chain: number[]) => chain.some(nbfTest);

		const getGenerationByVersion = (versionName: string) => {
			return Object.values(generations).find(generation => generation.version_groups.some(version => version.name === versionName))!.name;
		};


		// find common data between nbfs and pokemons without nbfs.
		const getCommonData = (chain: number[]) => {
			const pokeIdsWithoutNbf = chain.filter(id => !nbfs[id].length);
			const pokeIdsWithNbf = chain.filter(id => nbfs[id].length);
			const nbfIds = chain.flatMap(id => nbfs[id].map(nbf => nbf.id));

			const commonData = {
				commonGeneration: '',
				commonName: '',
				idsInCommon: [] as number[]
			};
			
			const gens: string[] = [];
			[...pokeIdsWithoutNbf, ...nbfIds].forEach((id, index, ids) => {
				const formId = getIdFromURL(pokemons[id].forms[0].url);
				const versionName = forms[formId]?.version_group?.name;
				const generation = versionName ? getGenerationByVersion(versionName) : species[id].generation.name;
				if (!gens.includes(generation)) {
					gens.push(generation);
				} else {
					commonData.commonGeneration = generation;
					// the previous id
					if (!commonData.idsInCommon.includes(ids[index - 1])) {
						commonData.idsInCommon.push(ids[index - 1]);
					};
					commonData.idsInCommon.push(id);
				};
			});

			// this is not necessary, but if we can get this, it can be used for stricter check.
			if (pokeIdsWithNbf.length >= 2) {
				const formNames: string[] = [];
				nbfIds.forEach(id => {
					const formId = getIdFromURL(pokemons[id].forms[0].url);
					const formName = forms[formId].form_name;
					if (!formNames.includes(formName)) {
						formNames.push(formName);
					} else {
						commonData.commonName = formName;
					};
				});
			};
			return commonData;
		};

		const isDefaultFormFromSameGeneration = (chain: number[]) => {
			const generation = species[chain[0]].generation.name;
			return chain.every(id => species[id].generation.name === generation);
		};

		const hasChain = (newChain: number[], chains: number[][]) => {
			let exist = false;
			chains.forEach(chain => {
				if (JSON.stringify(chain) === JSON.stringify(newChain)) {
					exist = true;
				};
			});
			return exist;
		};
		evolutionChains = evolutionChains.reduce<number[][]>((newChains, currentChain) => {
			const {commonName, commonGeneration, idsInCommon} = getCommonData(currentChain);
			const commonTest = (form: Pokemon.Root) => {
				const formData = forms[getIdFromURL(form.forms[0].url)]
				const isFormMatch = formData.form_name === commonName;
				const isGenerationMatch = getGenerationByVersion(formData.version_group.name) === commonGeneration;
				return commonName ? (isFormMatch && isGenerationMatch) : (isFormMatch || isGenerationMatch);
			};

			const getMatchedIds = (chain: number[]) => {
				return chain.map(id => {
					if (nbfs[id].length && commonGeneration) {
						return nbfs[id].find(commonTest)?.id || id;
					} else {
						return id;
					};
				});
			};
			
			if (allHasNbf(currentChain)) {
				const newChain = getMatchedIds(currentChain);
				newChains.push(currentChain);
				if (!hasChain(newChain, newChains)) {
					newChains.push(newChain);
				};
			} else if(someHasNbf(currentChain)) {
				const newChain = getMatchedIds(currentChain);
				
				if (isDefaultFormFromSameGeneration(currentChain)) {
					newChains.push(currentChain);
				} else {
					let modifiedChain: number[];
					if (currentChain.length > 2) {
						modifiedChain = currentChain.reduce<number[]>((pre, cur) => {
							pre.push(cur);
							nbfs[cur].forEach(form => pre.push(form.id));
							return pre;
						}, []);

						// reshape the original chain, in some cases, the chain contains pokemon that does not evolve from the original default form.
						idsInCommon.forEach(id => {
							modifiedChain.splice(modifiedChain.indexOf(id), 1);
						});

						if (!hasChain(modifiedChain, newChains)) {
							newChains.push(modifiedChain);
						};
					};
				};
				if (!hasChain(newChain, newChains)) {
					// There's some inconsistent data in the API, for example Totem pokemon should be is_battle_only: true, but 10150(a Totem form) it's is_battle_only is false.
					const edgeCaseIds = [10094, 10150];
					// this condition is for filtering out some edge cases.
					if (!newChain.some(id => edgeCaseIds.includes(id))) {
						newChains.push(newChain);
					};
				};
			} else {
				newChains.push(currentChain);
			};
			return newChains;
		}, []);
	};

	// some edge cases
	if (pokemonsInChain.includes(744)) {
		evolutionChains = [[744, 745], [744, 10126], [744, 10152]];
	};

	const getDefaultFormId = (nonDefaultFormId: number) => {
		return getIdFromURL(pokemons[nonDefaultFormId].species.url);
	};

	const isChainDefault = (chain: number[]) => {
		return !chain.some(id => pokemons[id].is_default === false);
	};

	// get max depth (for layout)
	let maxDepth = 1;
	evolutionChains.forEach(chain => {
		if (chain.length > maxDepth) {
			maxDepth = chain.length;
		};
	});
	
	let content;
	if (evolutionChains.length === 1 && evolutionChains[0].length === 1) {
		content = (
			<p className="text-center">This Pokemon does not evolve.</p>
		)
	} else if (evolutionChains.length === 1) {
		// single path
		content = (
			<ul className={`p-2 ${maxDepth > 2 ? 'gtTwo' : 'ltThree'}`}>
				{evolutionChains[0].map((pokemonId, index, array) => (
					<React.Fragment key={pokemonId}>
						<li>
							<Link prefetch={true} href={`./${pokemonId}`} className="text-black text-decoration-none">
								<div className="chainInfoContainer" >
									<BasicInfoServer
										locale={locale}
										pokemonId={pokemonId}
									/>
								</div>
							</Link>
						</li>
						{index < array.length - 1 && (
							<li className='caret mt-5 mb-2'>
								<Suspense fallback={<Spinner/>}>
									<EvolutionDetails
										locale={locale}
										chainId={chainId}
										defaultFormId={getDefaultFormId(array[index + 1])}
										isChainDefault={isChainDefault(array)}
									/>
								</Suspense>
							</li>
						)}
					</React.Fragment>
				))}
			</ul>
		)
	} else {
		// multiple paths
		content = (
			<ul className={`p-0 ${maxDepth > 2 ? 'gtTwoContainer' : 'ltThreeContainer'}`}>
				{
					evolutionChains.map(chain => {
						return (
							<ul key={JSON.stringify(chain)} className={maxDepth > 2 ? 'gtTwo' : 'ltThree'}>
								{
									chain.map((pokemonId, index, array) => (
										<React.Fragment key={pokemonId}>
											<li className="multiplePath">
												<Link prefetch={true} href={`./${pokemonId}`} className="text-black text-decoration-none">
													<div className="chainInfoContainer" >
														<BasicInfoServer
															locale={locale}
															pokemonId={pokemonId}
														/>
													</div>
												</Link>
											</li>
											{index < array.length - 1 && (
												<li className="caret">
													<Suspense fallback={<Spinner/>}>
														<EvolutionDetails
															locale={locale}
															chainId={chainId} 
															defaultFormId={getDefaultFormId(array[index + 1])}
															isChainDefault={isChainDefault(array)}
														/>
													</Suspense>
												</li>
											)}
										</React.Fragment>
									))
								}
							</ul>
						)
					})
				}
			</ul>
		)
	};

	return (
		<div className="col-12 mt-5 evolutionChains p-0">
			<h1 className="text-center">{t('pokemon:evolutions')}</h1>
			{content}
		</div>
	)
});
export default EvolutionChains;