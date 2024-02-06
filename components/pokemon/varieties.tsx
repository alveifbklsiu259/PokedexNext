import React, { memo } from "react";
import { type Locale } from "@/i18nConfig";
import { getFormName2, getIdFromURL } from "@/lib/util";
import { PokemonForm } from "@/lib/definitions";
import Link from "next/link";
import { getData } from "@/lib/api";

type VarietiesProps = {
	locale: Locale;
	pokemonId: number;
};

const Varieties = memo<VarietiesProps>(async function Varieties({
	locale,
	pokemonId,
}) {
	const pokemonData = await getData("pokemon", pokemonId);
	const speciesId = getIdFromURL(pokemonData.species.url);
	const speciesData = await getData("pokemonSpecies", speciesId);

	const pokemons = await getData('pokemon', speciesData.varieties.map(variety => getIdFromURL(variety.pokemon.url)),'id');
	const formsToFetch: number[] = [];
	Object.values(pokemons).forEach(pokemon => pokemon.forms.forEach(form => formsToFetch.push(getIdFromURL(form.url))));
	const forms = await getData('pokemonForm', formsToFetch, 'id');
	const newForms = Object.values(forms).reduce<{
		[id: number]: PokemonForm.Root
	}>((pre, cur) => {
		pre[getIdFromURL(cur.pokemon.url)] = cur;
		return pre
	}, {});

	return (
		<>
			{speciesData.varieties.length > 1 && (
				<div className="col-12 varieties">
					<ul>
						{speciesData.varieties.map((variety) => {
							const varietyId = getIdFromURL(variety.pokemon.url);
							return (
								<React.Fragment key={variety.pokemon.name}>
									<li
										className={
											pokemonData.name === variety.pokemon.name ? "active" : ""
										}
									>
										<Link
											className="text-capitalize text-decoration-none text-center"
											href={`/${locale}/pokemon/${varietyId}`}
											prefetch={true}
										>
											{getFormName2(speciesData, locale, pokemons[varietyId], newForms[varietyId])}
										</Link>
									</li>
								</React.Fragment>
							)
						})}
					</ul>
				</div>
			)}
		</>
	);
});
export default Varieties;


// I was thinking about having varieties and evolution chain in a layout, so when changing form, theses two components will not re-render, but I'm currenly navigating to a new [id] when change form, to implement the said requirement, maybe we should use searchParams, but I also want to test if I can statically generate pokemon/[id], so maybe implement it later