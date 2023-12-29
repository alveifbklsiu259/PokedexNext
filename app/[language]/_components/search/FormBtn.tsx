import { memo, useEffect, useLayoutEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
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
	const searchParams = useSearchParams();
	const params = useParams();
	const {language} = params;
	const router = useRouter();
	const query = searchParams.get("query");
	const generation = searchParams.get("gen");
	const type = searchParams.get("type");
	const match = searchParams.get("match");

	useLayoutEffect(() => {
		// synchronizing state
		setSearchQuery((sq) => (query ? query : sq));
		setSelectedGenerations((sg) =>
			generation
				? generation.split(",").map((g) => "generation-".concat(g))
				: sg
		);
		setSelectedTypes((st) => {
				return type ? (st.toString() === type ? st : type?.split(",")) : st
			}
		);
	}, [query, generation, type, setSearchQuery, setSelectedGenerations, setSelectedTypes]);

	useEffect(() => {
		const formNode = formRef.current!;
		const handleSubmit = (e: SubmitEvent) => {
			console.log('submit')
			e.preventDefault();

			const newSearchParams = updateSearchParam(searchParams, {
				query: searchQuery,
				type: selectedTypes.toString(),
				gen: selectedGenerations
				.map((gen) => gen.replace("generation-", ""))
				.toString()
			})

			let newPathname: string;
			if (Object.values(newSearchParams).some(searchParam => searchParam !== '')) {
				newPathname = `/${language}/pokemons/search`;
			} else {
				newPathname = `/${language}/pokemons`
			};

			router.push(
				// `/${language}/pokemons2?${newSearchParams}`
				`${newPathname}?${newSearchParams}`
			);
			console.log('render ends')

			


			// let newPathName: string = pathname;
			// if (!pathname.includes("search") && Object.values(newSearchParams).some(searchParams => searchParams !== '')) {
			// 	newPathName = `${pathname}/search`;
			// } else {
			// 	newPathName = pathname
			// };

			// console.log(newSearchParams)


			// // router.prefetch(`${pathname}?${updateSearchParam(searchParams, newSearchParams)}`)
			// router.push(
			// 	`${newPathName}?${updateSearchParam(searchParams, newSearchParams)}`
			// );
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
		formNode.addEventListener("submit", handleSubmit);

		return () => {
			formNode.removeEventListener("submit", handleSubmit);
		};
	}, [searchQuery, selectedTypes, selectedGenerations, formRef, router, searchParams, language]);

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

// when searchQuery, selectedTypes, selectedGenerations change, this component will re-renders, maybe solve this by passing ref down?
// improve performance of this component