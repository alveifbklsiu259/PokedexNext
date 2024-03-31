"use client";
import { useMemo, useCallback, useRef, useEffect } from "react";
import DataTable, {
	type TableColumn,
} from "react-data-table-component";
import { useSearchParams } from "next/navigation";
import type { SortMethod, SortOption, SortField } from "./sort";
import { useTransitionRouter } from "../transition-provider";
import { PokemonTableData } from "./pokemons-server";
import { useCurrentLocale } from "@/lib/hooks";
import { useTranslation } from "react-i18next";

const scrollToTop = (firstDiv: HTMLDivElement) => {
	firstDiv.scrollTo({
		top: 0,
		left: 0,
		behavior: "smooth",
	});
};

const prowsPerPageOptions = [10, 30, 50, 100];

type PokemonTableProps = {
	data: PokemonTableData;
	columnHeaders: { [key: string]: string };
};

type ColData = PokemonTableData[number];

export default function PokemonTable({
	data,
	columnHeaders,
}: PokemonTableProps) {
	const searchParams = useSearchParams();
	const sort = (searchParams.get("sort") || "numberAsc") as SortOption;
	const [isPending, transitionRouter] = useTransitionRouter();
	const currentLocale = useCurrentLocale();
	const tableRef = useRef<HTMLDivElement | null>(null);
	const { t } = useTranslation();

	// every time server component renders, it will calculate a new columnHeaders(because it's an object), this is why the identity is not the same, maybe this is also why types, generations passed from server to client always change.
	// is it possible to create a catcher client component that gets all the data passed from the server and cached it there, then other client compoent can use context to get the same identity data?

	const getColumnHeader = useCallback((dataKey: string) => {
		const columnHeader = columnHeaders[dataKey];

		switch (columnHeader) {
			case "Special Attack":
				return "Sp.Atk";
			case "Special Defense":
				return "Sp.Def";
			case "height":
				return `${t('height')} (cm)`;
			case "weight":
				return `${t('weight')} (kg)`;
			case "type":
				return `${t('types')}`
			case "number":
				return t('number');
			case "name":
				return `${t('name')}`
			case "total":
				return `${t('total')}`;
		};
		return columnHeader;
	}, [t])

	const firstUppercaseIndex = sort.search(/[A-Z]/);
	const sortField = sort.slice(0, firstUppercaseIndex) as SortField;
	const sortMethod = sort.slice(firstUppercaseIndex) as SortMethod;

	const sortElement = useCallback(
		(dataKey: "number" | "total") => (rowA: ColData, rowB: ColData) => {
			const a: number = rowA[dataKey].props["data-value"];
			const b: number = rowB[dataKey].props["data-value"];
			return a - b;
		},
		[]
	);
	const columnData: TableColumn<ColData>[] = useMemo(
		() =>
			Object.keys(data[0] || []).map((dataKey) => ({
				id: dataKey,
				name: getColumnHeader(dataKey),
				// the declaration file of rdt specifies that the return type of "selector" can only be Primitive, but in my use case, I want to show React.JSX.Element in some of the field.
				selector: (row) => row[dataKey as keyof ColData] as any,
				sortable: dataKey === "type" ? false : true,
				center: true,
				sortFunction:
					dataKey === "number" || dataKey === "total"
						? sortElement(dataKey)
						: undefined,
			})),
		[data, columnHeaders, sortElement, getColumnHeader]
	);


	const handleRowClick = useCallback(
		async (row: ColData) => {
			const pokemonId: number = row.number.props["data-value"];
			transitionRouter.push(`/${currentLocale}/pokemon/${pokemonId}`);
		},
		[transitionRouter, currentLocale]
	);

	const handleChangePage = useCallback(
		(page: number) => {
			scrollToTop(tableRef.current!);
		},
		[tableRef]
	);

	const handleChangeRowsPerPage = useCallback(
		(currentRowsPerPage: number, currentPage: number) => {
			scrollToTop(tableRef.current!);
		},
		[tableRef]
	);

	const handleSort = useCallback(
		() => {
			scrollToTop(tableRef.current!);
		},
		[tableRef]
	);

	useEffect(() => {
		tableRef.current = document.querySelector(".pokemonTable");
	}, []);

	return (
		<DataTable
			className={`pokemonTable  ${isPending ? "pending" : "done"}`}
			keyField="name"
			columns={columnData}
			data={data}
			highlightOnHover
			pointerOnHover
			onRowClicked={(row) => handleRowClick(row)}
			fixedHeader
			fixedHeaderScrollHeight="70vh"
			pagination
			// when sorting table, there seems to be no way to memoize each row(there's no memo wrapped around rdt_TableRow) or each cell(there's memo, but the prop "rowIndex" will change), so I think the only thing I can do is limit the number of rows shown per page.
			paginationPerPage={50}
			paginationRowsPerPageOptions={prowsPerPageOptions}
			paginationDefaultPage={1}
			onChangePage={(page) => handleChangePage(page)}
			onChangeRowsPerPage={(currentRowsPerPage, currentPage) =>
				handleChangeRowsPerPage(currentRowsPerPage, currentPage)
			}
			onSort={() =>
				handleSort()
			}
			defaultSortFieldId={sortField}
			defaultSortAsc={sortMethod === "Asc"}
		/>
	);
}