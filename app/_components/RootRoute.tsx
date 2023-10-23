// import { useRef } from 'react';
// import { ScrollRestoration, Outlet } from "react-router-dom";
// import RouterUtils from "./RouterUtils";
// import Search from "./search/Search";
// import Pokemons from "./pokemonData/Pokemons";
// import NavBar from "./NavBar";

// export default function RootRoute () {
// 	return (
// 		<RouterUtils>
// 			<ScrollRestoration getKey={location => {
// 				const paths = ["/"];
// 				return !paths.includes(location.pathname) || location.state === 'resetPosition' ? location.key : location.pathname;
// 			}}/>
// 			<NavBar />
// 			<Outlet />
// 		</RouterUtils>
// 	)
// };

// export function Index() {
// 	const viewModeRef = useRef<HTMLDivElement>(null);

// 	return (
// 		<>
// 			<div className="container mb-5">
// 				<Search viewModeRef={viewModeRef} />
// 				<Pokemons viewModeRef={viewModeRef} />
// 			</div>
// 		</>
// 	)
// };