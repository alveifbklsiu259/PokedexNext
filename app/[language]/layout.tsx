import { Suspense } from "react";
import SearchWrapper from "./_components/search/search-wrapper";
import { LanguageOption } from "./_components/display/display-slice";



type LayoutProps = {
	children: React.ReactNode;
	params: {language: LanguageOption}
};

export default function Layout({ children, params }: LayoutProps) {
	// const {language} = params;
	
	return (
		<>
			{/* check if this suspense works */}
			{/* <Suspense fallback={<h1>Loading searchWrapper...</h1>}>
				<SearchWrapper language={language} />
			</Suspense> */}
			{children}
		</>
	);
}
