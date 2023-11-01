import { memo } from "react";
import { advancedSearchReset, type SelectedTypes, type SelectedGenerations } from "./search-slice";
import FilterGeneration from "./filter-generation";
import FilterTypes from "./filter-types";
import { CachedGeneration, CachedType } from "../pokemonData/pokemon-data-slice";
// import { useAppDispatch } from "../../_app/hooks";

type AdvancedSearchProps = {
	setSearchParam: React.Dispatch<React.SetStateAction<string>>,
	selectedTypes: SelectedTypes,
	setSelectedTypes: React.Dispatch<React.SetStateAction<SelectedTypes>>,
	selectedGenerations: string[],
	setSelectedGenerations: React.Dispatch<React.SetStateAction<string[]>>,
	setMatchMethod: React.Dispatch<React.SetStateAction<"all" | "part">>,
	generations: CachedGeneration,
	types: CachedType,
	isAdvancedShown: boolean
	// collapseId: string
};

const AdvancedSearch = memo<AdvancedSearchProps>(function AdvancedSearch({
	setSearchParam,
	selectedTypes,
	setSelectedTypes,
	selectedGenerations,
	setSelectedGenerations,
	setMatchMethod,
	generations,
	types,
	isAdvancedShown
	// collapseId
}) {
	// const dispatch = useAppDispatch();
	const handleReset = () => {
		// if no state update needed, return the same state to prevent re-render.
		// setSelectedTypes(st => !st.length ? st : []);
		// setSelectedGenerations(sg => !Object.keys(sg).length ? sg : {});
		// setSearchParam('');
		// dispatch(advancedSearchReset());
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
					setMatchMethod={setMatchMethod}
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