import { Pokemon, PokemonSpecies } from '@/typeModule';
import { memo } from 'react';
import { getFormName, getIdFromURL, getNameByLanguage } from '@/app/_utils/util';
import { LanguageOption } from '../display/display-slice';
import Image from 'next/image';
import { CachedType } from './pokemon-data-slice';

type BasicInfoProps = {
	pokemonData: Pokemon.Root,
	language: LanguageOption,
	speciesData: PokemonSpecies.Root | undefined,
	types: CachedType | undefined,
};

const BasicInfo = memo<BasicInfoProps>( function BasicInfo({pokemonData, language, speciesData, types}) {
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

	// try {
	// 	const src = "https://images.unsplash.com/photo-1621961458348-f013d219b50c";
	
	// 	const buffer = await fetch(src).then(async (res) =>
	// 	Buffer.from(await res.arrayBuffer())
	// 	);
	
	// 	const { base64 } = await getPlaiceholder(buffer);
	
	// 	console.log(base64);
	// } catch (err) {
	// 	err;
	// }

	// SSG page probably doesn't need it??
	// paliceholder for CSR?


	return (
		<div className={`basicInfo d-flex flex-column align-items-center text-center p-0 h-100 ${!imgSrc ? 'justify-content-end' : ''} `}>
			{/* width/heigh attributes are important for ScrollRestoration */}
			{
				imgSrc 
				? <Image 
					width='475' 
					height='475' 
					className="poke-img mx-auto p-0" 
					src={imgSrc} 
					alt={formName} 
					quality={30}
					// priority 
					// quality={100}
					// placeholder='blur'
					// blurDataURL={`http://localhost:3000/_next/image?url=https%3A%2F%2Fraw.githubusercontent.com%2FPokeAPI%2Fsprites%2Fmaster%2Fsprites%2Fpokemon%2Fother%2Fofficial-artwork%2F${pokemonData.id}.png&w=640&q=1`}
				/> 
				: 
				<div 
					style={{height: 'auto', width: 'auto'}}
				></div>
			}
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