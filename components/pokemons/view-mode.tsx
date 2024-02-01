"use client";
import { memo, useMemo, useState } from "react";
import { BsListUl } from "react-icons/bs";
import { FaTableCellsLarge } from "react-icons/fa6";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useParams, useSearchParams } from "next/navigation";
import { useTransitionRouter } from "../transition-context";
import { updateSearchParam } from "@/lib/util";

export type View = "card" | "list";

const ViewMode = memo(function ViewMode(/* {tableInfoRef}: ViewModeProps */) {
	const searchParams = useSearchParams();
	const view = (searchParams.get("view") as View | null) || "card";
	const [viewMode, setViewMode] = useState<View>(view);
	const [isPending, transitionRouter] = useTransitionRouter();
	const { language } = useParams();

	const handleChange = async (
		_: React.MouseEvent<HTMLElement, MouseEvent>,
		nextView: typeof viewMode | null
	) => {
		if (nextView !== null) {
			const newSearchParams = updateSearchParam(searchParams, {
				view: nextView,
			});
			setViewMode(nextView);
			transitionRouter.push(`/${language}/pokemons/search?${newSearchParams}`);
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

// myabe we can have a viewModeContent which takes a optional searchParams prop, then we can use this content in skeleton too, but then we can't use useMemo, not sure if it's gonna affect performance