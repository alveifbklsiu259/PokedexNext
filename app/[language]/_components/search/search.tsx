"use client";
import Image from "next/image";
import { Suspense, memo, useRef, useState } from "react";
import { AiOutlineCaretDown } from "react-icons/ai";
import type {
	CachedAllPokemonNamesAndIds,
	CachedGeneration,
	CachedType,
} from "../pokemonData/pokemon-data-slice";
import FormBtn from "./formBtn";
import AdvancedSearch from "./advanced-search";
import Input from "./input";

type SearchProps = {
	onCloseModal?: () => void;
	viewModeRef?: React.RefObject<HTMLDivElement>;
	generations: CachedGeneration;
	types: CachedType;
	namesAndIds: CachedAllPokemonNamesAndIds;
};


const Search = function Search({
	generations,
	types,
	namesAndIds,
}: SearchProps) {

	// const dispatch = useAppDispatch();
	const [isAdvancedShown, setIsAdvancedShown] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGenerations, setSelectedGenerations] = useState<string[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [matchMethod, setMatchMethod] = useState<"all" | "part">("all");
	// const collapseBtnRef = useRef<HTMLButtonElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleShowAdvanced = () => {
		setIsAdvancedShown(!isAdvancedShown);
	};

	// auto focus when modal is opened.
	// useLayoutEffect(() => {
	// 	if (onCloseModal) {
	// 		inputRef.current!.focus();
	// 	};
	// }, [onCloseModal]);

	return (
		<div className="card-body mb-4 p-4">
			<h1 className="display-4 text-center">
				<Image
					className="pokeBall"
					src="/pokeBall.png"
					alt="pokeBall"
					width="46"
					height="46"
				/>{" "}
				Search For Pokemons
			</h1>
			<p className="lead text-center">By Name or the National Pokedex number</p>
			<form ref={formRef}>
				<Input
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					ref={inputRef}
					namesAndIds={namesAndIds}
				/>
				<div className="advancedSearch text-center mt-3">
					<span className="showAdvanced" onClick={() => handleShowAdvanced()}>
						Show Advanced Search{" "}
						<AiOutlineCaretDown className="fa-solid fa-caret-down"></AiOutlineCaretDown>
					</span>
					<AdvancedSearch
						setSearchQuery={setSearchQuery}
						selectedTypes={selectedTypes}
						setSelectedTypes={setSelectedTypes}
						selectedGenerations={selectedGenerations}
						setSelectedGenerations={setSelectedGenerations}
						setMatchMethod={setMatchMethod}
						generations={generations}
						types={types}
						isAdvancedShown={isAdvancedShown}
						// collapseId={collapseId}
					/>
				</div>
				{/* <SubmitBtn /> */}
				{/* FormBtn uses searchParams */}
				<Suspense
				// is there any way that we can get the JSX that the component that uses searchParams and modify it? (e.g. add disabled), instead of writing out the below code?
					fallback={
						<button
							disabled
							className="btn btn-primary btn-lg btn-block w-100 my-3"
							type="submit"
						>
							Search
						</button>
					}
					// maybe a HOC that gets the JSX of the content?
				>
					<FormBtn
						formRef={formRef}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						selectedGenerations={selectedGenerations}
						setSelectedGenerations={setSelectedGenerations}
						selectedTypes={selectedTypes}
						setSelectedTypes={setSelectedTypes}
					/>
				</Suspense>
			</form>
		</div>
	);
}

export default Search;