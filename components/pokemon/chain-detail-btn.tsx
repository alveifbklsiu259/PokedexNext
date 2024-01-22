"use client";
import { AiFillInfoCircle } from "react-icons/ai";
import { memo, useState } from "react";
import dynamic from "next/dynamic";

type ChainDetailsBtnProps = {
	otherRequirements: JSX.Element
}

const Modal = dynamic(() => import("../modal"));

const ChainDetailsBtn = memo<ChainDetailsBtnProps>(function ChainDetailsBtn({otherRequirements}) {
	const [isModalShown, setIsModalShown] = useState(false);

	return (
		<>
			<AiFillInfoCircle
				className="fa-circle-info"
				onClick={() => setIsModalShown(true)}
			></AiFillInfoCircle>
			{isModalShown && (
				<Modal
					customClass="modalBody evolutionDetailsModal"
					isModalShown={isModalShown}
					setIsModalShown={setIsModalShown}
				>
					<h1 className="my-2">Other Requirements</h1>
					{otherRequirements}
				</Modal>
			)}
		</>
	);
});

export default ChainDetailsBtn;
