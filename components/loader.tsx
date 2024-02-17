"use client";

import { useCustomTransition } from "./transition-provider";

export default function Loader() {
	const [isTransition] = useCustomTransition();

	if (isTransition) {
		return (
			<div className="loaderContainer">
				<span className="loader"></span>
			</div>
		);
	}
	return null;
}
