"use client";
import { createContext, useContext, useTransition } from "react";

const TransitionContext = createContext<
	[boolean, React.TransitionStartFunction] | null
>(null);

type TransitionProviderProps = {
	children: React.ReactNode;
};

export default function TransitionProvider({
	children,
}: TransitionProviderProps) {
	const [isPending, startTransition] = useTransition();
	return (
		<TransitionContext.Provider value={[isPending, startTransition]}>
			{children}
		</TransitionContext.Provider>
	);
}

export const useCustomTransition = () => {
	const transitionContext = useContext(TransitionContext);
	if (transitionContext === null) {
		throw new Error("transition context is not initialized");
	}
	return transitionContext;
};
