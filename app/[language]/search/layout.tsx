import {Suspense} from 'react'

type LayoutProps = {
    children: React.ReactNode
}
export default function Layout ({children}: LayoutProps) {
	const randomKey = Math.random();
	console.log(randomKey)
    return (
        <Suspense key={randomKey}fallback={<h1>Loading search page from layout</h1>}>
            {children}
        </Suspense>
    )
}