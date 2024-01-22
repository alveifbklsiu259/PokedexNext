import { memo } from "react";
import type { SelectedTypes } from "@/slices/search-slice";
import FilterGeneration from "./filter-generation";
import FilterTypes from "./filter-types";
import { CachedGeneration, CachedType } from "@/slices/pokemon-data-slice";

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
	isAdvancedShown: boolean
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
	isAdvancedShown
}) {
	const handleReset = () => {
		// if no state update needed, return the same state to prevent re-render.
		setSelectedTypes(st => !st.length ? st : []);
		setSelectedGenerations(sg => !sg.length ? sg : []);
		setSearchQuery('');
	};
	return (
		<div className={`advancedSearchContent ${!isAdvancedShown ? 'hide' : ''}`}>
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
				<button
					onClick={handleReset}
					type="button"
					className="btn btn-md resetBtn bg-danger"
				>Reset
				</button>
			</div>
		</div>
	)
});
export default AdvancedSearch;