import "i18next";
import pokemonsEn from "@/locales/en/pokemons.json";
import pokemonEn from "@/locales/en/pokemon.json";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "pokemons";
		resources: {
			pokemons: typeof pokemonsEn;
			pokemon: typeof pokemonEn;
		};
	}
}
