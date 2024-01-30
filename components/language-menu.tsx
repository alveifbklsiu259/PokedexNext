import React, { useState, useEffect, useCallback, memo, Suspense } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {
	LanguageOption,
	languageOptions,
} from "../slices/display-slice";
import { FaLanguage } from "react-icons/fa6";
import {
	useParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import { useCustomTransition, useTransitionRouter } from "./transition-context";



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
		window.addEventListener("scroll", handleClose);
		return () => {
			window.removeEventListener("scroll", handleClose);
		};
	}, [handleClose]);

	return (
		<div>
			<Button
				id="language-button"
				size="large"
				variant="contained"
				sx={{ ml: 1 }}
				aria-controls={open ? "language-menu" : undefined}
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				onClick={(e) => handleClick(e)}
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
						vertical: "bottom",
						horizontal: "left",
					}}
					transformOrigin={{
						vertical: "top",
						horizontal: "center",
					}}
					MenuListProps={{
						"aria-labelledby": "language-button",
					}}
					sx={{
						"& .MuiMenuItem-root:hover": {
							backgroundColor: "#8bbaff",
						},
						"& .MuiMenuItem-root.Mui-selected": {
							backgroundColor: "#0d6efd",
						},
					}}
				>
					{Object.keys(languageOptions).map((option) => (
						<Suspense key={option} fallback={null}>
							<Item
								option={option as keyof typeof languageOptions}
								handleClose={handleClose}
							/>
						</Suspense>
					))}
				</Menu>
			)}
		</div>
	);
});

type ItemProprs = {
	option: keyof typeof languageOptions;
	handleClose: () => void;
};

const Item = memo<ItemProprs>(function Item({ option, handleClose }) {
	const params = useParams();
	const pathname = usePathname();
	const language = params.language as string;
	const newPath = pathname.replace(language, option);
	const searchParams = useSearchParams();
	const [isPending, transitionRouter] = useTransitionRouter();

	const handleChangeLanguage = (option: LanguageOption) => {
		handleClose();
		// dispatch(changeLanguage({option, pokeId}));
		// dispatch(changeLanguage({option, pokeId: undefined}));
		transitionRouter.replace(
			`${newPath}?${searchParams.toString()}`
		)
	};

	return (
		<MenuItem
			sx={{
				mx: 1,
				my: 0.4,
				borderRadius: 2,
				"&.Mui-disabled": {
					opacity: 1,
				},
			}}
			selected={option === language}
			disabled={option === language}
			onClick={() => handleChangeLanguage(option)}
		>
			{languageOptions[option]}
		</MenuItem>
	);
});

export default LanguageMenu;
