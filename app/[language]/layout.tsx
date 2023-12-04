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
			{/* check if this suspense works */}
			{/* <Suspense fallback={<h1>Loading searchWrapper...</h1>}>
				<SearchWrapper language={language} />
			</Suspense> */}
			<Suspense fallback={<h1>Loading SearchServer...</h1>}>
				<SearchServer
					language={language}
				/>
			</Suspense>
			{children}
		</>
	);
}
