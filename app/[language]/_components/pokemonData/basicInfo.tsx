import { Pokemon, PokemonSpecies } from '@/typeModule';
import { memo } from 'react';
import { getFormName, getIdFromURL, getNameByLanguage } from '@/app/_utils/util';
import { LanguageOption } from '../display/displaySlice';
import Image from 'next/image';
import { CachedType } from './pokemonDataSlice';

type BasicInfoProps = {
	pokemonData: Pokemon.Root,
	language: LanguageOption,
	speciesData: PokemonSpecies.Root | undefined,
	types: CachedType | undefined,
};

const BasicInfo = memo<BasicInfoProps>(function BasicInfo({pokemonData, language, speciesData, types}) {
	const nationalNumber = getIdFromURL(pokemonData.species.url);
	const formName = getFormName(speciesData, language, pokemonData);
	let newName: undefined | React.JSX.Element;
	if (formName.includes('(')) {
		const pokemonName = formName.split('(')[0];
		const form = `(${formName.split('(')[1]}`;
		newName = (
			<>
	 		{pokemonName}
			<div className="formName">{form}</div>
		</>
		)
	};

	return (
		<div className="basicInfo d-flex flex-column align-items-center text-center p-0 h-100">
			{/* width/heigh attributes are important for ScrollRestoration */}
			<Image width='475' height='475' className="poke-img mx-auto p-0" src={pokemonData.sprites.other['official-artwork'].front_default} alt={formName} priority />
			<span className="id p-0">#{String(nationalNumber).padStart(4 ,'0')}</span>
			<div className="p-0 text-capitalize pokemonName">{newName || formName}</div>
			<div className="types row justify-content-center">
				{pokemonData.types.map(entry => (
					<span 
						key={entry.type.name} 
						className={`type-${entry.type.name} type col-5 m-1`}
					>
						{getNameByLanguage(entry.type.name, language, types?.[entry?.type?.name])}
					</span>
				))}
			</div>
		</div>
	)
});

export default BasicInfo;