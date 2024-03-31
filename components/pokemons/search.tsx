"use client";
import { Suspense, memo, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { AiOutlineCaretDown } from "react-icons/ai";
import type {
	CachedAllPokemonNamesAndIds,
	CachedGeneration,
	CachedType,
} from "@/lib/definitions";
import FormBtn from "./form-btn";
import AdvancedSearch from "./advanced-search";
import Input from "./input";
import { MemoImage } from "../memos";
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography } from "@mui/material";

type SearchProps = {
	onCloseModal?: () => void;
	viewModeRef?: React.RefObject<HTMLDivElement>;
	generations: CachedGeneration;
	types: CachedType;
	namesAndIds: CachedAllPokemonNamesAndIds;
};

const Search = memo(function Search({
	generations,
	types,
	namesAndIds,
	onCloseModal
}: SearchProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGenerations, setSelectedGenerations] = useState<string[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [typeMatch, setTypeMatch] = useState<"all" | "part">("all");
	const formRef = useRef<HTMLFormElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { t } = useTranslation();

	// auto focus when modal is opened.
	useLayoutEffect(() => {
		if (onCloseModal) {
			inputRef.current!.focus();
		};
	}, [onCloseModal]);

	const MemoAiOutlineCaretDown = useMemo(() => <AiOutlineCaretDown className="fa-solid fa-caret-down"></AiOutlineCaretDown>, [])

	return (
		<div className="card-body mb-4 p-4">
			<h1 className="display-4 text-center">
				<MemoImage
					className="pokeBall"
					src="/pokeBall.png"
					alt="pokeBall"
					width="46"
					height="46"
				/>{" "}
				{t('searchTitle')}
			</h1>
			<p className="lead text-center">{t('searchSubtitle')}</p>
			<form ref={formRef}>
				<Input
					searchQuery={searchQuery}
					setSearchQuery={setSearchQuery}
					ref={inputRef}
					namesAndIds={namesAndIds}
				/>
				<Accordion className="advancedSearch mt-3 text-center" sx={{
					backgroundColor: 'transparent', "&.MuiAccordion-root": {
						boxShadow: 'none',
					}, "&::before": {
						display: 'none'
					}, "& .MuiAccordionSummary-content": {
						justifyContent: 'center'
					}
				}}>
					<AccordionSummary
						expandIcon={MemoAiOutlineCaretDown}
						aria-controls="panel-content"
						id="panel-header"
						sx={{ minHeight: 'unset', height: '30px', '&.Mui-expanded': { minHeight: 'unset' } }}
					>
						<Typography>{t('advancedSearch')}</Typography>
					</AccordionSummary>
					<AccordionDetails>
						<AdvancedSearch
							setSearchQuery={setSearchQuery}
							selectedTypes={selectedTypes}
							setSelectedTypes={setSelectedTypes}
							selectedGenerations={selectedGenerations}
							setSelectedGenerations={setSelectedGenerations}
							setTypeMatch={setTypeMatch}
							typeMatch={typeMatch}
							generations={generations}
							types={types}
						/>
					</AccordionDetails>
				</Accordion>
				{/* FormBtn uses searchParams */}
				<Suspense
					fallback={
						<Button
							variant="contained"
							type="submit"
							disabled
							className="w-100 my-3"
						>
							{t('search')}
						</Button>
					}
				>
					<FormBtn
						formRef={formRef}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						selectedGenerations={selectedGenerations}
						setSelectedGenerations={setSelectedGenerations}
						selectedTypes={selectedTypes}
						setSelectedTypes={setSelectedTypes}
						onCloseModal={onCloseModal}
						setTypeMatch={setTypeMatch}
						typeMatch={typeMatch}
					/>
				</Suspense>
			</form>
		</div>
	);
});

export default Search;