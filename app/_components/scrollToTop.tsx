'use client';

import { useEffect, useRef, useState, memo, useCallback } from "react";
import { FaAngleUp } from 'react-icons/fa'

const ScrollToTop = memo(function ScrollToTop() {
	const [isBtnShown, setIsBtnShown] = useState(false);
	const lastScrollTop = useRef(document.documentElement.scrollTop);

	const showBtn = useCallback(() => {
		const currentScrollTop = document.documentElement.scrollTop;
		if (currentScrollTop < lastScrollTop.current && currentScrollTop > 300) {
			// scroll up
			setIsBtnShown(true);
		} else if (currentScrollTop > lastScrollTop.current || currentScrollTop < 300) {
			// scroll down
			setIsBtnShown(false);
		};
		lastScrollTop.current = currentScrollTop;
	}, [lastScrollTop, setIsBtnShown]);

	useEffect(() => {
		window.addEventListener('scroll', showBtn);
		return () => window.removeEventListener('scroll', showBtn);
	}, [showBtn]);

	const handleScrollToTop = () => {
		if (isBtnShown) {
			window.scrollTo(0, 0);
		};
	};

	return (
		<>
			<FaAngleUp onClick={handleScrollToTop} className={`upBtn ${!isBtnShown ? 'upBtnHide' : ''}`}></FaAngleUp>
		</>
	)
});

export default ScrollToTop;