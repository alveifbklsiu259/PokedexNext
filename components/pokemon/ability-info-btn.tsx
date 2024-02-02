"use client";
import { memo, useState, useMemo, useCallback } from "react";
import { AiFillQuestionCircle } from "react-icons/ai";
import { Ability } from "@/lib/definitions";
import { getNameByLanguage, getTextByLanguage } from "@/lib/util";
import { LanguageOption } from "@/app/[language]/page";
import dynamic from "next/dynamic";

type AbilityInfoBtnProps = {
	language: LanguageOption;
	abilityData: Ability.Root;
};

const Modal = dynamic(() => import("@/components/modal"));

const AbilityInfoBtn = memo<AbilityInfoBtnProps>(function AbilityInfoBtn({
	abilityData,
	language,
}) {
	const [isModalShown, setIsModalShown] = useState(false);
	const [isDetail, setIsDetail] = useState(false);

	let brief: string | undefined, detail: string | undefined;

	if (abilityData) {
		brief = getTextByLanguage(
			language,
			abilityData.flavor_text_entries,
			"flavor_text"
		);
		detail = getTextByLanguage(language, abilityData.effect_entries, "effect");
	}
	const customClass = `modalBody ${
		!abilityData && isModalShown ? "modalLoading" : ""
	}`;

	const handleShowModal = useCallback(() => {
		setIsModalShown(true);
	}, [setIsModalShown]);

	const handleShowDetail = useCallback(() => {
		setIsDetail(!isDetail)
	}, [setIsDetail])

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
						{getNameByLanguage(abilityData.name, language, abilityData)}
					</h1>
					<div className="abilityDescription p-3">
						<p>{isDetail ? detail : brief}</p>
					</div>
					<div className="modalBtnContainer">
						<button
							onClick={handleShowDetail}
							className="btn btn-warning"
						>
							Show {isDetail ? "Brief" : "Detail"}
						</button>
					</div>
				</Modal>
			)}
		</>
	);
});

export default AbilityInfoBtn;
