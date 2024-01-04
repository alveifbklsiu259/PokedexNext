import React, { memo } from "react";
import { LanguageOption } from "../../_components/display/display-slice";
import { getFormName, getIdFromURL } from "@/app/_utils/util";
import { Pokemon, PokemonSpecies } from "@/typeModule";
import Link from "next/link";
import { getData } from "@/app/_utils/api";

type VarietiesProps = {
	language: LanguageOption;
	pokemonId: number;
};

const Varieties = memo<VarietiesProps>(async function Varieties({
	language,
	pokemonId,
}) {
	const pokemonData = await getData("pokemon", pokemonId);
	const speciesId = getIdFromURL(pokemonData.species.url);
	const speciesData = await getData("pokemonSpecies", speciesId);

	return (
		<>
			{speciesData.varieties.length > 1 && (
				<div className="col-12 varieties">
					<ul>
						{speciesData.varieties.map((variety) => (
							<React.Fragment key={variety.pokemon.name}>
								<li
									className={
										pokemonData.name === variety.pokemon.name ? "active" : ""
									}
								>
									<Link
										className="text-capitalize"
										href={`/${language}/pokemon/${getIdFromURL(
											variety.pokemon.url
										)}`}
										prefetch={true}
									>
										{/* {getFormName(speciesData, language, pokemons[getIdFromURL(variety.pokemon.url)])} */}
										{variety.pokemon.name}
									</Link>
								</li>
							</React.Fragment>
						))}
					</ul>
				</div>
			)}
		</>
	);
});
export default Varieties;


// I was thinking about having varieties and evolution chain in a layout, so when changing form, theses two components will not re-render, but I'm currenly navigating to a new [id] when change form, to implement the said requirement, maybe we should use searchParams, but I also want to test if I can statically generate pokemon/[id], so maybe implement it later