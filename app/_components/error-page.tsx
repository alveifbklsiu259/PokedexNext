// import { useState } from "react";
// import Input from "@/app/[language]/_components/search/input";
// import { useRouter } from "next/navigation";
// import { searchPokemon } from "@/app/[language]/_components/search/searchSlice";
// import { backToRoot } from "@/app/[language]/_components/display/displaySlice";
// import { useAppDispatch } from "../_app/hooks";
// import { FaMagnifyingGlass } from 'react-icons/fa6';
// import Image from "next/image";

// export default function ErrorPage() {
// 	const [searchParam, setSearchParam] = useState('');
// 	const dispatch = useAppDispatch();
// 	const router = useRouter();

// 	const handleBackToRoot = () => {
// 		dispatch(backToRoot());
// 		// router.push('/', {state: 'resetPosition'});
// 		router.push('/');
// 	};
	
// 	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
// 		e.preventDefault();
// 		dispatch(searchPokemon({searchParam}));
// 		router.push('/');
// 	};

// 	return (
// 		<div className="errorPage">
// 			<div className="col-6">
// 				<Image className="pageNotFoundImg" width='475' height='475' src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png" alt="PageNotFound" />
// 			</div>
// 			<div>
// 				<h1 className="mt-3">Page Not Found</h1>
// 				<div className="p-3">
// 					<p className="text-center">The page you&apos;re looking for can not be found.</p>
// 					<ul className="mt-3">
// 						<li>
// 							<button onClick={handleBackToRoot} className="btn btn-block btn-secondary" >Go back to Pokedex</button>
// 						</li>
// 						<li className="my-2">Search a Pokemon</li>
// 					</ul>
// 					<form className="d-flex" onSubmit={handleSubmit}>
// 						<div className="flex-fill">
// 							<Input 
// 								searchParam={searchParam}
// 								setSearchParam={setSearchParam}
// 							/>
// 						</div>
// 						<button className="btn btn-primary btn-block ms-2" type="submit"><FaMagnifyingGlass></FaMagnifyingGlass></button>
// 					</form>
// 				</div>
// 			</div>
// 		</div>
// 	)
// };