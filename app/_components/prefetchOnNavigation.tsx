import { memo, type PropsWithChildren } from "react";
import { useNavigateToPokemon, usePrefetch } from "../_app/hooks";
import type { GetRequiredData } from "./pokemonData/pokemonDataSlice";

type PrefetchOnNavigationPorps = {
	requestPokemonIds: number,
	customClass: string
}

const PrefetchOnNavigation = memo<PropsWithChildren<PrefetchOnNavigationPorps>>(function PrefetchOnNavigation({children, requestPokemonIds, customClass}) {
	const navigateToPokemon = useNavigateToPokemon();
	const [unresolvedDataRef, prefetch] = usePrefetch('navigation');
	const requests: GetRequiredData.Request[] = ['pokemon', 'pokemonSpecies', 'evolutionChain', 'ability', 'item'];

	const handlePrefetch = () => {
		if (unresolvedDataRef.current === null) {
			prefetch([requestPokemonIds], requests);
		};
	};

	const handleClick = async() => {
		if (unresolvedDataRef.current) {
			navigateToPokemon([requestPokemonIds], requests, undefined, unresolvedDataRef.current);
		};
	};
	
	return (
		<div className={customClass}
			onClick={handleClick}
			onMouseEnter={handlePrefetch}
			onTouchStart={handlePrefetch}
		>
			{children}
		</div>
	)
});
export default PrefetchOnNavigation;