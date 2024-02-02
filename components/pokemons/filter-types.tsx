import { memo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Switch, Stack, Typography, FormControlLabel } from '@mui/material';
import { getNameByLanguage } from '@/lib/util';
import type { SelectedTypes } from '@/slices/search-slice';
import { CachedType } from '@/slices/pokemon-data-slice';
import { LanguageOption } from '@/app/[language]/page';
import { MemoImage } from '../memos';

type FilterTypesProps = {
	selectedTypes: SelectedTypes
	setSelectedTypes: React.Dispatch<React.SetStateAction<SelectedTypes>>,
	setTypeMatch: React.Dispatch<React.SetStateAction<"all" | "part">>,
	typeMatch: string,
	types: CachedType
};

const FilterTypes = memo<FilterTypesProps>(function FilterTypes ({selectedTypes, setSelectedTypes, setTypeMatch,typeMatch, types}) {

	const handleSelectType = useCallback((type: string) => {
		setSelectedTypes(st => {
			const update = [...st];
			if (update.includes(type)) {
				update.splice(update.indexOf(type), 1);
			} else {
				update.push(type)
			};
			return update;
		});
	}, [setSelectedTypes]);

	// const image = useMemo(() => <Image width='150' height='150' className="pokeBall" src='/ball.svg' alt="pokeBall" />, [])

	// have a custom memo Image or Link



	return (
		<ul className="typesFilter col-12 col-sm-6 row justify-content-center gap-3">
			<div>
				<h3 ><MemoImage width='150' height='150' className="pokeBall" src='/ball.svg' alt="pokeBall" /> Types</h3>
				<MatchMethod setTypeMatch={setTypeMatch} typeMatch={typeMatch} />
			</div>
			{Object.keys(types).filter(type => type !== 'unknown' && type !== 'shadow').map(type => (
				<Type 
					key={type}
					type={type}
					isTypeSelected={selectedTypes.includes(type)}
					onSelectType={handleSelectType}
					types={types}
				/>
			))}
		</ul>
	)
});

type TypeProps = {
	type: string,
	isTypeSelected: boolean, 
	onSelectType: (type: string) => void,
	types: CachedType
}

const Type = memo<TypeProps>(function Type({type, isTypeSelected, onSelectType, types}) {
	const params = useParams();
	const language = params.language as LanguageOption;

	return (
		<li
			onClick={() => onSelectType(type)} 
			className={`type type-${type} ${isTypeSelected ? 'active' : ''}`}
		>
			{getNameByLanguage(type, language, types[type])}
		</li>
	)
});

type MatchMethodProps = {
	setTypeMatch: React.Dispatch<React.SetStateAction<"all" | "part">>,
	typeMatch: string
}

const MatchMethod = memo<MatchMethodProps>(function MatchMethod({setTypeMatch, typeMatch}) {

	// we can use useSearchParams to read typeMatch, but that would cause this component to be only client side rendered.
	const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
		if(e.target.checked) {
			setTypeMatch('part');
		} else {
			setTypeMatch('all');
		};
	};

	return (
		<Stack direction="row" spacing={1} justifyContent="center" alignItems="baseLine">
			<Typography>All</Typography>
			<FormControlLabel
				control={<Switch color="primary" onChange={handleClick} />}
				label="Match"
				labelPlacement="bottom"
				checked={typeMatch === 'part'}
			/>
			<Typography>Part</Typography>
		</Stack>
	);
});

export default FilterTypes;


// should I pass matchMethod down to this comp or read searchParams?