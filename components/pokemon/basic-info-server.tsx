import { memo } from "react";
import { PokemonForm } from "@/lib/definitions";
import { getIdFromURL } from "@/lib/util";
import { getData, getEndpointData } from "@/lib/api";
import { LanguageOption } from "@/app/[language]/page";
import BasicInfo from "../basicInfo";

type BasicInfoServerProps = {
	language: LanguageOption;
	pokemonId: number;
};

const BasicInfoServer = memo<BasicInfoServerProps>(
	async function BasicInfoServer({ language, pokemonId }) {
		const pokemonData = await getData("pokemon", pokemonId);
		const speciesId = getIdFromURL(pokemonData.species.url);
		const speciesData = await getData("pokemonSpecies", speciesId);

		let formData: PokemonForm.Root | undefined;
		if (!pokemonData.is_default) {
			formData = await getData(
				"pokemonForm",
				getIdFromURL(pokemonData.forms[0].url)
			);
		}

		const typeResponse = await getEndpointData("type");
		const types = await getData(
			"type",
			typeResponse.results.map((entry) => entry.name),
			"name"
		);

		return (
			<BasicInfo
				pokemonData={pokemonData}
				types={types}
				speciesData={speciesData}
				language={language}
				formData={formData}
			/>
		);
	}
);

export default BasicInfoServer;
