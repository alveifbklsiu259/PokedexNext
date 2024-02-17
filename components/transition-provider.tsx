"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useTransition, useMemo } from "react";
import type {AppRouterInstance, NavigateOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";

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

export const useTransitionRouter = () => {
	const router = useRouter();
	const [isPending, startTransition] = useCustomTransition();
	const routerKeys = Object.keys(router) as (keyof AppRouterInstance)[];
	const transitionRouter = useMemo(() => ({...router}), [router]);
	routerKeys.forEach(key => {
		switch (key) {
			case 'push' :
			case 'replace': {
				transitionRouter[key] = (...arg: Parameters<typeof transitionRouter[typeof key]>) => {
					startTransition(() => {
						router[key](...arg as [href: string, options?: NavigateOptions | undefined])
					})
				}
			};
			break;
			case 'prefetch' : {
				transitionRouter[key] = (...arg: Parameters<typeof transitionRouter[typeof key]>) => {
					startTransition(() => {
						router[key](...arg)
					})
				}
			};
			break;
			default : {
				transitionRouter[key] = () => {
					startTransition(() => {
						router[key]()
					})
				}
			}
		};
	});

	return [isPending, transitionRouter] as const;
};