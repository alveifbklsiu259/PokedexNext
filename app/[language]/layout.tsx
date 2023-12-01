type LayoutProps = {
	children: React.ReactNode,
	search: React.ReactNode,
	pokemons: React.ReactNode
} 


export default function Layout(props: LayoutProps) {

	return (
		<>
			{/* {props.search} */}
			{props.search}
			{props.children}
		</>
	)
}