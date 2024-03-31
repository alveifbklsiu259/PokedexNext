'use client'
import { memo, useState, useMemo } from "react";
import DataTable, { type TableColumn, type ExpanderComponentProps } from "react-data-table-component";
import { Switch, Stack, Typography, capitalize } from "@mui/material";
import { type Locale } from "@/i18nConfig";
import { getTextByLocale } from "@/lib/util";
import type { ColData, MovesData } from "./moves-client";
import { useTranslation } from "react-i18next";

const getSerializedIds = (movesData: MovesData[]) => JSON.stringify(Object.values(movesData).map(move => move.id));

interface MoveEffectProps extends ExpanderComponentProps<MovesData> {
	previousSelectedVersion?: string,
	locale?: Locale
}

const MoveEffect: React.FC<MoveEffectProps> = ({ data, previousSelectedVersion, locale }) => {
	const effect = getTextByLocale(locale as NonNullable<typeof locale>, data.effect, 'effect');
	const flavorText = getTextByLocale(locale as NonNullable<typeof locale>, data.flavorText, 'flavor_text', previousSelectedVersion);

	return (
		<div className="moveDes">
			{typeof data.level === 'object' && data.level.type === 'span' && (
				<ul className="evo">
					Evo.
					<li>{data.level.props.title}</li>
				</ul>
			)}
			<ul className="effect">
				Effect
				<li>{effect}</li>
			</ul>
			<ul className="description">
				Description
				<li>{flavorText}</li>
			</ul>
		</div>
	)
};

type FilterButtonProps = {
	isDataReady: boolean,
	changefilteredMethod: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>,
};

const FilterButton = memo(function FilterButton({ isDataReady, changefilteredMethod }: FilterButtonProps) {
	const { t } = useTranslation('pokemon');
	return (
		<Stack direction="row" spacing={1} alignItems="center">
			<Typography>{t('level')}</Typography>
			<Switch disabled={!isDataReady} onChange={changefilteredMethod} />
			<Typography>{t('machine')}</Typography>
		</Stack>
	)
});

type MovesTableProps = {
	columnData: TableColumn<ColData>[],
	movesData: MovesData[],
	selectedVersion: string,
	changefilteredMethod: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>,
	filteredMethod: "machine" | "level-up",
	isDataReady: boolean,
	locale: Locale
}

export default function MovesTable({ columnData, movesData, selectedVersion, changefilteredMethod, filteredMethod, isDataReady, locale }: MovesTableProps) {
	const [previousData, setPreviousData] = useState(movesData);
	const [previousSelectedVersion, setPreviousSelectedVersion] = useState(selectedVersion);

	const cachedFilterButton = useMemo(() => <FilterButton isDataReady={isDataReady} changefilteredMethod={changefilteredMethod} />, [isDataReady, changefilteredMethod]);

	const expandableRowsComponentProps = useMemo(() => ({ previousSelectedVersion, locale }), [previousSelectedVersion, locale]);

	// if the current data is the same as the previous one, use the previous one to prevent re-render. (caching movesData would probably not work for this since selectedGeneration/selectedVersion changes so often), also use the previous selected version(selected verion is only used for move descriptions which don't change often even between different generation).

	if (getSerializedIds(previousData) !== getSerializedIds(movesData)) {
		setPreviousData(movesData);
		setPreviousSelectedVersion(selectedVersion);
		return;
	};

	return (
		<DataTable
			data={previousData}
			columns={columnData}
			highlightOnHover
			expandableRows
			expandOnRowClicked
			expandableRowsHideExpander
			expandableRowsComponent={MoveEffect as any}
			expandableRowsComponentProps={expandableRowsComponentProps}
			title={`Moves Learn by ${capitalize(filteredMethod)}`}
			subHeader
			subHeaderComponent={cachedFilterButton}
			progressPending={!isDataReady}
		/>
	)
};

export function DataTableSkeleton() {
	return (
		<DataTable
			data={[]}
			columns={[]}
			progressPending={true}
			title={`Moves Learn by Level-up`}
			subHeader
			subHeaderComponent={
				<Stack direction="row" spacing={1} alignItems="center">
					<Typography>Level</Typography>
					<Switch disabled={true} />
					<Typography>Machine</Typography>
				</Stack>
			}
		/>
	)
}

// there's some TS problem with expandableRowsComponent, reference: https://react-data-table-component.netlify.app/?path=/docs/expandable-basic--basic#typescript