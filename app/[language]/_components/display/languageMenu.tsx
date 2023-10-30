import React, { useState, useEffect, useCallback, memo } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useAppDispatch, useAppSelector } from '@/app/_app/hooks';
import { selectLanguage, changeLanguage, languageOptions } from './displaySlice';
import { FaLanguage } from 'react-icons/fa6';

type AnchorElTypes = null | HTMLButtonElement;

const LanguageMenu = memo(function LanguageMenu() {
	const [anchorEl, setAnchorEl] = useState<AnchorElTypes>(null);
	const open = Boolean(anchorEl);
	const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		setAnchorEl(e.currentTarget);
	};

	const handleClose = useCallback(() => {
		setAnchorEl(null);
	}, [setAnchorEl]);

	useEffect(() => {
		window.addEventListener('scroll', handleClose);
		return () => {
			window.removeEventListener('scroll', handleClose);
		};
	}, [handleClose]);

	return (
		<div>
			<Button
				id="language-button"
				size='large'
				variant="contained"
				sx={{ml: 1}}
				aria-controls={open ? 'language-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={e => handleClick(e)}
			>
				<FaLanguage className="icon"></FaLanguage>
			</Button>
			{open && (
				<Menu
					disableScrollLock={true}
					id="language-menu"
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'left',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'center',
					}}
					MenuListProps={{
						'aria-labelledby': 'language-button',
					}}
					sx={{
						'& .MuiMenuItem-root:hover': {
							backgroundColor: '#8bbaff',
						},
						'& .MuiMenuItem-root.Mui-selected': {
							backgroundColor: '#0d6efd',
						},
					}}
				>
					{Object.keys(languageOptions).map(option => (
						<Item 
							key={option}
							option={option as keyof typeof languageOptions}
							handleClose={handleClose}
						/>
					))}
				</Menu>
			)}
		</div>
	);
});

type ItemProprs = {
	option: keyof typeof languageOptions,
	handleClose: () => void;
}

const Item = memo<ItemProprs>(function Item({option, handleClose}) {
	const dispatch = useAppDispatch();
	const language = useAppSelector(selectLanguage);
	// const {pokeId} = useParams();

	const handleChangeLanguage = () => {
		handleClose();
		// dispatch(changeLanguage({option, pokeId}));
		dispatch(changeLanguage({option, pokeId: undefined}));
	};

	return (
		<MenuItem
			sx={{
				mx: 1,
				my: 0.4,
				borderRadius: 2,
				'&.Mui-disabled': {
					opacity: 1
				}
			}}
			selected={option === language}
			disabled={option === language}
			onClick={handleChangeLanguage}
		>
			{languageOptions[option]}
		</MenuItem>
	)
});

export default LanguageMenu;