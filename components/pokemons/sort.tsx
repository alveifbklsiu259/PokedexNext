"use client";
import { memo, Suspense, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { FormControl, MenuItem } from "@mui/material";
import { updateSearchParam } from "@/lib/util";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "../transition-context";
import { View } from "./view-mode";
import { useCurrentLocale } from "@/lib/hooks";

export const sortOptions = [
	{ text: "Number(low - high)", value: "numberAsc" },
	{ text: "Number(high - low)", value: "numberDesc" },
	{ text: "Name(A - Z)", value: "nameAsc" },
	{ text: "Name(Z - A)", value: "nameDesc" },
	{ text: "Height(short - tall)", value: "heightAsc" },
	{ text: "Height(tall - short)", value: "heightDesc" },
	{ text: "Weight(light - heavy)", value: "weightAsc" },
	{ text: "Weight(heavy - light)", value: "weightDesc" },
	{ text: "Total-Stats(heigh - low)", value: "totalDesc" },
	{ text: "Total-Stats(low - heigh)", value: "totalAsc" },
	{ text: "Attack(heigh - low)", value: "attackDesc" },
	{ text: "Attack(low - heigh)", value: "attackAsc" },
	{ text: "HP(heigh - low)", value: "hpDesc" },
	{ text: "HP(low - heigh)", value: "hpAsc" },
	{ text: "Defense(heigh - low)", value: "defenseDesc" },
	{ text: "Defense(low - heigh)", value: "defenseAsc" },
	{ text: "Special-Attack(heigh - low)", value: "special-attackDesc" },
	{ text: "Special-Attack(low - heigh)", value: "special-attackAsc" },
	{ text: "Special-Defense(heigh - low)", value: "special-defenseDesc" },
	{ text: "Special-Defense(low - heigh)", value: "special-defenseAsc" },
	{ text: "Speed(heigh - low)", value: "speedDesc" },
	{ text: "Speed(low - heigh)", value: "speedAsc" },
] as const;

// memo(Sort, () => true) is used to avoid re-render when route changes, for some reason partial rendering does not apply to client component(not sure if it's a bug or intended), but this approach fixes it.
const Sort =
	/* memo( */
	function Sort({stats}) {
		const searchParams = useSearchParams();
		const view = (searchParams.get("view") || "card") as View;

		return (
			<>
				{view === "card" ? (
					<Box
						sx={{
							minWidth: 120,
							width: "220px",
							marginLeft: "auto",
							// marginBottom: "20px",
						}}
					>
						<FormControl fullWidth>
							<InputLabel id="sort-label">Sort</InputLabel>
							<Suspense
								fallback={
									<Select
										labelId="sort-label"
										id="sort"
										label="Sort"
										disabled
									></Select>
								}
							>
								<Dropdown />
							</Suspense>
						</FormControl>
					</Box>
				) : null}
			</>
		);
	}; /*,
	() => true
);*/
export default Sort;

// since Dropdown uses useSearchParams, when searchParams changes, it will re-render anyway as context change, so there's no need to wrap it in a memo.

const Dropdown = memo(function Dropdown() {
	const [isPending, transitionRouter] = useTransitionRouter();
	const searchParams = useSearchParams();
	const currentLocale = useCurrentLocale();
	const sortParams = searchParams.get("sort") || "numberAsc";

	// is this bad for performance? because router function is marked as transition, if we just use sortParams from reading searchParams, when changin value from select, it will show the stale value.
	const [sortBy, setSortBy] = useState(sortParams);
	// see if we can use link and prefetch?
	const handleChange = (event: SelectChangeEvent) => {
		const newSearchParams = updateSearchParam(searchParams, {
			sort: event.target.value,
		});
		setSortBy(event.target.value);
		transitionRouter.replace(
			`/${currentLocale}/pokemons/search?${newSearchParams}`
			// `/${locale}/pokemons2?${newSearchParams}`
		);
	};

	const memoItems = useMemo(
		() =>
			sortOptions.map((option) => (
				<MenuItem key={option.value} value={option.value}>
					{option.text}
				</MenuItem>
			)),
		[]
	);

	return (
		<>
			<Select
				labelId="sort-label"
				id="sort"
				value={sortBy}
				label="sort"
				onChange={handleChange}
				// disable selecting when pending is optional, because one of the main features of transition is interruptable. But is there any way to abort the unresolved request that had been made?
				className={isPending ? "pending" : "done"}
				disabled={isPending}
			>
				{memoItems}
			</Select>
		</>
	);
});


// refactor this component since now Sort reads searchParams too, see if we merget Dropdown with it or not