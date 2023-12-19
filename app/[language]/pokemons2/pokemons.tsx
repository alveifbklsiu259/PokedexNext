'use client'

import { CachedAllPokemonNamesAndIds, CachedPokemon, CachedPokemonSpecies, CachedType } from "../_components/pokemonData/pokemon-data-slice";
import BasicInfo from "../_components/pokemonData/basicInfo";
import { useParams, useSearchParams } from "next/navigation";
import { LanguageOption } from "../_components/display/display-slice";

type PokemonsProps = {
    pokemonData: CachedPokemon,
    speciesData: CachedPokemonSpecies,
    types: CachedType,
}
export default function Pokemons({pokemonData, speciesData, types}: PokemonsProps) {
    const params = useParams();
    const { language } = params;

	return (
		<>
			<div className="container">
				{/* <div ref={viewModeRef} className="viewModeContainer">
					<ViewMode tableInfoRef={tableInfoRef} />
				</div> */}
				<div className="row g-5">
					{Object.values(pokemonData!).map((data) => {
						const imgSrc =
							data.sprites?.other?.["official-artwork"]?.front_default;
						return (
							<div
								key={data.id}
								className={`col-6 col-md-4 col-lg-3 card pb-3 pokemonCard ${
									!imgSrc ? "justify-content-end" : ""
								}`}
							>
								<BasicInfo
									pokemonData={data}
									language={language as LanguageOption}
									speciesData={speciesData![data.id]}
									types={types}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
}
