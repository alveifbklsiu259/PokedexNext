import { memo } from "react";
import { getAbilities2, getData } from "@/lib/api";
import AbilityInfoBtn from "./ability-info-btn";
import { getNameByLanguage, transformToKeyName } from "@/lib/util";
import { LanguageOption } from "@/app/[language]/page";

type AbilitiesProps = {
	language: LanguageOption;
	pokemonId: number;
};

const Abilities = memo<AbilitiesProps>(
	async function Abilities({ language, pokemonId }) {
		const pokemonData = await getData("pokemon", pokemonId);
		const abilities = await getAbilities2(pokemonData);

		return (
			<>
				{pokemonData.abilities.map((entry) => {
					const ability = entry.ability.name;
					return (
						<div key={ability}>
							<span className="me-2">
								{getNameByLanguage(
									ability.replace("-", " "),
									language,
									abilities[transformToKeyName(ability)]
								).toLowerCase()}
							</span>
							<AbilityInfoBtn
								language={language}
								abilityData={abilities[transformToKeyName(ability)]}
							/>
							<br />
						</div>
					);
				})}
			</>
		);
	}
);
export default Abilities;