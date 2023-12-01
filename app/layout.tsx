import type { Metadata } from "next";
import 'bootstrap/dist/css/bootstrap.css';
import dynamic from "next/dynamic";
// import { Zen_Maru_Gothic } from 'next/font/google';
import '@/App.css'
// import NavBar from "./_components/navBar";

// const DynamicBootstrap = dynamic(
// 	() => require('bootstrap/dist/js/bootstrap.min.js'),
// 	{ ssr: false }
// );

// const zen_maru_gothic = Zen_Maru_Gothic({
// 	weight: '400',
// 	subsets: ['latin']
// });

export const metadata: Metadata = {
	title: "Pokedex",
	description: "Pokedex App Generated by create next app",
};



type RootLayoutProps = {
	children: React.ReactNode
}

export default async function RootLayout(props: RootLayoutProps) {



	return (
		<html lang="en">
			{/* <body className={zen_maru_gothic.className}> */} 
			<body>
				{/* {props.search} */}
				{props.children}
			</body>
		</html>
	);
};