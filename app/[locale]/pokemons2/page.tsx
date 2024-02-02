import { Suspense } from "react";
import PokemonsServer from "@/components/pokemons/pokemons-server";
import { PokemonsSkeleton } from "@/components/skeletons";
import type { LanguageOption } from "@/slices/display-slice";

type PageProps = {
	params: {
		language: LanguageOption;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params, searchParams }: PageProps) {
	console.log('pokemons2 page')

	return (
		<>
		<Suspense
			key={JSON.stringify(searchParams)}
			fallback={<PokemonsSkeleton />}
		>
			<PokemonsServer params={params} searchParams={searchParams} />
		</Suspense>
	</>
	);
}
