"use client";
import { memo, useState, useMemo, useCallback } from "react";
import { AiFillQuestionCircle } from "react-icons/ai";
import { Ability } from "@/lib/definitions";
import { getNameByLanguage, getTextByLanguage } from "@/lib/util";
import { type Locale } from "@/i18nConfig";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";

type AbilityInfoBtnProps = {
	locale: Locale;
	abilityData: Ability.Root;
};

const Modal = dynamic(() => import("@/components/modal"));

const AbilityInfoBtn = memo<AbilityInfoBtnProps>(function AbilityInfoBtn({
	abilityData,
	locale,
}) {
	const [isModalShown, setIsModalShown] = useState(false);
	const [isDetail, setIsDetail] = useState(false);
	const {t} = useTranslation('pokemon');

	let brief: string | undefined, detail: string | undefined;

	if (abilityData) {
		brief = getTextByLanguage(
			locale,
			abilityData.flavor_text_entries,
			"flavor_text"
		);
		detail = getTextByLanguage(locale, abilityData.effect_entries, "effect");
	}
	const customClass = `modalBody ${
		!abilityData && isModalShown ? "modalLoading" : ""
	}`;

	const handleShowModal = useCallback(() => {
		setIsModalShown(true);
	}, [setIsModalShown]);

	const handleShowDetail = useCallback(() => {
		setIsDetail(!isDetail)
	}, [setIsDetail, isDetail])

	const memoAiFillQuestionCircle = useMemo(
		() => (
			<AiFillQuestionCircle
				onClick={handleShowModal}
				className="icon"
			></AiFillQuestionCircle>
		),
		[handleShowModal]
	);

	return (
		<>
			{memoAiFillQuestionCircle}
			{isModalShown && (
				<Modal
					customClass={customClass}
					isModalShown={isModalShown}
					setIsModalShown={setIsModalShown}
					setIsDetail={setIsDetail}
				>
					<h1 className="abilityName my-2">
						{getNameByLanguage(abilityData.name, locale, abilityData)}
					</h1>
					<div className="abilityDescription p-3">
						<p>{isDetail ? detail : brief}</p>
					</div>
					<div className="modalBtnContainer">
						<button
							onClick={handleShowDetail}
							className="btn btn-warning"
						>
							{t(`show${isDetail ? "Brief" : "Detail"}`)}
						</button>
					</div>
				</Modal>
			)}
		</>
	);
});

export default AbilityInfoBtn;
