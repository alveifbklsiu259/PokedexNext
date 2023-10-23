import { useState, useLayoutEffect, useRef, useId, memo } from 'react';
import { selectStatus } from '../display/displaySlice';
import { selectSearchParam, selectAdvancedSearch, searchPokemon } from './searchSlice';
import { useRouter } from 'next/navigation';
import AdvancedSearch from './advancedSearch';
import Input from './input';
import { useAppDispatch, useAppSelector } from '../../_app/hooks';
import Image from 'next/image';
import { AiOutlineCaretDown } from 'react-icons/ai'

type SearchProps = {
	onCloseModal?: () => void;
	viewModeRef?: React.RefObject<HTMLDivElement>
};

export default function Search({onCloseModal, viewModeRef} : SearchProps) {
	const dispatch = useAppDispatch();
	const advancedSearch = useAppSelector(selectAdvancedSearch);
	const cachedSearchParam = useAppSelector(selectSearchParam);
	const [searchParam, setSearchParam] = useState(cachedSearchParam);
	const [selectedGenerations, setSelectedGenerations] = useState(advancedSearch.generations);
	const [selectedTypes, setSelectedTypes] = useState(advancedSearch.types);
	const [matchMethod, setMatchMethod] = useState<'all' | 'part'>('all');
	// const collapseBtnRef = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const collapseId = useId();
	const router = useRouter();

	// auto focus when modal is opened.
	useLayoutEffect(() => {
		if (onCloseModal) {
			inputRef.current!.focus();
		};
	}, [onCloseModal]);

	const handleIconChange = () => {
		// if (collapseBtnRef.current?.closest('button')?.getAttribute('aria-expanded') === 'true') {
		// 	collapseBtnRef.current.classList.remove('fa-caret-down');
		// 	collapseBtnRef.current.classList.add('fa-caret-up');
		// } else {
		// 	collapseBtnRef.current?.classList.remove('fa-caret-up');
		// 	collapseBtnRef.current?.classList.add('fa-caret-down');
		// };
	};

	const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// for search modal.
		if (onCloseModal) {
			onCloseModal();
		};
		
		if (viewModeRef?.current) {
			// search from root
			viewModeRef.current.scrollIntoView();
		} else {
			// search from navbar, could be at root or /pokemons/xxx.
			if (!document.querySelector('.viewModeContainer')) {
				// navigateNoUpdates('/', {state: 'resetPosition'});
				router.push('/');
			};
			setTimeout(() => {
				document.querySelector('.viewModeContainer')?.scrollIntoView();
			}, 10);
		};
		dispatch(searchPokemon({searchParam, selectedGenerations, selectedTypes, matchMethod}));
	};
	
	useLayoutEffect(() => {
		// synchronizing state
		setSearchParam(cachedSearchParam);
		setSelectedGenerations(sg => JSON.stringify(advancedSearch.generations) !== JSON.stringify(sg) ? advancedSearch.generations : sg);
		setSelectedTypes(st => JSON.stringify(advancedSearch.types) !== JSON.stringify(st) ? advancedSearch.types : st);
	}, [cachedSearchParam, advancedSearch]);

	return (
		<div className="card-body mb-4 p-4">
			<h1 className="display-4 text-center">
				<Image className='pokeBall' src='/pokeBall.png' alt="pokeBall" width='46' height='46' /> Search For Pokemons
			</h1>
			<p className="lead text-center">By Name or the National Pokedex number</p>
			<form onSubmit={handleSubmit}>
				<Input
					searchParam={searchParam} 
					setSearchParam={setSearchParam}
					ref={inputRef}
				/>
					<div className="advancedSearch text-center mt-3">
						<button type="button" data-bs-toggle="collapse" data-bs-target={`#${collapseId}`} aria-expanded='false' aria-controls={collapseId} onClick={handleIconChange}>
							{/* Show Advanced Search <AiOutlineCaretDown ref={collapseBtnRef} className="fa-solid fa-caret-down"></AiOutlineCaretDown> */}
							Show Advanced Search <AiOutlineCaretDown className="fa-solid fa-caret-down"></AiOutlineCaretDown>
						</button>
						<AdvancedSearch
							setSearchParam={setSearchParam}
							selectedTypes={selectedTypes}
							setSelectedTypes={setSelectedTypes}
							selectedGenerations={selectedGenerations}
							setSelectedGenerations={setSelectedGenerations}
							setMatchMethod={setMatchMethod}
							collapseId={collapseId}
						/>
					</div>
				<SubmitBtn />
			</form>
		</div>
	)
};

const SubmitBtn = memo(function SubmitBtn() {
	const status = useAppSelector(selectStatus);
	return (
		<button
			disabled={status === 'loading' ? true : false}
			className="btn btn-primary btn-lg btn-block w-100 my-3" 
			type="submit"
		>
			Search
		</button>
	);
});