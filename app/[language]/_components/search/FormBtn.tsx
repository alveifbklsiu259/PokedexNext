import { memo, useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { updateSearchParam } from "@/app/_utils/util";

type FormBtnProps = {
	formRef: React.RefObject<HTMLFormElement>;
	searchQuery: string;
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
	selectedGenerations: string[];
	setSelectedGenerations: React.Dispatch<React.SetStateAction<string[]>>;
	selectedTypes: string[];
	setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
};

const FormBtn = memo(function FormBtn({
	formRef,
	searchQuery,
	selectedGenerations,
	selectedTypes,
	setSearchQuery,
	setSelectedGenerations,
	setSelectedTypes,
}: FormBtnProps) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const query = searchParams.get("query");
	const generation = searchParams.get("gen");
	const type = searchParams.get("type");
	const match = searchParams.get("match");

	useLayoutEffect(() => {
		// synchronizing state
		setSearchQuery((sp) => (query ? query : sp));
		setSelectedGenerations((sg) =>
			generation
				? generation.split(",").map((g) => "generation-".concat(g))
				: sg
		);
		setSelectedTypes((st) => {
				return type ? (st.toString() === type ? st : type?.split(",")) : st
			}
		);
	}, [query, generation, type]);

	useEffect(() => {
		// React.FormEvent<HTMLFormElement>
		const handleSubmit = (e: SubmitEvent) => {
			e.preventDefault();
			const newSearchParams: { [key: string]: string } = {};

			newSearchParams["query"] = searchQuery;
			newSearchParams["type"] = selectedTypes.toString();
			newSearchParams["gen"] = selectedGenerations
				.map((gen) => gen.replace("generation-", ""))
				.toString();

			let newPathName: string = pathname;
			if (!pathname.includes("search")) {
				newPathName = `${pathname}/search`;
			}

			// router.prefetch(`${pathname}?${updateSearchParam(searchParams, newSearchParams)}`)
			router.push(
				`${newPathName}?${updateSearchParam(searchParams, newSearchParams)}`
			);
			// should we just navigate to the path with url param?

			// if (viewModeRef?.current) {
			// 	// search from root
			// 	viewModeRef.current.scrollIntoView();
			// } else {
			// 	// search from navbar, could be at root or /pokemons/xxx.
			// 	if (!document.querySelector('.viewModeContainer')) {
			// 		// navigateNoUpdates('/', {state: 'resetPosition'});
			// 		router.push('/');
			// 	};
			// 	setTimeout(() => {
			// 		document.querySelector('.viewModeContainer')?.scrollIntoView();
			// 	}, 10);
			// };
			// dispatch(searchPokemon({searchQuery, selectedGenerations, selectedTypes, matchMethod}));
		};

		// By attaching the submit event when FormBtn mounts, we don't have to read useSearchParams in Search component in which if we do, it will cause the whole tree down below to render on the client if the route is statically rendered on the server.
		formRef.current!.addEventListener("submit", handleSubmit);

		return () => {
			formRef.current!.removeEventListener("submit", handleSubmit);
		};
	}, [searchQuery, selectedTypes, selectedGenerations]);

	return (
		<button
			// disabled={status === 'loading' ? true : false}
			className="btn btn-primary btn-lg btn-block w-100 my-3"
			type="submit"
		>
			Search
		</button>
	);
});

export default FormBtn;
