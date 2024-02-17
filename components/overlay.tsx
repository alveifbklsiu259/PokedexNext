'use client'
import { useTransitionRouter } from "./transition-provider";

export default function Overlay() {
	const [isPending] = useTransitionRouter();

	if (isPending) {
		return (
			<div className='overlay'></div>
		)
	}
	return null;
}