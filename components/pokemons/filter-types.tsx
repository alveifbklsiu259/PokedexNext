import { memo, useCallback } from 'react';
import { Switch, Stack, Typography, FormControlLabel } from '@mui/material';
import { getNameByLanguage } from '@/lib/util';
import type { CachedType, SelectedTypes } from '@/lib/definitions';
import { MemoImage } from '../memos';
import { useCurrentLocale } from '@/lib/hooks';
import { useTranslation } from 'react-i18next';

type FilterTypesProps = {
	selectedTypes: SelectedTypes
	setSelectedTypes: React.Dispatch<React.SetStateAction<SelectedTypes>>,
	setTypeMatch: React.Dispatch<React.SetStateAction<"all" | "part">>,
	typeMatch: string,
	types: CachedType
};

const FilterTypes = memo<FilterTypesProps>(function FilterTypes({ selectedTypes, setSelectedTypes, setTypeMatch, typeMatch, types }) {
	const { t } = useTranslation();
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

	return (
		<ul className="typesFilter col-12 col-sm-6 row justify-content-center gap-3">
			<div>
				<h3 ><MemoImage width='150' height='150' className="pokeBall" src='/ball.svg' alt="pokeBall" /> {t('types')}</h3>
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

const Type = memo<TypeProps>(function Type({ type, isTypeSelected, onSelectType, types }) {
	const currentLocale = useCurrentLocale();

	return (
		<li
			onClick={() => onSelectType(type)}
			className={`type type-${type} ${isTypeSelected ? 'active' : ''}`}
		>
			{getNameByLanguage(type, currentLocale, types[type])}
		</li>
	)
});

type MatchMethodProps = {
	setTypeMatch: React.Dispatch<React.SetStateAction<"all" | "part">>,
	typeMatch: string
}

const MatchMethod = memo<MatchMethodProps>(function MatchMethod({ setTypeMatch, typeMatch }) {
	const { t } = useTranslation();
	// we can use useSearchParams to read typeMatch, but that would cause this component to be only client side rendered.
	const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.checked) {
			setTypeMatch('part');
		} else {
			setTypeMatch('all');
		};
	};

	return (
		<Stack direction="row" spacing={1} justifyContent="center" alignItems="baseLine">
			<Typography>{t('matchAll')}</Typography>
			<FormControlLabel
				control={<Switch color="primary" onChange={handleClick} />}
				label={t('match')}
				labelPlacement="bottom"
				checked={typeMatch === 'part'}
			/>
			<Typography>{t('matchPart')}</Typography>
		</Stack>
	);
});

export default FilterTypes;