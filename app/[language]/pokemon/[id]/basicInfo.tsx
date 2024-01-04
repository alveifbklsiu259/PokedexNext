import { Pokemon, PokemonSpecies } from '@/typeModule';
import { memo } from 'react';
import { getFormName, getIdFromURL, getNameByLanguage } from '@/app/_utils/util';
import { LanguageOption } from '../../_components/display/display-slice';
import Image from 'next/image';
import { CachedType } from '../../_components/pokemonData/pokemon-data-slice';
import { getData, getEndpointData } from '@/app/_utils/api';
import { Switch } from '@mui/material';
// import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type BasicInfoProps = {
	language: LanguageOption,
    pokemonId: number
};

const BasicInfo = memo<BasicInfoProps>(async function BasicInfo({language, pokemonId}) {
    const pokemonData = await getData('pokemon', pokemonId);
    const speciesId = getIdFromURL(pokemonData.species.url);
    const speciesData = await getData('pokemonSpecies', speciesId);
    const typeResponse = await getEndpointData("type");
	const types = await getData(
		"type",
		typeResponse.results.map((entry) => entry.name),
		"name"
	);
    
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

	// there's some error from the API(some img src is https://raw.githubusercontent.com/PokeAPI/sprites/master/https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/xxx), just temporary workaround
	let imgSrc = pokemonData.sprites?.other?.['official-artwork']?.front_default;
	if (imgSrc && imgSrc.includes('https://raw.githubusercontent.com/PokeAPI/sprites/master/https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/')) {
		imgSrc = imgSrc.replace('https://raw.githubusercontent.com/PokeAPI/sprites/master/', '');
	};
	// console.log(imgSrc)
	// reference: https://github.com/vercel/next.js/discussions/29545
	// reference: https://stackoverflow.com/questions/73570140/typeerror-cannot-read-properties-of-null-reading-default-in-next-js

	return (
		<div className={`basicInfo d-flex flex-column align-items-center text-center p-0 h-100 ${!imgSrc ? 'justify-content-end' : ''} `}>
			{/* width/heigh attributes are important for ScrollRestoration */}
			{imgSrc ? <Image width='475' height='475' className="poke-img mx-auto p-0" src={imgSrc} alt={formName} priority /> : <div style={{height: 'auto', width: 'auto'}}></div>}
			<span className="id p-0">#{String(nationalNumber).padStart(4 ,'0')}</span>
			<h2 className="p-0 text-capitalize pokemonName">{newName || formName}</h2>
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