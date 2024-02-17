import React, { useState, useEffect, useCallback, memo, Suspense } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { FaLanguage } from "react-icons/fa6";
import { usePathname, useSearchParams } from "next/navigation";
import { useTransitionRouter } from "./transition-provider";
import i18nConfig, { type Locale } from "@/i18nConfig";
import { useCurrentLocale } from "@/lib/hooks";

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
					{i18nConfig.locales.map((locale) => (
						<Suspense key={locale} fallback={null}>
							<Item locale={locale} handleClose={handleClose} />
						</Suspense>
					))}
				</Menu>
			)}
		</div>
	);
});

type ItemProprs = {
	locale: Locale;
	handleClose: () => void;
};

const languages: {
	[P in Locale]: string
} = {
	en: "English",
	ja: "日本語",
	"zh-Hant": "繁體中文",
	"zh-Hans": "简体中文",
	ko: "한국어",
	fr: "Français",
	de: "Deutsch",
};

const Item = memo<ItemProprs>(function Item({ locale, handleClose }) {
	const pathname = usePathname();
	const currentLocale = useCurrentLocale();
	const newPath = pathname.replace(currentLocale, locale);
	const searchParams = useSearchParams();
	const [_, transitionRouter] = useTransitionRouter();

	console.log(searchParams)

	const handleChangeLanguage = () => {
		handleClose();	

		/* set cookie for next-i18n-router
		const days = 30;
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		const expires = date.toUTCString();
		document.cookie = `NEXT_LOCALE=${locale};expires=${expires};path=/`; 
		*/
		transitionRouter.replace(`${newPath}?${searchParams.toString()}`);
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
			selected={locale === currentLocale}
			disabled={locale === currentLocale}
			onClick={handleChangeLanguage}
		>
			{languages[locale]}
		</MenuItem>
	);
});

export default LanguageMenu;


// hair
// mask
// cell phone case