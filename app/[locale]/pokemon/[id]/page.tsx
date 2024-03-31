import { Suspense } from "react";
import Link from "next/link";
import { i18nNamespaces, type Locale } from "@/i18nConfig";
import Varieties from "@/components/pokemon/varieties";
import BasicInfoServer from "@/components/pokemon/basic-info-server";
import Detail from "@/components/pokemon/detail";
import Stats from "@/components/pokemon/stats";
import MovesServer from "@/components/pokemon/moves-server";
import EvolutionChains from "@/components/pokemon/evolution-chains";
import { BasicInfoSkeleton, DetailSkeleton, EvolutionChainSkeleton, MovesSkeleton, RelatedPokemonSkeleton, StatsSkeleton, VarietiesSkeleton } from "@/components/skeletons";
import RelatedPokemon from "@/components/pokemon/related-pokemon";
import dynamic from "next/dynamic";
import { initTranslationsServer } from "@/lib/i18n";

const ScrollToTop = dynamic(() => import("@/components/scroll-to-top"), { ssr: false });
const Overlay = dynamic(() => import("@/components/overlay"), { ssr: false })

type PageProps = {
	params: {
		locale: Locale;
		id: string;
	};
};

export default async function Page({ params }: PageProps) {
	const { locale, id } = params;
	const { t } = await initTranslationsServer(locale, i18nNamespaces);
	const pokemonId = Number(id);

	return (
		<>
			<Overlay />
			<Suspense fallback={<RelatedPokemonSkeleton order="previous" />}>
				<RelatedPokemon pokemonId={pokemonId} order="previous" />
			</Suspense>
			<Suspense fallback={<RelatedPokemonSkeleton order="next" />}>
				<RelatedPokemon pokemonId={pokemonId} order="next" />
			</Suspense>

			<div className="row justify-content-center mainContainer">
				<Suspense fallback={<VarietiesSkeleton />}>
					<Varieties locale={locale} pokemonId={pokemonId} />
				</Suspense>

				<div className="basicInfoContainer row col-8 col-sm-6 justify-content-center">
					<Suspense
						fallback={
							<BasicInfoSkeleton />
						}
					>
						<BasicInfoServer locale={locale} pokemonId={pokemonId} />
					</Suspense>
				</div>
				<div className="detail row text-center col-12 col-sm-6">
					<Suspense fallback={<DetailSkeleton t={t} />}>
						<Detail
							locale={locale}
							pokemonId={pokemonId}
						/>
					</Suspense>
				</div>
				<Suspense fallback={<StatsSkeleton t={t} />}>
					<Stats locale={locale} pokemonId={pokemonId} />
				</Suspense>
				<Suspense fallback={<EvolutionChainSkeleton t={t} />}>
					<EvolutionChains
						locale={locale}
						pokemonId={pokemonId}
					/>
				</Suspense>
				<Suspense fallback={<MovesSkeleton t={t} />}>
					<MovesServer
						pokemonId={pokemonId}
						locale={locale}
					/>
				</Suspense>
				<Link prefetch={true} href={`/${locale}/pokemons`} className="text-white text-decoration-none w-50 m-3 btn btn-block btn-secondary">
					{t('pokemon:explore')}
				</Link>
			</div>
			<ScrollToTop />
		</>
	);
}