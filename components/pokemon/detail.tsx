import React, { Suspense, memo } from "react";
import { FaMars, FaVenus } from "react-icons/fa";
import { BsQuestionLg } from "react-icons/bs";
import { i18nNamespaces, type Locale } from "@/i18nConfig";
import { getIdFromURL, getTextByLocale } from "@/lib/util";
import { getData } from "@/lib/api";
import Abilities from "./abilities";
import { AbilitiesSkeleton } from "@/components/skeletons";
import { initTranslationsServer } from "@/lib/i18n";

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
	locale: Locale;
	pokemonId: number;
};

const Detail = memo<DetailProps>(async function Detail({
	locale: locale,
	pokemonId,
}) {
	const pokemonData = await getData("pokemon", pokemonId);
	const speciesId = getIdFromURL(pokemonData.species.url);
	const speciesData = await getData("pokemonSpecies", speciesId);
	const { t } = await initTranslationsServer(locale, i18nNamespaces);

	const flavorText = getTextByLocale(
		locale,
		speciesData.flavor_text_entries,
		"flavor_text"
	);
	return (
		<>
			<p className="my-4 col-6">
				{t('height')}
				<br /> <span>{pokemonData.height * 10} cm</span>
			</p>
			<p className="my-4 col-6">
				{t('weight')}
				<br /> <span>{(pokemonData.weight * 100) / 1000} kg</span>
			</p>
			<p className="col-6 d-flex flex-column">
				{t('pokemon:gender')}
				<br />
				<span className="mt-4">{getGender(speciesData.gender_rate)}</span>
			</p>
			<div className="col-6 abilities p-0">
				{t('pokemon:abilities')}
				<br />
				<Suspense fallback={<AbilitiesSkeleton />}>
					<Abilities locale={locale} pokemonId={pokemonId} />
				</Suspense>
			</div>
			<p className="col-12 m-3 p-2 text-start description">{flavorText}</p>
		</>
	);
});
export default Detail;
