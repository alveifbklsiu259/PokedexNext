'use client'
import React, { useState, memo, useCallback, type ReactElement } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import { useParams, useRouter } from 'next/navigation';
import LanguageMenu from './language-menu';
import Modal from '@/app/_components/modal';
import Search from './_components/search/search';
import { FaMagnifyingGlass } from 'react-icons/fa6'
import { CachedAllPokemonNamesAndIds, CachedGeneration, CachedType } from './_components/pokemonData/pokemon-data-slice';
import Link from 'next/link';

type HideOnScrollProps = {
	children: ReactElement
}

const HideOnScroll = ({children}: HideOnScrollProps) => {
	const trigger = useScrollTrigger();

	return (
		<Slide appear={false} direction="down" in={!trigger}>
			{children}
		</Slide>
	);
};

type NavBarProps = {
    generations: CachedGeneration;
	types: CachedType;
	namesAndIds: CachedAllPokemonNamesAndIds;
}

export default function NavBar({generations, types, namesAndIds}: NavBarProps) {
	const [isModalShown, setIsModalShown] = useState(false);

	const handleCloseModal = useCallback(() => {
		setIsModalShown(false);
	}, [setIsModalShown]);

	return (
		<div className='navbar'>
			<MainBar setIsModalShown={setIsModalShown}/>
			{isModalShown && (
				<Modal
					isModalShown={isModalShown}
					setIsModalShown={setIsModalShown}
					customClass='modalBody searchModal'
				>
					<Search generations={generations} types={types} namesAndIds={namesAndIds} onCloseModal={handleCloseModal}/>
				</Modal>
			)}
		</div>
	);
};

type MainBarProps = {
	setIsModalShown: React.Dispatch<React.SetStateAction<boolean>>
}

const MainBar = memo<MainBarProps>(function MainBar({setIsModalShown}) {
    const params = useParams();
    const {language} = params

	// const dispatch = useAppDispatch();
	const handleShowModal = () => {
		setIsModalShown(true);
		// dispatch(advancedSearchReset());
	};
	
	return (
		<Box sx={{ flexGrow: 1, mb: 9 }}>
			<HideOnScroll>
				<AppBar sx={{bgcolor: theme => theme.palette.primary.light, position: 'fixed'}}>
					<Toolbar sx={{justifyContent: 'space-between'}}>
					{/* <BackToRootBtn /> */}
                    <Link href={`/${language}/pokemons`}>Pokedex</Link>
					<Box sx={{display: 'flex'}}>
						<Button size='large' variant="contained" onClick={handleShowModal}>
							<FaMagnifyingGlass className="icon"></FaMagnifyingGlass>
						</Button>
						<LanguageMenu />
					</Box>
					</Toolbar>
				</AppBar>
			</HideOnScroll>
		</Box>
	)
});

const BackToRootBtn = memo(function BackToRootBtn() {
	// const dispatch = useAppDispatch();
	// const status = useAppSelector(selectStatus);
	const router = useRouter();
	// const handleBackToRoot = () => {
	// 	dispatch(backToRoot());
	// 	router.push('/');
	// };

	return (
		// <button className={`nav-btn ${status === 'loading' ? 'nav-btn-not-allowed' : ''}`} disabled={status === 'loading'} onClick={handleBackToRoot}>Pokedex</button>
        <p>Pokedex</p>
	)
});