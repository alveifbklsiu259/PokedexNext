"use client";
import React, { useState, memo, useCallback, type ReactElement } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useRouter } from "next/navigation";
import LanguageMenu from "./language-menu";
import Search from "./pokemons/search";
import { FaMagnifyingGlass } from "react-icons/fa6";
import {
	CachedAllPokemonNamesAndIds,
	CachedGeneration,
	CachedType,
} from "../slices/pokemon-data-slice";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCurrentLocale } from "@/lib/hooks";
import { useTranslation } from "react-i18next";

type HideOnScrollProps = {
	children: ReactElement;
};

const HideOnScroll = ({ children }: HideOnScrollProps) => {
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
};

const Modal = dynamic(() => import("@/components/modal"));

export default function NavBar({
	generations,
	types,
	namesAndIds,
}: NavBarProps) {
	const [isModalShown, setIsModalShown] = useState(false);

	const handleCloseModal = useCallback(() => {
		setIsModalShown(false);
	}, [setIsModalShown]);

	return (
		<div className="navbar">
			<MainBar setIsModalShown={setIsModalShown} />
			{isModalShown && (
				<Modal
					isModalShown={isModalShown}
					setIsModalShown={setIsModalShown}
					customClass="modalBody searchModal"
				>
					<Search
						generations={generations}
						types={types}
						namesAndIds={namesAndIds}
						onCloseModal={handleCloseModal}
					/>
				</Modal>
			)}
		</div>
	);
}

type MainBarProps = {
	setIsModalShown: React.Dispatch<React.SetStateAction<boolean>>;
};

const MainBar = memo<MainBarProps>(function MainBar({ setIsModalShown }) {
	const currentLocale = useCurrentLocale();
	const {t} = useTranslation();
	return (
		<Box sx={{ flexGrow: 1, mb: 9 }}>
			<HideOnScroll>
				<AppBar
					sx={{
						bgcolor: (theme) => theme.palette.primary.light,
						position: "fixed",
					}}
				>
					<Toolbar sx={{ justifyContent: "space-between" }}>
						<Link
							href={`/${currentLocale}/pokemons`}
							className="text-white h3 text-decoration-none"
						>
							{t('pokedex')}
						</Link>
						<Box sx={{ display: "flex" }}>
							<Button
								size="large"
								variant="contained"
								onClick={() => setIsModalShown(true)}
							>
								<FaMagnifyingGlass className="icon"></FaMagnifyingGlass>
							</Button>
							<LanguageMenu />
						</Box>
					</Toolbar>
				</AppBar>
			</HideOnScroll>
		</Box>
	);
});
