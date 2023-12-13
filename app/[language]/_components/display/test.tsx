"use client";
import { updateSearchParam } from "@/app/_utils/util";
import { SelectChangeEvent, Select, MenuItem } from "@mui/material";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useMemo } from "react";
import { sortOptions } from "./sort";

const Dropdown = memo(
	function Dropdown() {
		console.log("dropdown");
		console.log("dropdown");
		console.log("dropdown");
		console.log("dropdown");
		console.log("dropdown");
		console.log("dropdown");
		console.log("dropdown");
		console.log("dropdown");
		console.log("dropdown");
		const searchParams = useSearchParams();
		const pathname = usePathname();
		const router = useRouter();
		// const [sortBy, setSortBy] = useState<SortOption>("numberAsc");
		const sortParams = searchParams.get("sort") || "numberAsc";

		console.log("afterSearchParams");
		console.log("afterSearchParams");
		console.log("afterSearchParams");
		console.log("afterSearchParams");
		console.log("afterSearchParams");
		console.log("afterSearchParams");
		console.log("afterSearchParams");
		console.log("afterSearchParams");
		console.log("afterSearchParams");
		// I guess that the code before useSearchParams will still be rendered on the server.
		// even though the docs says using useSearchParams in a static route will make the component up to the closest Suspense boundry to only render on the client, but according to the test, the code (console.log()) be fore the useSearchParams initialization is still logged to the server console.

		// synchronize state
		// useLayoutEffect(() => {
		// 	if (sortParams && sortParams !== sortBy) {
		// 		setSortBy(sortParams as SortOption)
		// 	};
		// }, [sortParams, sortBy, setSortBy])

		const handleChange = useCallback(
			(event: SelectChangeEvent) => {
				// setSortBy(event.target.value as SortOption);

				const newSearchParams = updateSearchParam(searchParams, {
					sort: event.target.value,
				});
				console.log(newSearchParams);
				router.push(`${pathname}?${newSearchParams}`);
			},
			[router]
		);

		const content = useMemo(
			() => (
				<Select
					labelId="sort-label"
					id="sort"
					value={sortParams}
					label="Sort"
					onChange={handleChange}
				>
					{sortOptions.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.text}
						</MenuItem>
					))}
				</Select>
			),
			[sortParams]
		);

		console.log(content, handleChange);

		return (
			<>{content}</>
			// <MemoSelect
			// <Select
			// 	labelId="sort-label"
			// 	id="sort"
			// 	value={sortParams}
			// 	label="Sort"
			// 	onChange={handleChange}
			// >
			// 	{content}
			// </Select>
			// </MemoSelect>
		);
	},
	() => true
);

type MemoSelectProps = {
	children: React.ReactNode;
	labelId: string;
	id: string;
	value: string;
	label: string;
	onChange: (event: SelectChangeEvent) => void;
};

// const MemoSelect = memo(function MemoSelect(props: MemoSelectProps) {
// 	return <Select {...props}>{props.children}</Select>;
// });

export default Dropdown;
