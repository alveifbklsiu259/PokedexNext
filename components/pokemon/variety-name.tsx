import type { Locale } from "@/i18nConfig";
import { getData } from "@/lib/api";
import type { Pokemon, PokemonForm, PokemonSpecies } from "@/lib/definitions";
import { getFormName, getIdFromURL } from "@/lib/util";
import Link from "next/link";

type VarietyNameProps = {
	varietyId: number;
	varietyName: string;
	locale: Locale;
	pokemonData: Pokemon.Root;
	speciesData: PokemonSpecies.Root;
};

export default async function VarietyName({
	varietyId,
	varietyName,
	locale,
	pokemonData,
	speciesData,
}: VarietyNameProps) {
	const pokemons = await getData(
		"pokemon",
		speciesData.varieties.map((variety) => getIdFromURL(variety.pokemon.url)),
		"id"
	);
	const formsToFetch: number[] = [];
	Object.values(pokemons).forEach((pokemon) =>
		pokemon.forms.forEach((form) => formsToFetch.push(getIdFromURL(form.url)))
	);
	const forms = await getData("pokemonForm", formsToFetch, "id");
	const newForms = Object.values(forms).reduce<{
		[id: number]: PokemonForm.Root;
	}>((pre, cur) => {
		pre[getIdFromURL(cur.pokemon.url)] = cur;
		return pre;
	}, {});

	return (
		<li className={pokemonData.name === varietyName ? "active" : ""}>
			<Link
				className="text-capitalize text-decoration-none text-center"
				href={`/${locale}/pokemon/${varietyId}`}
				prefetch={true}
			>
				{getFormName(
					speciesData,
					locale,
					pokemons[varietyId],
					newForms[varietyId]
				)}
			</Link>
		</li>
	);
}
