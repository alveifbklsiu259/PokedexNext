import ServerPokemons from "./pokemons-server";
import { Suspense } from "react";
import type { LanguageOption } from "../_components/display/display-slice";

type PageProps = {
	params: {
		language: LanguageOption;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params, searchParams }: PageProps) {
	return (
		<>
			<Suspense
				key={JSON.stringify(searchParams)}
				fallback={<h1>loading ServerPokemons...</h1>}
			>
				<ServerPokemons params={params} searchParams={searchParams} />
			</Suspense>
		</>
	);
}
