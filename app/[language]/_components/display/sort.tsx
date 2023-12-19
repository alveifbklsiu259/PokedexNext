"use client";
import { memo, Suspense, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { updateSearchParam } from "@/app/_utils/util";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

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
const Sort = memo(
	function Sort() {
		return (
			<Box
				sx={{
					minWidth: 120,
					width: "220px",
					marginLeft: "auto",
					marginBottom: "20px",
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
								defaultValue={"numberAsc"}
								disabled
							/>
						}
					>
						{/* Dropdown will be rendered on the client */}
						<Dropdown />
					</Suspense>
				</FormControl>
			</Box>
		);
	},
	() => true
);
export default Sort;

// since Dropdown uses useSearchParams, when searchParams changes, it will re-render anyway as context change, so there's no need to wrap it in a memo.
const Dropdown = function Dropdown() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();
	const sortParams = searchParams.get("sort") || "numberAsc";

	// see if we can use link and prefetch?
	const handleChange = (event: SelectChangeEvent) => {
		const newSearchParams = updateSearchParam(searchParams, {
			sort: event.target.value,
		});
		let newPathname: string = pathname;
		if (!pathname.includes('search')) {
			newPathname = `${pathname}/search`
		};

		router.push(`${newPathname}?${newSearchParams}`);
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
		<Select
			labelId="sort-label"
			id="sort"
			value={sortParams}
			label="Sort"
			onChange={handleChange}
		>
			{memoItems}
		</Select>
	);
};
