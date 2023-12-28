import React, { Suspense, memo } from "react";
import { LanguageOption } from "../../_components/display/display-slice";
import { getIdFromURL, getTextByLanguage } from "@/app/_utils/util";
import { FaMars, FaVenus } from "react-icons/fa";
import { BsQuestionLg } from "react-icons/bs";
import { getData } from "@/app/_utils/api";
import Abilities from "./abilities";

function getGender(gender_rate: number) {
	switch (gender_rate) {
		case -1:
			return <BsQuestionLg className="fa-regular fa-question"></BsQuestionLg>;
		case 0:
			return <FaMars className="fa-mars"></FaMars>;
		case 8:
			return <FaVenus className="fa-venus"></FaVenus>;
		default:
			return (
				<>
					<FaMars className="fa-mars"></FaMars> /{" "}
					<FaVenus className="fa-venus"></FaVenus>
				</>
			);
	}
}

type DetailProps = {
	language: LanguageOption;
	pokemonId: number;
	// abilityData: CachedAbility;
};

const Detail = memo<DetailProps>(async function Detail({
	language,
	pokemonId,
}) {
	const pokemonData = await getData("pokemon", pokemonId);
	const speciesId = getIdFromURL(pokemonData.species.url);
	const speciesData = await getData("pokemonSpecies", speciesId);

	const flavorText = getTextByLanguage(
		language,
		speciesData.flavor_text_entries,
		"flavor_text"
	);
	return (
		<>
			{/* <div className="detail row text-center col-12 col-sm-6"> */}
			<p className="my-4 col-6">
				Height
				<br /> <span>{pokemonData.height * 10} cm</span>
			</p>
			<p className="my-4 col-6">
				Weight
				<br /> <span>{(pokemonData.weight * 100) / 1000} kg</span>
			</p>
			<p className="col-6 d-flex flex-column">
				Gender
				<br />
				<span className="mt-4">{getGender(speciesData.gender_rate)}</span>
			</p>
			<div className="col-6 abilities p-0">
				Abilities <br />
				<Suspense fallback={<h1>loading abilities</h1>}>
					<Abilities language={language} pokemonId={pokemonId} />
				</Suspense>
			</div>
			<p className="col-12 m-3 p-2 text-start description">{flavorText}</p>
			{/* </div> */}
		</>
	);
});
export default Detail;
