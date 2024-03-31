import { memo, useCallback } from "react";
import FilterGeneration from "./filter-generation";
import FilterTypes from "./filter-types";
import { useTranslation } from "react-i18next";
import type { CachedGeneration, CachedType, SelectedTypes } from "@/lib/definitions";
import { Button } from "@mui/material";

type AdvancedSearchProps = {
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
	selectedTypes: SelectedTypes,
	setSelectedTypes: React.Dispatch<React.SetStateAction<SelectedTypes>>,
	selectedGenerations: string[],
	setSelectedGenerations: React.Dispatch<React.SetStateAction<string[]>>,
	setTypeMatch: React.Dispatch<React.SetStateAction<"all" | "part">>,
	typeMatch: string,
	generations: CachedGeneration,
	types: CachedType,
};

const AdvancedSearch = memo<AdvancedSearchProps>(function AdvancedSearch({
	setSearchQuery,
	selectedTypes,
	setSelectedTypes,
	selectedGenerations,
	setSelectedGenerations,
	setTypeMatch,
	typeMatch,
	generations,
	types,
}) {
	const handleReset = useCallback(() => {
		// if no state update needed, return the same state to prevent re-render.
		setSelectedTypes(st => !st.length ? st : []);
		setSelectedGenerations(sg => !sg.length ? sg : []);
		setSearchQuery('');
	}, [setSelectedTypes, setSelectedGenerations, setSearchQuery])
	return (
		<div>
			<div className="container m-0 row justify-content-center">
				<FilterGeneration
					selectedGenerations={selectedGenerations}
					setSelectedGenerations={setSelectedGenerations}
					generations={generations}
				/>
				<FilterTypes
					selectedTypes={selectedTypes}
					setSelectedTypes={setSelectedTypes}
					setTypeMatch={setTypeMatch}
					typeMatch={typeMatch}
					types={types}
				/>
				<ResetBtn onClick={handleReset} />
			</div>
		</div>
	)
});
export default AdvancedSearch;

type ResetBtnProps = {
	onClick: () => void
};

const ResetBtn = memo(function ResetBtn({ onClick }: ResetBtnProps) {
	const { t } = useTranslation();

	return (
		<Button
			onClick={onClick}
			variant="contained"
			color="error"
			className=" resetBtn"
		>{t('reset')}
		</Button>
	)
})