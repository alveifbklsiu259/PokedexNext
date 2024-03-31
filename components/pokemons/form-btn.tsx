import { memo, useEffect, useLayoutEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { updateSearchParam } from "@/lib/util";
import { useTransitionRouter } from "../transition-provider";
import { useCurrentLocale } from "@/lib/hooks";
import { useTranslation } from "react-i18next";
import Button from '@mui/material/Button';

type FormBtnProps = {
	formRef: React.RefObject<HTMLFormElement>;
	searchQuery: string;
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
	selectedGenerations: string[];
	setSelectedGenerations: React.Dispatch<React.SetStateAction<string[]>>;
	selectedTypes: string[];
	setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
	onCloseModal?: () => void;
	setTypeMatch: React.Dispatch<React.SetStateAction<"part" | "all">>;
	typeMatch: string;
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
	setTypeMatch,
}: FormBtnProps) {
	const [isPending, transitionRouter] = useTransitionRouter();
	const searchParams = useSearchParams();
	const currentLocale = useCurrentLocale();
	const query = searchParams.get("query");
	const generation = searchParams.get("gen");
	const type = searchParams.get("type");
	const match = (searchParams.get("match") || "all") as "part" | "all";
	const [prevSearchParams, setPrevSearchParams] = useState(searchParams.toString());
	const { t } = useTranslation();

	// synchronizing state, the reason I'm synchronizing states in this component is that the data requires searchParams.
	useLayoutEffect(() => {
		setSearchQuery((sq) => (query ? query : sq));
		setSelectedGenerations((sg) =>
			generation
				? generation.split(",").map((g) => "generation-".concat(g))
				: sg
		);
		setSelectedTypes((st) => {
			return type ? (st.toString() === type ? st : type?.split(",")) : st;
		});
		if (match === "part") {
			setTypeMatch(match);
		}
	}, [
		query,
		generation,
		type,
		match,
		setSearchQuery,
		setSelectedGenerations,
		setSelectedTypes,
		setTypeMatch,
	]);

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
				match: typeMatch,
			});

			if (onCloseModal) {
				onCloseModal();
			}

			if (prevSearchParams !== newSearchParams) {
				transitionRouter.replace(
					`/${currentLocale}/pokemons/search?${newSearchParams}`
				);
				setPrevSearchParams(newSearchParams);
			};
		};

		// By attaching the submit event when FormBtn mounts, we don't have to read useSearchParams in Search component in which if we do, it will cause the whole tree down below to render on the client if the route is statically rendered on the server.
		formNode.addEventListener("submit", handleSubmit);

		return () => {
			formNode.removeEventListener("submit", handleSubmit);
		};
	}, [
		searchQuery,
		selectedTypes,
		selectedGenerations,
		formRef,
		transitionRouter,
		searchParams,
		currentLocale,
		typeMatch,
	]);

	return (
		<Button
			variant="contained"
			type="submit"
			disabled={isPending}
			className="w-100 my-3"
		>
			{t('search')}
		</Button>
	);
});

export default FormBtn;