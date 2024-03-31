import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="notFoundPage">
			<div className="col-6">
				<Image
					priority
					className="pageNotFoundImg"
					width="475"
					height="475"
					src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png"
					alt="page not found"
				/>
			</div>
			<div>
				<h1 className="mt-3">Page Not Found</h1>
				<div className="p-3 text-center">
					<p className="text-center">
						The page you&apos;re looking for can not be found.
					</p>
					<Link href={"/en/pokemons"} className="btn btn-block btn-secondary mt-3">
						Go back to Pokedex
					</Link>
				</div>
			</div>
		</div>
	);
}
