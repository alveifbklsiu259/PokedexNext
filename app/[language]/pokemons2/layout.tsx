import { Suspense } from "react";
import { LanguageOption } from "@/slices/display-slice";
import Sort from "@/components/pokemons/sort";
import SearchServer from "./search-server";

type LayoutProps = {
	children: React.ReactNode;
	params: { language: LanguageOption };
};

export default async function Layout({ children, params }: LayoutProps) {
	console.log("pokemons2 layout");

	return (
		<>
			<div className="container mb-5">
				<Suspense fallback={<h1>loading Search server</h1>}>
					<SearchServer language={params.language} />
				</Suspense>
				<Sort />
				{children}
			</div>
		</>
	);
}