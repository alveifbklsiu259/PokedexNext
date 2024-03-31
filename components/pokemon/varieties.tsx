import { Suspense, memo } from "react";
import { type Locale } from "@/i18nConfig";
import { getIdFromURL } from "@/lib/util";
import { getData } from "@/lib/api";
import VarietyName from "./variety-name";
import { VarietyNameSkeleton } from "../skeletons";

type VarietiesProps = {
	locale: Locale;
	pokemonId: number;
};

const Varieties = memo<VarietiesProps>(async function Varieties({
	locale,
	pokemonId,
}) {
	const pokemonData = await getData("pokemon", pokemonId);
	const speciesId = getIdFromURL(pokemonData.species.url);
	const speciesData = await getData("pokemonSpecies", speciesId);

	// waterfall in VarietyName, try to solve it

	return (
		<>
			{speciesData.varieties.length > 1 ? (
				<div className="col-12 varieties marginWithVarieties">
					<ul>
						{speciesData.varieties.map((variety, index) => {
							const varietyId = getIdFromURL(variety.pokemon.url);
							return (
								<Suspense key={varietyId} fallback={<VarietyNameSkeleton index={index} />}>
									<VarietyName
										varietyId={varietyId}
										varietyName={variety.pokemon.name}
										locale={locale}
										pokemonData={pokemonData}
										speciesData={speciesData}
									/>
								</Suspense>
							);
						})}
					</ul>
				</div>
			) : <div className="marginWithoutVarieties"></div>

			}
		</>
	);
});
export default Varieties;