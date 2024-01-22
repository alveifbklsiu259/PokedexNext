import type { PropsWithChildren } from 'react';
import { HiXMark } from 'react-icons/hi2'
type ModalProps = {
	customClass: string,
	isModalShown: boolean,
	setIsModalShown: React.Dispatch<React.SetStateAction<boolean>>,
	setIsDetail?: React.Dispatch<React.SetStateAction<boolean>>
};

export default function Modal({customClass, isModalShown, setIsModalShown, setIsDetail, children}: PropsWithChildren<ModalProps>) {
	const handleCloseModal = () => {
		setIsModalShown(false);
		if (setIsDetail) {
			setIsDetail(false);
		};
	};

	const handlePropagation = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
	};

	return (
		<>
			<div className={`modalBg ${isModalShown ? 'showModal' : 'hideModal'}`} onClick={handleCloseModal}>
				<div className={customClass} onClick={handlePropagation}>
					<div className='modalTop'>
						<HiXMark className="	xmark me-3 my-2" onClick={handleCloseModal}></HiXMark>
					</div>
					{children}
				</div>
			</div>
		</>
	)
};