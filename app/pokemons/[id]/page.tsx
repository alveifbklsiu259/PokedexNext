import Pokemon from "@/app/_components/pokemonData/pokemon";

type PageProps = {
	params: {
		id: string
	}
}


export default function Page({params}: PageProps) {

	return (
		<>
			<Pokemon pokeId={params.id}/>
		</>
	)
}