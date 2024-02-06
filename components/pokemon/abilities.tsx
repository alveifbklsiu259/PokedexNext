import { memo } from "react";
import { getAbilities2, getData } from "@/lib/api";
import AbilityInfoBtn from "./ability-info-btn";
import { getNameByLanguage, transformToKeyName } from "@/lib/util";
import { type Locale } from "@/i18nConfig";

type AbilitiesProps = {
	locale: Locale;
	pokemonId: number;
};

const Abilities = memo<AbilitiesProps>(
	async function Abilities({ locale, pokemonId }) {
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
									locale,
									abilities[transformToKeyName(ability)]
								).toLowerCase()}
							</span>
							<AbilityInfoBtn
								locale={locale}
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
