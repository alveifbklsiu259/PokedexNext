import Image from "next/image";
import { memo }  from 'react';

type ServerSearchProps = {
    children: React.ReactNode
}

const ServerSearch = memo(function ServerSearch({children}: ServerSearchProps) {
	return (
		<div className="card-body mb-4 p-4">
			<h1 className="display-4 text-center">
				<Image className='pokeBall' src='/pokeBall.png' alt="pokeBall" width='46' height='46' /> Search For Pokemons
			</h1>
			<p className="lead text-center">By Name or the National Pokedex number</p>
			{children}
		</div>
	)
})
export default ServerSearch;