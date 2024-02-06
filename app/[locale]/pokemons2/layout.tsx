import { Suspense } from "react";
import { type Locale } from "@/i18nConfig";
import Sort from "@/components/pokemons/sort";
import SearchServer from "./search-server";
import ViewMode from "@/components/pokemons/view-mode";

type LayoutProps = {
	children: React.ReactNode;
	params: { locale: Locale };
};

export default async function Layout({ children, params }: LayoutProps) {
	const {locale} = params;

	return (
		<>
			<div className="container mb-5">
				<Suspense fallback={<h1>loading Search server</h1>}>
					<SearchServer locale={locale} />
				</Suspense>
				<Sort />
				{children}
			</div>
		</>
	);
}