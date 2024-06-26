import {
	Box,
	FormControl,
	InputLabel,
	Select,
	Skeleton,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import { Stat } from "../lib/api";
import Spinner from "./spinner";
import { DataTableSkeleton } from "./pokemon/moves-table";
import { FaTableCellsLarge } from "react-icons/fa6";
import { BsListUl } from "react-icons/bs";
import type { i18n } from "i18next";

type RelatedPokemonSkeletonProps = {
	order: "previous" | "next";
};

export const RelatedPokemonSkeleton = ({
	order,
}: RelatedPokemonSkeletonProps) => {
	return (
		<div className={`navigation ${order}`}>
			<Skeleton variant="text" width={50} />
			<Skeleton
				variant="circular"
				width={75}
				height={75}
				className="skeleton__img__related"
			/>
		</div>
	);
};

export const PokemonsSkeleton = () => {
	const arr = [...Array(24).keys()].map((num) => num + 1);
	return (
		<div className="container">
			<div className="row g-5">
				{arr.map((id) => {
					return (
						<div
							key={id}
							className={`col-6 col-md-4 col-lg-3 card pb-3 pokemonCard justify-content-end`}
						>
							<BasicInfoSkeleton />
						</div>
					);
				})}
			</div>
		</div>
	);
};

// reference: https://stackoverflow.com/questions/59461615/a-good-way-to-handle-material-ui-skeleton-scaling-within-a-variable-height-grid
// note that variant="text" does not take height attribute, to adjust the height of a text suspense, change the font-size

export const BasicInfoSkeleton = () => {
	return (
		<div
			className={`basicInfo d-flex flex-column align-items-center text-center p-0 h-100 justify-content-end`}
		>
			<div className="skeleton__img__basicInfoContainer">
				<Skeleton variant="rectangular" className="skeleton__img__basicInfo" />
			</div>
			<Skeleton width={58} variant="text" sx={{ fontSize: "1.3em" }} />
			<Skeleton
				width={160}
				height={38.391}
				variant="rounded"
				style={{ marginBottom: "8px" }}
			/>
			<div className="types row justify-content-center">
				<Skeleton
					width={80}
					height={21.59}
					variant="rounded"
					className="type col-5 m-1"
				/>
				<Skeleton
					width={80}
					height={21.59}
					variant="rounded"
					className="type col-5 m-1"
				/>
			</div>
		</div>
	);
};

type DetailSkeletonProps = {
	t: i18n["t"];
};

export const DetailSkeleton = ({ t }: DetailSkeletonProps) => {
	return (
		<>
			<p className="my-4 col-6">
				{t("height")}
				<br /> <Skeleton className="skeleton__text__centered" width={85} />
			</p>
			<p className="my-4 col-6">
				{t("weight")}
				<br /> <Skeleton className="skeleton__text__centered" width={85} />
			</p>
			<p className="col-6 d-flex flex-column">
				{t("pokemon:gender")}
				<br />
				<span className="mt-4">
					<Skeleton className="skeleton__text__centered" width={65} />
				</span>
			</p>
			<div className="col-6 abilities p-0">
				{t("pokemon:abilities")}
				<br />
				<AbilitiesSkeleton />
			</div>
			<p className="col-12 m-3 p-2 text-start description">
				<Skeleton variant="text" sx={{ fontSize: "1.6em" }} width="90%" />
				<Skeleton variant="text" sx={{ fontSize: "1.6em" }} width="70%" />
			</p>
		</>
	);
};

export const AbilitiesSkeleton = () => {
	return (
		<>
			<Skeleton className="skeleton__text__centered" width={120} />
			<Skeleton className="skeleton__text__centered" width={120} />
		</>
	);
};

type StatsSkeletonProps = {
	t: i18n["t"];
};
export const StatsSkeleton = ({ t }: StatsSkeletonProps) => {
	const stats: Stat[] = [
		"hp",
		"attack",
		"defense",
		"special-attack",
		"special-defense",
		"speed",
	];

	const getRandomInt = (min: number, max: number) => {
		return Math.floor(Math.random() * (max - min) + min);
	};

	return (
		<div className="col-12 mt-5 stats">
			<h1 className="text-center">{t("pokemon:stats")}</h1>
			<table className="mx-auto">
				<tbody>
					{stats.map((stat) => (
						<tr key={stat}>
							<td className="text-capitalize text-center" width="30%">
								<Skeleton
									width={150}
									height={33}
									sx={{ fontSize: "1.4em" }}
									className="m-auto"
								/>
							</td>
							<td width="10%">
								<Skeleton width={40} height={33} sx={{ fontSize: "1.4em" }} />
							</td>
							<td width="255px">
								<div className="stat-bar-bg">
									<Skeleton height={10} width={`${getRandomInt(20, 60)}%`} />
								</div>
							</td>
						</tr>
					))}
					<tr>
						<td className="text-center" style={{ fontSize: "bold" }}>
							{t("total")}
						</td>
						<td>
							<Skeleton width={40} height={33} />
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

type EvolutionChainSkeletonProps = {
	t: i18n["t"];
};

export const EvolutionChainSkeleton = ({ t }: EvolutionChainSkeletonProps) => {
	return (
		<div className="col-12 mt-5 evolutionChains p-0">
			<h1 className="text-center">{t("pokemon:evolutions")}</h1>
			<Spinner />
		</div>
	);
};

type MovesSkeletonProps = {
	t: i18n["t"];
};

export const MovesSkeleton = ({ t }: MovesSkeletonProps) => {
	return (
		<>
			<div className="moves text-center mt-5">
				<h1>{t("pokemon:moves")}</h1>
				<div>
					{[...Array(9).keys()].map((num) => (
						<button
							key={num}
							className={`generationBtn btn btn-outline-secondary m-1`}
						>
							<Skeleton variant="rectangular" height={24} width={24} />
						</button>
					))}
				</div>
				<div className="col-12 varieties">
					<ul>
						{[...Array(2).keys()].map((num) => (
							<li key={num} className={num === 0 ? "active" : ""}>
								<button disabled={true} className="text-capitalize">
									<Skeleton variant="rectangular" width={68} height={24} />
								</button>
							</li>
						))}
					</ul>
				</div>
				<DataTableSkeleton />
			</div>
		</>
	);
};

export const ViewModeSkeleton = () => {
	return (
		<div className="viewMode">
			<ToggleButtonGroup value="card" exclusive>
				<ToggleButton value="card" aria-label="card">
					<FaTableCellsLarge className="icon"></FaTableCellsLarge>
				</ToggleButton>
				<ToggleButton value="list" aria-label="list">
					<BsListUl className="icon"></BsListUl>
				</ToggleButton>
			</ToggleButtonGroup>
		</div>
	);
};

type SortSkeletonProps = {
	t: i18n["t"];
};

export const SortSkeleton = ({ t }: SortSkeletonProps) => {
	return (
		<Box
			sx={{
				minWidth: 120,
				width: "220px",
				marginLeft: "auto",
			}}
		>
			<FormControl fullWidth>
				<InputLabel id="sort-label">{t("sort")}</InputLabel>
				<Select labelId="sort-label" id="sort" label="Sort" disabled></Select>
			</FormControl>
		</Box>
	);
};

export const VarietiesSkeleton = () => {
	return (
		<div className="marginWithVarieties" style={{ height: '66px' }}></div>
	);
};

export const VarietyNameSkeleton = ({ index }: { index: number }) => {
	return (
		<li className={index === 0 ? "active" : ""}>
			<button disabled={true} className="text-capitalize">
				<Skeleton variant="rectangular" width={68} height={24} />
			</button>
		</li>
	);
};