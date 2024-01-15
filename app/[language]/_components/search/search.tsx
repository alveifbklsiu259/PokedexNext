"use client";
import Image from "next/image";
import { Suspense, memo, useLayoutEffect, useRef, useState } from "react";
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


const Search = memo(function Search({
	generations,
	types,
	namesAndIds,
	onCloseModal
}: SearchProps) {
	// const dispatch = useAppDispatch();
	const [isAdvancedShown, setIsAdvancedShown] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGenerations, setSelectedGenerations] = useState<string[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [typeMatch, setTypeMatch] = useState<"all" | "part">("all");
	// const collapseBtnRef = useRef<HTMLButtonElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleShowAdvanced = () => {
		setIsAdvancedShown(!isAdvancedShown);
	};

	// auto focus when modal is opened.
	useLayoutEffect(() => {
		if (onCloseModal) {
			inputRef.current!.focus();
		};
	}, [onCloseModal]);

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
						setTypeMatch={setTypeMatch}
						typeMatch={typeMatch}
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
						onCloseModal={onCloseModal}
						setTypeMatch={setTypeMatch}
						typeMatch={typeMatch}
					/>
				</Suspense>
			</form>
		</div>
	);
}, (prevProps: Readonly<SearchProps>, nextProps: Readonly<SearchProps>) => {
	// This component is rendered by a statically server-rendered route, the props passed to it should always be the same, but I don't know why the props change on every navigation.
	// Is it because of this? "Props passed from the Server to Client Components need to be serializable by React."
	// ref: https://react-cn.github.io/react/tips/self-closing-tag.html
	
	// another approach would be passing serialized data down using JSON.stringify*(data)
	return true;
});

export default Search;