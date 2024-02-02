
import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getEndpointData, getData } from "@/lib/api";
import { getIdFromURL } from "@/lib/util";

type RelatedPokemonProps = {
	pokemonId: number;
	order: "previous" | "next";
};

const RelatedPokemon = memo<RelatedPokemonProps>(async function RelatedPokemon({
	pokemonId,
	order,
}) {
	const pokemonCount = (await getEndpointData("pokemonSpecies")).count;

	const pokemonData = await getData("pokemon", pokemonId);
	const nationalNumber = getIdFromURL(pokemonData.species.url);

	let relatedId;
	if (order === "next") {
		relatedId = nationalNumber === pokemonCount ? 1 : nationalNumber + 1;
	} else {
		relatedId = nationalNumber === 1 ? pokemonCount : nationalNumber - 1;
	}

	return (
		// should read the params then add it to the path
		<Link prefetch={true} href={`./${relatedId}`}>
			<div className={`navigation ${order}`}>
				<span>{String(relatedId).padStart(4, "0")}</span>
				<Image
					width="475"
					height="475"
					src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${relatedId}.png`}
					alt={String(relatedId)}
				/>
			</div>
		</Link>
	);
});

export default RelatedPokemon
