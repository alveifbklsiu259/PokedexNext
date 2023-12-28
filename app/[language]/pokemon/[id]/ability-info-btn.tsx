"use client";
import Modal from "@/app/_components/modal";
import { memo, useState } from "react";
import { AiFillQuestionCircle } from "react-icons/ai";
import { Ability } from "@/typeModule";
import { getNameByLanguage, getTextByLanguage } from "@/app/_utils/util";
import { LanguageOption } from "../../_components/display/display-slice";

type AbilityInfoBtnProps = {
	language: LanguageOption;
	abilityData: Ability.Root;
};

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

	return (
		<>
			<AiFillQuestionCircle
				onClick={() => setIsModalShown(true)}
				className="icon"
			></AiFillQuestionCircle>
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
							onClick={() => setIsDetail(!isDetail)}
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
