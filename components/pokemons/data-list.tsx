import { forwardRef, memo, useCallback } from "react";
import Image from "next/image";
import { CachedAllPokemonNamesAndIds } from "@/lib/definitions";

const colorMatching = (pokemonName: string, searchQuery: string | number) => {
	const lowerCaseSearchParam = String(searchQuery).toLowerCase();
	const splitString = pokemonName.split(lowerCaseSearchParam) as [string, string];
	return (
		<>
			{
				splitString.reduce<(string | React.JSX.Element)[]>((previousReturn, currentElement, index) => {
					if (index === 0) {
						return [currentElement];
					} else {
						return previousReturn.concat(<span className="matchedCharacter" key={index}>{lowerCaseSearchParam}</span>, currentElement);
					};
				}, [])
			}
		</>
	);
};

type DataListProps = {
	matchList: string[],
	inputRef: React.RefObject<HTMLInputElement>,
	isDataListShown: boolean,
	setIsDataListShown: React.Dispatch<React.SetStateAction<boolean>>,
	searchQuery: string,
	setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
	hoveredPokemon: string,
	setHoveredPokemon: React.Dispatch<React.SetStateAction<string>>,
	activePokemon: string,
	resetFocus: (datalist: HTMLDivElement) => void,
	namesAndIds: CachedAllPokemonNamesAndIds
};

const DataList = forwardRef<HTMLDivElement, DataListProps>(function DataList({
	matchList,
	inputRef,
	isDataListShown,
	setIsDataListShown,
	searchQuery,
	setSearchQuery,
	hoveredPokemon,
	setHoveredPokemon,
	activePokemon,
	resetFocus,
	namesAndIds
}, datalistRef) {
	const handleMouseOver = useCallback((pokemon: string) => {
		setHoveredPokemon(pokemon);
	}, [setHoveredPokemon]);

	const handleMouseLeave = useCallback(() => {
		setHoveredPokemon('');
	}, [setHoveredPokemon]);

	const handleClick = useCallback((pokemon: string) => {
		const input = inputRef.current;
		setHoveredPokemon('');
		resetFocus((datalistRef as React.RefObject<HTMLDivElement>).current!);
		setSearchQuery(pokemon);
		input!.focus();
		setIsDataListShown(false);
	}, [setHoveredPokemon, resetFocus, inputRef, setIsDataListShown, setSearchQuery, datalistRef]);

	// because on mobile device, there's no "hover", hover detection happens when tapping on something (without let go), so at each touch end (hover detection on mobile) we reset the hovered pokemon; when the mobile user click any item (which will not trigger hover event) we trigger click event.
	const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>, pokemon: string, isHovered: boolean) => {
		if (!isHovered) {
			// prevent click firing twice
			e.preventDefault();
			handleClick(pokemon);
		};
		// for onBlur to work on mobile
		setHoveredPokemon('');
	}, [handleClick, setHoveredPokemon]);

	return (
		<div ref={datalistRef} id='pokemonDataList' className={isDataListShown && matchList.length ? 'showDatalist' : ''}>
			{matchList.map(pokemon => (
				<ListItem
					searchQuery={searchQuery}
					// passing hoveredPokemon/activePokemon will break memoization when hovering/focusing list item.
					isHovered={hoveredPokemon === pokemon}
					isActive={activePokemon === pokemon}
					pokemon={pokemon}
					namesAndIds={namesAndIds}
					key={pokemon}
					onMouseOver={handleMouseOver}
					onMouseLeave={handleMouseLeave}
					onClick={handleClick}
					onTouchEnd={handleTouchEnd}
				/>
			))}
		</div>
	)
});
export default DataList;

type ListItemProps = {
	searchQuery: string,
	isHovered: boolean,
	isActive: boolean,
	pokemon: string,
	namesAndIds: CachedAllPokemonNamesAndIds,
	onMouseOver: (pokemon: string) => void,
	onMouseLeave: () => void,
	onClick: (pokemon: string) => void,
	onTouchEnd: (e: React.TouchEvent<HTMLDivElement>, pokemon: string, isHovered: boolean) => void
};

const ListItem = memo<ListItemProps>(function ListItem({
	searchQuery,
	isHovered,
	isActive,
	pokemon,
	namesAndIds,
	onMouseOver,
	onMouseLeave,
	onClick,
	onTouchEnd
}) {
	return (
		<div
			className={`${isHovered ? 'datalist_hover' : ''} ${isActive ? 'datalist_active' : ''}`}
			onMouseOver={() => { onMouseOver(pokemon) }}
			onMouseLeave={onMouseLeave}
			onClick={() => { onClick(pokemon) }}
			// for mobile device
			onTouchMove={() => { onMouseOver(pokemon) }}
			onTouchEnd={(e) => onTouchEnd(e, pokemon, isHovered)}
			key={pokemon}
		>
			<span>{colorMatching(pokemon, searchQuery)}</span>
			<Image width='96' height='96' src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${namesAndIds[pokemon]}.png`} alt={pokemon} />
		</div>
	)
});