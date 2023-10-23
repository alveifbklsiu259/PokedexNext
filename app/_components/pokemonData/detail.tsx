import React, { memo } from "react";
import { selectLanguage } from "../display/displaySlice";
import { selectPokemonById, selectSpeciesById } from './pokemonDataSlice';
import Abilities from "./abilities";
import { getTextByLanguage } from "../../_utils/util";
import { useAppSelector } from "../../_app/hooks";
import { FaMars, FaVenus } from 'react-icons/fa';
import { BsQuestionLg } from 'react-icons/bs';

function getGender(gender_rate: number) {
	switch(gender_rate) {
		case -1 :
			return <BsQuestionLg className="fa-regular fa-question"></BsQuestionLg>
		case 0 :
			return <FaMars className="fa-mars"></FaMars>;
		case 8 :
			return <FaVenus className="fa-venus"></FaVenus>;
		default :
			return (
				<>
					<FaMars className="fa-mars"></FaMars> / <FaVenus className="fa-venus"></FaVenus>
				</>
			)
	};
};

type DetailProps = {
	pokeId: string
};

const Detail = memo<DetailProps>(function Detail({pokeId}) {
	const language = useAppSelector(selectLanguage);
	const pokemon = useAppSelector(state => selectPokemonById(state, pokeId))!;
	const speciesData = useAppSelector(state => selectSpeciesById(state, pokeId))!;

	const flavorText = getTextByLanguage(language, speciesData.flavor_text_entries, 'flavor_text');
	return (
		<>
			<div className="detail row text-center col-12 col-sm-6">
				<p className="my-4 col-6">Height<br /> <span>{pokemon.height * 10 } cm</span></p>
				<p className="my-4 col-6">Weight<br /> <span>{pokemon.weight * 100 / 1000 } kg</span></p>
				<p className="col-6 d-flex flex-column">Gender<br />
					<span className="mt-4">{getGender(speciesData.gender_rate)}</span>
				</p>
				<div className="col-6 abilities p-0">Abilities <br />
					<Abilities pokemon={pokemon} />
				</div>
				<p className="col-12 m-3 p-2 text-start description">{flavorText}</p>
			</div>
		</>
	)
});
export default Detail;