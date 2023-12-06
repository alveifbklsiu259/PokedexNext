import { LanguageOption } from "../display/display-slice";
import BasicInfo from "./basicInfo";
import {
	CachedPokemon,
	CachedPokemonSpecies,
	CachedType,
} from "./pokemon-data-slice";

type InitialPokemonsProps = {
	language: LanguageOption;
	types: CachedType;
	initialPokemonData: CachedPokemon;
	initialSpeciesData: CachedPokemonSpecies;
};

export default function InitialPokemons({
	language,
	types,
	initialPokemonData,
	initialSpeciesData,
}: InitialPokemonsProps) {
	return (
		<>
			<div className="container">
				{/* <div ref={viewModeRef} className="viewModeContainer">
					<ViewMode tableInfoRef={tableInfoRef} />
				</div> */}
				{/* <Sort /> */}
				<div className="row g-5">
					{Object.values(initialPokemonData).map((data) => {
						const imgSrc =
							data.sprites?.other?.["official-artwork"]?.front_default;
						return (
							<div
								key={data.id}
								className={`col-6 col-md-4 col-lg-3 card pb-3 pokemonCard ${
									!imgSrc ? "justify-content-end" : ""
								}`}
								// onClick={() => navigateToPokemon(navigateIds,['pokemon', 'pokemonSpecies', 'evolutionChain', 'ability', 'item'])}
							>
								{/*  should fetch data in Pokemons or in BasicInfo?  if the data is fetched in Pokemons, multiple requests will be concurrent, if in BasicInfo, we can use suspense, which is better?*/}

								{/* Dynamic Routes: prefetch default to automatic. Only the shared layout down until the first loading.js file is prefetched and cached for 30s. This reduces the cost of fetching an entire dynamic route, and it means you can show an instant loading state for better visual feedback to users. */}
								{/* Prefetching is not enabled in development, only in production. */}
								{/* Link's children changes when isLoading change, why? but BasicInfo is cached it does not change. */}
								{/* <Link href={`./${language}/pokemon/${id}`}> */}
								{/* <div onClick={() => handleClick(id)}> */}
								<BasicInfo
									pokemonData={data}
									language={language as LanguageOption}
									speciesData={initialSpeciesData[data.id]}
									types={types}
								/>
								{/* </div> */}
								{/* </Link> */}
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
}
