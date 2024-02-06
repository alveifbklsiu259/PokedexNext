import { memo } from "react";
import Image from "next/image";
import { Pokemon, PokemonForm, PokemonSpecies } from "@/lib/definitions";
import { getFormName2, getIdFromURL, getNameByLanguage } from "@/lib/util";
import { type Locale } from "@/i18nConfig";
import { CachedType } from "@/slices/pokemon-data-slice";

type BasicInfoProps = {
	pokemonData: Pokemon.Root;
	locale: Locale;
	speciesData: PokemonSpecies.Root | undefined;
	types: CachedType | undefined;
	formData?: PokemonForm.Root;
};

const BasicInfo = memo<BasicInfoProps>(function BasicInfo({
	pokemonData,
	locale,
	speciesData,
	types,
	formData,
}) {
	const nationalNumber = getIdFromURL(pokemonData.species.url);
	const formName = getFormName2(speciesData, locale, pokemonData, formData);

	let newName: undefined | React.JSX.Element;
	if (formName.includes("(")) {
		const pokemonName = formName.split("(")[0];
		const form = `(${formName.split("(")[1]}`;
		newName = (
			<>
				{pokemonName}
				<div className="formName">{form}</div>
			</>
		);
	}

	// there's some error from the API(some img src is https://raw.githubusercontent.com/PokeAPI/sprites/master/https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/xxx), just temporary workaround
	let imgSrc = pokemonData.sprites?.other?.["official-artwork"]?.front_default;
	if (
		imgSrc &&
		imgSrc.includes(
			"https://raw.githubusercontent.com/PokeAPI/sprites/master/https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"
		)
	) {
		imgSrc = imgSrc.replace(
			"https://raw.githubusercontent.com/PokeAPI/sprites/master/",
			""
		);
	}
	// reference: https://github.com/vercel/next.js/discussions/29545
	// reference: https://stackoverflow.com/questions/73570140/typeerror-cannot-read-properties-of-null-reading-default-in-next-js

	return (
		<div
			className={`basicInfo d-flex flex-column align-items-center text-center p-0 h-100 ${
				!imgSrc ? "justify-content-end" : ""
			} `}
		>
			{imgSrc ? (
				<Image
					width="475"
					height="475"
					className="poke-img mx-auto p-0"
					src={imgSrc}
					alt={formName}
					quality={30}
				/>
			) : (
				<div style={{ height: "auto", width: "auto" }}></div>
			)}
			<span className="id p-0">#{String(nationalNumber).padStart(4, "0")}</span>
			<div className="p-0 text-capitalize pokemonName">
				{newName || formName}
			</div>
			<div className="types row justify-content-center">
				{pokemonData.types.map((entry) => (
					<span
						key={entry.type.name}
						className={`type-${entry.type.name} type col-5 m-1`}
					>
						{getNameByLanguage(
							entry.type.name,
							locale,
							types?.[entry?.type?.name]
						)}
					</span>
				))}
			</div>
		</div>
	);
});

export default BasicInfo;
