import { memo, useEffect, useLayoutEffect } from "react";
import { useSearchParams, useRouter, useParams, usePathname } from "next/navigation";
import { updateSearchParam } from "@/lib/util";
import { useCustomTransition } from "../transition-context";

type FormBtnProps = {
	formRef: React.RefObject<HTMLFormElement>;
	searchQuery: string;
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
	selectedGenerations: string[];
	setSelectedGenerations: React.Dispatch<React.SetStateAction<string[]>>;
	selectedTypes: string[];
	setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
	onCloseModal? : () => void;
	setTypeMatch: React.Dispatch<React.SetStateAction<'part' | 'all'>>;
	typeMatch: string
};

const FormBtn = memo(function FormBtn({
	formRef,
	searchQuery,
	selectedGenerations,
	selectedTypes,
	setSearchQuery,
	setSelectedGenerations,
	setSelectedTypes,
	onCloseModal,
	typeMatch,
	setTypeMatch
}: FormBtnProps) {
	const [isPending, startTransition] = useCustomTransition();
	const searchParams = useSearchParams();
	const params = useParams();
	const {language} = params;
	const router = useRouter();
	const query = searchParams.get("query");
	const generation = searchParams.get("gen");
	const type = searchParams.get("type");
	const match = (searchParams.get("match") || 'all') as 'part' | 'all';

	// synchronizing state, the reason I'm synchronizing states in this component is that the data requires searchParams.
	useLayoutEffect(() => {
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
		if (match === 'part') {
			setTypeMatch(match)
		}
	}, [query, generation, type, match, setSearchQuery, setSelectedGenerations, setSelectedTypes, setTypeMatch]);

	// attatching event listener to the form. Since the event needs searchParams, if we try to attatch the event in Search component(where the form element is, that would cause it to only rendered on the client)
	useEffect(() => {
		const formNode = formRef.current!;
		const handleSubmit = (e: SubmitEvent) => {
			e.preventDefault();

			const newSearchParams = updateSearchParam(searchParams, {
				query: searchQuery,
				type: selectedTypes.toString(),
				gen: selectedGenerations
				.map((gen) => gen.replace("generation-", ""))
				.toString(),
				match: typeMatch
			});

			if (onCloseModal) {
				onCloseModal();
			};

			// what should I use, replace or push?
			startTransition(() => {
				router.replace(
					// `/${language}/pokemons2?${newSearchParams}`
					// `/${language}/pokemons/search?${newSearchParams}`
					`/${language}/pokemons2?${newSearchParams}`
				);
			})

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
			// dispatch(searchPokemon({searchQuery, selectedGenerations, selectedTypes, typeMatch}));
		};

		// By attaching the submit event when FormBtn mounts, we don't have to read useSearchParams in Search component in which if we do, it will cause the whole tree down below to render on the client if the route is statically rendered on the server.
		formNode.addEventListener("submit", handleSubmit);

		return () => {
			formNode.removeEventListener("submit", handleSubmit);
		};
	}, [searchQuery, selectedTypes, selectedGenerations, formRef, router, searchParams, language, typeMatch]);

	return (
		<button
			// disabled={status === 'loading' ? true : false}
			className="btn btn-primary btn-lg btn-block w-100 my-3"
			type="submit"
			disabled={isPending}
		>
			Search
		</button>
	);
});

export default FormBtn;

// when searchQuery, selectedTypes, selectedGenerations change, this component will re-renders, maybe solve this by passing ref down?
// improve performance of this component