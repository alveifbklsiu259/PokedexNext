import { Suspense } from "react";
import PokemonsServer from "@/components/pokemons/pokemons-server";
import { PokemonsSkeleton } from "@/components/skeletons";
import { Locale } from "@/i18nConfig";

export const revalidate = 0;
export const dynamic = 'force-dynamic'

type PageProps = {
	params: {
		locale: Locale;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params, searchParams }: PageProps) {
	const content = (
		<PokemonsServer params={params} searchParams={searchParams} />
	);

	if (!Object.keys(searchParams).length) {
		return <Suspense fallback={<PokemonsSkeleton />}>{content}</Suspense>;
	}
	return <>{content}</>;
}