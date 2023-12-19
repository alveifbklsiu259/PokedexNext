import { Suspense } from "react";
import { LanguageOption } from "../_components/display/display-slice";
import Sort from "../_components/display/sort";
import SearchServer from "./search-server";

type LayoutProps = {
	children: React.ReactNode;
	params: { language: LanguageOption };
};

export default async function Layout({ children, params }: LayoutProps) {

	// we may not have to memo Search or Sort because subsequent navigation (searchParams change) will not cause layout to render again. (This statement is partly correct, since Search and Sort are client components, partial rendering does not apply to them(according to my test))

	return (
		<>
			{/* This route is statically rendered, on subsequent navigation, the props will not be the same, why? (initial load's props !== navigation1's props, navigation1's props !== navigation2's props, i.e. each navigation will cause the props to change, and cause re-render.) */}
			<div className="container mb-5">
				<Suspense fallback={<h1>loading Search server</h1>}>
					<SearchServer language={params.language} />
				</Suspense>
				<Sort />
				<Suspense fallback={<h1>layout suspense...</h1>}>
					{children}
				</Suspense>
			</div>
		</>
	);
}

// maybe new path structure e.g.
// /[language]/pokemons?query=xxx
// /[language]/pokemon/1
// so later we can have /[language]/berries, /[language]/items ...

// use route group
// Navigating across multiple root layouts will cause a full page load (as opposed to a client-side navigation). For example, navigating from /cart that uses app/(shop)/layout.js to /blog that uses app/(marketing)/layout.js will cause a full page load. This only applies to multiple root layouts.

// does it affet to non root layout groups?

//   see commit:769df10a
