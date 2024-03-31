"use client";
import { memo, useMemo, useState } from "react";
import { BsListUl } from "react-icons/bs";
import { FaTableCellsLarge } from "react-icons/fa6";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useSearchParams } from "next/navigation";
import { useTransitionRouter } from "../transition-provider";
import { updateSearchParam } from "@/lib/util";
import { useCurrentLocale } from "@/lib/hooks";

export type View = "card" | "list";

const ViewMode = memo(function ViewMode() {
	const searchParams = useSearchParams();
	const view = (searchParams.get("view") as View | null) || "card";
	const [viewMode, setViewMode] = useState<View>(view);
	const [isPending, transitionRouter] = useTransitionRouter();
	const currentLocale = useCurrentLocale();

	const handleChange = async (
		_: React.MouseEvent<HTMLElement, MouseEvent>,
		nextView: typeof viewMode | null
	) => {
		if (nextView !== null) {
			const newSearchParams = updateSearchParam(searchParams, {
				view: nextView,
			});
			setViewMode(nextView);
			transitionRouter.push(
				`/${currentLocale}/pokemons/search?${newSearchParams}`
			);
		}
	};

	const cardBtn = useMemo(
		() => (
			<ToggleButton value="card" aria-label="card">
				<FaTableCellsLarge className="icon"></FaTableCellsLarge>
			</ToggleButton>
		),
		[]
	);

	const listBtn = useMemo(
		() => (
			<ToggleButton value="list" aria-label="list">
				<BsListUl className="icon"></BsListUl>
			</ToggleButton>
		),
		[]
	);

	return (
		<div className="viewMode">
			<ToggleButtonGroup
				value={viewMode}
				exclusive
				onChange={handleChange}
				disabled={isPending}
			>
				{cardBtn}
				{listBtn}
			</ToggleButtonGroup>
		</div>
	);
});
export default ViewMode;