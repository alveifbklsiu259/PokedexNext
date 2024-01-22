import { memo, useMemo } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useAppDispatch, useAppSelector } from '@/app/_app/hooks';
import { selectViewMode, sortPokemons, tableInfoChanged, changeViewMode } from '../../slices/display-slice';
import type { TableInfoRefTypes } from '../../app/[language]/_components/pokemonData/pokemons';
import { BsListUl } from 'react-icons/bs'
import { FaTableCellsLarge } from 'react-icons/fa6'

type ViewModeProps = {
	tableInfoRef: React.MutableRefObject<TableInfoRefTypes>
};

const ViewMode = memo(function ViewMode({tableInfoRef}: ViewModeProps) {
	const dispatch = useAppDispatch();
	const viewMode = useAppSelector(selectViewMode);

	const handleChange = async(event: React.MouseEvent<HTMLElement, MouseEvent>, nextView: typeof viewMode | null) => {
		if (nextView === 'module') {
			if (tableInfoRef.current.sortBy ) {
				// if the table is resorted, change sortBy when view mode is changed to module.
				dispatch(sortPokemons(tableInfoRef.current.sortBy));
				delete tableInfoRef.current.sortBy;
			};
			dispatch(tableInfoChanged({...tableInfoRef.current, selectedPokemonId: null}));
			tableInfoRef.current = {};
		};
		if (nextView !== null) {
			dispatch(changeViewMode({
				viewMode: nextView
			}));
		};
	};

	const listBtn = useMemo(() => (
		<ToggleButton value="list" aria-label="list" >
			<BsListUl className="icon"></BsListUl>
		</ToggleButton>
	), []);

	const moduleBtn = useMemo(() => (
		<ToggleButton value="module" aria-label="module">
			<FaTableCellsLarge className="icon"></FaTableCellsLarge>
		</ToggleButton>
	), []);

	return (
		<div className='mb-3 viewMode'>
			<ToggleButtonGroup
				value={viewMode}
				exclusive
				onChange={handleChange}
			>
				{listBtn}
				{moduleBtn}
			</ToggleButtonGroup>
		</div>
	)
});
export default ViewMode;