import { memo, useCallback } from 'react';
import type { Generation as GenerationType } from '@/typeModule';
import Image from 'next/image';
import { CachedGeneration } from '../pokemonData/pokemonDataSlice';

type FilterGenerationProps = {
	selectedGenerations: string[],
	setSelectedGenerations: React.Dispatch<React.SetStateAction<string[]>>,
	generations: CachedGeneration
};

const FilterGeneration = memo<FilterGenerationProps>(function FilterGeneration ({selectedGenerations, setSelectedGenerations, generations}) {
	const handleSelectGeneration = useCallback((generation: GenerationType.Root) => {
		// setSelectedGenerations(sg => {
		// 	const update = {...sg};
		// 	if (update[generation.name]) {
		// 		delete update[generation.name];
		// 	} else {
		// 		update[generation.name] = generation.pokemon_species;
		// 	};
		// 	return update;
		// });
		setSelectedGenerations(sg => {
			const update = [...sg];
			if (update.includes(generation.name)) {
				update.splice(update.indexOf(generation.name), 1);
			} else {
				update.push(generation.name)
			};
			return update;
		});

	}, [setSelectedGenerations]);

	return (
		<ul className="generation col-12 col-sm-6 row justify-content-center gap-2">
			<div>
				<h3 ><Image width='150' height='150' className="pokeBall" src='/ball.svg' alt="pokeBall" /> Generations</h3>
			</div>
			{Object.values(generations).map(generation => (
				<Generation
					key={generation.name}
					generation={generation}
					onSelectGeneration={handleSelectGeneration}
					isGenerationSelected={selectedGenerations.includes(generation.name)}
				/>
			))}
		</ul>
	)
});

type GenerationProps = {
	generation: GenerationType.Root,
	onSelectGeneration: (generation: GenerationType.Root) => void,
	isGenerationSelected: boolean
}

const Generation = memo<GenerationProps>(function Generation({generation, onSelectGeneration, isGenerationSelected}) {
	return (
		<li
			onClick={() => onSelectGeneration(generation)} 
			className={`d-flex justify-content-center align-items-center ${isGenerationSelected ? 'active' : ''}`}
		>
			{(generation.name.replace('generation-', '')).toUpperCase()}
		</li>
	)
});

export default FilterGeneration;



// maybe we can just use context, since we're not gonna be changing state, it will not cause too much re-renders

