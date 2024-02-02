import { useRef, useState, useMemo, memo, useCallback, forwardRef} from "react";
import { flushSync } from "react-dom";
import { FaXmark } from 'react-icons/fa6'
import DataList from './data-list';
import { CachedAllPokemonNamesAndIds } from "@/slices/pokemon-data-slice";

type InputProps = {
	searchQuery: string,
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
	namesAndIds: CachedAllPokemonNamesAndIds
};

const Input = forwardRef(function Input({searchQuery, setSearchQuery, namesAndIds}: InputProps, forwardedInputRef: React.ForwardedRef<HTMLInputElement> | undefined) {
	const [isDataListShown, setIsDataListShown] = useState(false);
	const [hoveredPokemon, setHoveredPokemon] = useState('');
	const [currentFocus, setCurrentFocus] = useState(-1);
	const datalistRef = useRef<HTMLDivElement>(null);
	
	// there's no inputRef passed down from ErrorPage.js
	const inputRefForErrorPage = useRef<HTMLInputElement>(null);
	// we'll not use ref callback in our component
	const inputRef = useMemo(() => forwardedInputRef ? forwardedInputRef as React.RefObject<HTMLInputElement> : inputRefForErrorPage, [forwardedInputRef, inputRefForErrorPage]);

	const matchList = useMemo(() => {
		const match = Object.keys(namesAndIds).filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()));
		const sortedByStart = match.filter(name => name.startsWith(searchQuery)).sort((a,b) => a.localeCompare(b));
		const remainder = match.filter(name => !sortedByStart.includes(name)).sort((a,b) => a.localeCompare(b));
		return searchQuery !== '' ? sortedByStart.concat(remainder) : [];
	}, [namesAndIds, searchQuery]);

	const activePokemon = matchList[currentFocus];

	const resetFocus = useCallback((datalist: HTMLDivElement) => {
		setCurrentFocus(-1);
		// reset previous auto focus
		datalist.scrollTop = 0;
	}, []);

	const handleFocus = () => {
		if (matchList.length === 1 && matchList[0] === searchQuery) {
			setIsDataListShown(false);
		} else if (matchList.length > 1) {
			setIsDataListShown(true);
		};
	};

	const handleBlur = () => {
		// only blur out when not hovering pokemon names
		if (hoveredPokemon === '') {
			resetFocus(datalistRef.current!);
			setIsDataListShown(false);
		};
	};

	const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
		setIsDataListShown(true);
		setSearchQuery(e.currentTarget.value);
		resetFocus(datalistRef.current!);
	};

	const handleClearInput = useCallback(() => {
		flushSync(() => {setSearchQuery('')});
		resetFocus(datalistRef.current!);
		// for mobile
		setHoveredPokemon('');
		inputRef.current!.focus();
	}, [resetFocus, datalistRef, inputRef])

	const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		const datalist = datalistRef.current!;
		const focusName = (datalist: HTMLDivElement, nextFocus: number) => {
			setCurrentFocus(nextFocus);
			// auto focus on screen
			datalist.scrollTop = (datalist.children[nextFocus] as HTMLElement).offsetTop - datalist.offsetTop;
		};

		switch (e.key) {
			case 'ArrowDown' : {
				e.preventDefault();
				if (matchList.length) {
					let nextFocus;
					if (currentFocus + 1 >= matchList.length) {
						nextFocus = 0;
					} else {
						nextFocus = currentFocus + 1;
					}
					focusName(datalist, nextFocus);
				};
				break;
			}
			case 'ArrowUp' : {
				e.preventDefault();
				if (matchList.length) {
					let nextFocus;
					if (currentFocus <= 0) {
						nextFocus = matchList.length - 1;
					} else {
						nextFocus = currentFocus - 1;
					}
					focusName(datalist, nextFocus);
				};
				break;
			}
			case 'Enter' : {
				if (currentFocus > -1) {
					e.preventDefault();
					(datalist.children[currentFocus] as HTMLElement).click();
				};
				setIsDataListShown(false);
				break;
			}
			case 'Escape' : {
				setIsDataListShown(false);
				setSearchQuery('');
				resetFocus(datalist);
				break;
			}
			default : 
			// most of the input changes are handled by handleInput
		};
	}, [currentFocus, setSearchQuery, matchList.length, resetFocus]);

	return (
		<div className="form-group position-relative searchInput">
			<div className="position-relative">
				<input
					ref={inputRef}
					autoComplete='off'
					id="searchInput"
					type="search"
					//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/search  check if we can rewrite datalist
					className={`form-control form-control-lg ${isDataListShown && matchList.length ? 'showDatalist' : ''}`}
					value={searchQuery}
					onFocus={handleFocus}
					onBlur={handleBlur}
					onInput={handleInput}
					onKeyDown={handleKeyDown}
				/>
				{/* <ClearBtn onClick={handleClearInput} hasText={!!searchQuery} /> */}
			</div>
			<DataList
				matchList={matchList}
				ref={datalistRef}
				inputRef={inputRef}
				isDataListShown={isDataListShown}
				setIsDataListShown={setIsDataListShown}
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				hoveredPokemon={hoveredPokemon}
				setHoveredPokemon={setHoveredPokemon}
				activePokemon={activePokemon}
				resetFocus={resetFocus}
				namesAndIds={namesAndIds}
			/>
		</div>
	)
});
export default memo(Input);

type ClearBtnProps = {
	hasText: boolean,
	onClick: () => void
}

const ClearBtn = memo(function ClearBtn({hasText, onClick}: ClearBtnProps) {
	return <FaXmark className={`xmark ${!hasText ? 'd-none' : ''}`} onClick={onClick}></FaXmark>
})