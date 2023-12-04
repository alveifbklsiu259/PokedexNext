import { Suspense } from "react";
import SearchWrapper from "./_components/search/search-wrapper";
import { LanguageOption } from "./_components/display/display-slice";
import SearchServer from "./_test/SearchServer";



type LayoutProps = {
	children: React.ReactNode;
	params: {language: LanguageOption}
};

export default function Layout({ children, params }: LayoutProps) {
	const {language} = params;

	console.log('layout')
	
	return (
		<>
		{/* renders the Search with searchParams, but the fallback of the Suspense wraps around the client Search will be the one that does not use searchParams */}
			<Suspense fallback={<h1>Loading SearchServer...</h1>}>
				<SearchServer
					language={language}
				/>
			</Suspense>
			{children}
		</>
	);
}
