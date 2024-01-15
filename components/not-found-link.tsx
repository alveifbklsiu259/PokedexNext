"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NotFoundLink() {
	return (
		<Link href={"/en/pokemons"} className="btn btn-block btn-secondary mt-3">
			Go back to Pokedex
		</Link>
	);
}
