"use client";
import { memo, Suspense, useMemo, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { FormControl, MenuItem } from "@mui/material";
import { transformToKeyName, updateSearchParam } from "@/lib/util";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "../transition-provider";
import { View } from "./view-mode";
import { useCurrentLocale } from "@/lib/hooks";
import { useTranslation } from "react-i18next";
import { Stat } from "@/lib/api";

// sort by name needs to be refactored, use locale.
// When comparing large numbers of strings, such as in sorting large arrays, it is better to create an Intl.Collator object and use the function provided by its compare() method.  why?
export const sortOptions = [
	"numberAsc",
	"numberDesc",
	"nameAsc",
	"nameDesc",
	"heightAsc",
	"heightDesc",
	"weightAsc",
	"weightDesc",
	"totalDesc",
	"totalAsc",
	"attackDesc",
	"attackAsc",
	"hpDesc",
	"hpAsc",
	"defenseDesc",
	"defenseAsc",
	"special-attackDesc",
	"special-attackAsc",
	"special-defenseDesc",
	"special-defenseAsc",
	"speedDesc",
	"speedAsc",
] as const;

export type SortOption = (typeof sortOptions)[number];

export type SortField = {
	[K in SortOption]: K extends `${infer A}Asc` ? A : never;
}[SortOption];

export type SortMethod = SortOption extends `${SortField}${infer B}`
	? B
	: never;

type NonStatOption = Exclude<SortField, Exclude<Stat, "total">>;

type SortProps = {
	statNames: {
		[key: string]: string;
	};
};

// memo(Sort, () => true) is used to avoid re-render when route changes, for some reason partial rendering does not apply to client component(not sure if it's a bug or intended), but this approach fixes it.
const Sort =
	/* memo( */
	// the props passed down will always be the same because this component is rendered from the /pokemons/layout.tsx which is a SSG route, subsequent navigation will not cause the layout to re-render on the server
	function Sort({ statNames }: SortProps) {
		const searchParams = useSearchParams();
		const view = (searchParams.get("view") || "card") as View;
		const { t } = useTranslation();

		return (
			<>
				{view === "card" ? (
					<Box
						sx={{
							minWidth: 120,
							width: "220px",
							marginLeft: "auto",
						}}
					>
						<FormControl fullWidth>
							<InputLabel id="sort-label">{t("sort")}</InputLabel>
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
								<Dropdown statNames={statNames} />
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

type DropdownProps = {
	statNames: {
		[key: string]: string;
	};
};

const Dropdown = memo(function Dropdown({ statNames }: DropdownProps) {
	const [isPending, transitionRouter] = useTransitionRouter();
	const searchParams = useSearchParams();
	const currentLocale = useCurrentLocale();
	const sortParams = searchParams.get("sort") || "numberAsc";
	const { t } = useTranslation();

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

	const getSortMethodText = useCallback(
		(sortField: SortField, sortMethod: SortMethod) => {
			switch (sortField) {
				case "weight":
				case "height":
				case "name":
					return t(`${sortField}${sortMethod}`);
				default:
					return t(`default${sortMethod}`);
			}
		},
		[t]
	);

	const getSortText = useCallback(
		(sort: SortOption) => {
			const firstUppercaseIndex = sort.search(/[A-Z]/);
			const sortField = sort.slice(0, firstUppercaseIndex) as SortField;
			const sortMethod = sort.slice(firstUppercaseIndex) as SortMethod;
			const text = (
				statNames[transformToKeyName(sortField)] ||
				t(sortField as NonStatOption)
			).concat(` ${getSortMethodText(sortField, sortMethod)}`);

			return text;
		},
		[statNames, t, getSortMethodText]
	);

	const memoItems = useMemo(
		() =>
			sortOptions.map((option) => (
				<MenuItem key={option} value={option}>
					{getSortText(option)}
				</MenuItem>
			)),
		[getSortText]
	);

	return (
		<>
			<Select
				labelId="sort-label"
				id="sort"
				value={sortBy}
				label={"sort"}
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

// abilities' modal will change position when showing details, fix it.
