'use client';
import { useState, useLayoutEffect, useRef, memo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdvancedSearch from '../_components/search/advanced-search';
import Input from '../_components/search/input';
import Image from 'next/image';
import { AiOutlineCaretDown } from 'react-icons/ai'
import { CachedAllPokemonNamesAndIds, CachedGeneration, CachedType } from '../_components/pokemonData/pokemon-data-slice';
import { updateSearchParam, updateSearchParam2 } from '@/app/_utils/util';

type SearchProps = {
	onCloseModal?: () => void,
	viewModeRef?: React.RefObject<HTMLDivElement>,
	generations: CachedGeneration,
	types: CachedType,
	namesAndIds: CachedAllPokemonNamesAndIds
};

export default function Search({generations, types, namesAndIds}: SearchProps) {
	console.log('preSearch')
	console.log('preSearch')
	console.log('preSearch')
	console.log('preSearch')
	console.log('preSearch')
	console.log('preSearch')

	// const searchParams = useSearchParams();
	const query = '';
	const generation = '';
	const type = '';
	const match = '';
	// when using searchParams, is state still needed? maybe not? then how to set state?

	// const params = new URLSearchParams(searchParams);

	// const dispatch = useAppDispatch();
	const [isAdvancedShown, setIsAdvancedShown] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedGenerations, setSelectedGenerations] = useState<string[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [matchMethod, setMatchMethod] = useState<'all' | 'part'>('all');
	// const collapseBtnRef = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const pathname = usePathname();

	const handleShowAdvanced = () => {
		setIsAdvancedShown(!isAdvancedShown);
	}

	// auto focus when modal is opened.
	// useLayoutEffect(() => {
	// 	if (onCloseModal) {
	// 		inputRef.current!.focus();
	// 	};
	// }, [onCloseModal]);

    // maybe needn't to worry about synching up, because on subsequent navigation, we use Search, not PrerenderedSearch.

	// useLayoutEffect(() => {
	// 	// synchronizing state
	// 	setSearchQuery(sp => query ? query : sp);

	// 	setSelectedGenerations(sg => generation ? generation.split(',').map(g => 'generation-'.concat(g)) : sg);
	// 	setSelectedTypes(st => type ? st.toString() === type ? st : type?.split(',') : st);
	// }, [query]);


	// when type is not selected, this param still gets added to the url, why?


	const handleSubmit = (e : React.FormEvent<HTMLFormElement>) => {
		
		console.time('submit')
		e.preventDefault();
		const newSearchParams: {[key: string]: string} = {};

		newSearchParams['query'] = searchQuery;
		newSearchParams['type'] = selectedTypes.toString();
		newSearchParams['gen'] = selectedGenerations.map(gen => gen.replace('generation-', '')).toString();
		// console.log(`${pathname}/search?${updateSearchParam(searchParams, newSearchParams)}`)

		let newPathName: string = pathname;
		if (!pathname.includes('search')) {
			newPathName = `${pathname}/search`
		};
        // what about if there's no search params, we navigate back to /[language](the statically generated route, which will be super fase);

        // we can be assured that this route will not contain any search params
		// router.prefetch(`${newPathName}?${updateSearchParam2(newSearchParams)}`);
		router.push(`${newPathName}?${updateSearchParam2(newSearchParams)}`);

		console.timeEnd('submit')
		
		// should we just navigate to the path with url param?

		// // for search modal.
		// if (onCloseModal) {
		// 	onCloseModal();
		// };
		
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
	

	return (
		<div className="card-body mb-4 p-4">
			<h1 className="display-4 text-center">
				<Image className='pokeBall' src='/pokeBall.png' alt="pokeBall" width='46' height='46' /> Search For Pokemons
			</h1>
			<p className="lead text-center">By Name or the National Pokedex number</p>
			<form onSubmit={handleSubmit}>
				<Input
					searchQuery={searchQuery} 
					setSearchQuery={setSearchQuery}
					ref={inputRef}
					namesAndIds={namesAndIds}
				/>
					<div className="advancedSearch text-center mt-3">
						<span className='showAdvanced'  onClick={() => handleShowAdvanced()}>
							Show Advanced Search <AiOutlineCaretDown className="fa-solid fa-caret-down"></AiOutlineCaretDown>
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
				<SubmitBtn />
			</form>
		</div>
	)
};

const SubmitBtn = memo(function SubmitBtn() {
	// const status = useAppSelector(selectStatus);
	// how to determin if i can submit?
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

// when we search, the Pokemons component will render at request time, is it really better than CSR? because when i'm dev testing, it's slow.
// pagination or infinite scrill, filter....