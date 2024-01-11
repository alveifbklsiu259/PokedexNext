'use client'
import DataTable, { TableColumn } from 'react-data-table-component';


const columns:TableColumn<Data>[]  = [
    {
        name: 'Title',
        selector: row => row.title,
    },
    {
        name: 'Year',
        selector: row => row.year,
    },
];

type Data = {
	title: string,
	year: string
}

const data:Data[] = [
    {
        title: 'Beetlejuice',
        year: '1988',
    },
    {
        title: 'Ghostbusters',
        year: '1984',
    },
]

export default function MyComponent() {
    return (
        <DataTable
            columns={columns}
            data={data}
        />
    );
};
