import React, { memo } from 'react';
import { LanguageOption } from '../display/display-slice';
import { getFormName, getIdFromURL } from '@/lib/util';
import { Pokemon, PokemonSpecies } from '@/lib/definitions';
import Link from 'next/link';

type VarietiesProps = {
	language: LanguageOption,
	pokemonData: Pokemon.Root,
	speciesData: PokemonSpecies.Root
};

const Varieties = memo<VarietiesProps>(function Varieties({language, pokemonData, speciesData}) {


	return (
		<div className='col-12 varieties'>
			<ul>
				{speciesData.varieties.map(variety => (
					<React.Fragment key={variety.pokemon.name}>
						<li className={pokemonData.name === variety.pokemon.name ? 'active' : ''}>
							<Link className='text-capitalize' href={`/${language}/pokemon/${getIdFromURL(variety.pokemon.url)}`}>
							{/* {getFormName(speciesData, language, pokemons[getIdFromURL(variety.pokemon.url)])} */}
							{variety.pokemon.name}
							</Link>
						</li>
					</React.Fragment>
				))}
			</ul>
		</div>
	)
});
export default Varieties;