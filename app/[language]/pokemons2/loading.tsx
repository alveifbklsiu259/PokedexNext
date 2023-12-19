'use client'
import { memo } from "react";
const Loading = memo(function Loading() {
	return <h1>loading pokemons 2</h1>;
}, () => false)

export default Loading
