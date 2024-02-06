'use client';
import React, { useState, useMemo, memo, useCallback } from "react";
import Image from "next/image";
import { Skeleton, capitalize } from "@mui/material";
import type { TableColumn } from "react-data-table-component";
import { type Locale } from "@/i18nConfig";
import { transformToKeyName, getNameByLanguage } from "@/lib/util";
import MovesTable from "./moves-table";
import { PokemonSpecies, Pokemon, Machine, Move, EvolutionChain } from "@/lib/definitions";
import { CachedMachine, CachedType, CachedVersion, CachedMove, CachedGeneration, CachedMoveDamageClass } from "@/slices/pokemon-data-slice";

export type ColData = {
	level?: number | React.JSX.Element,
	machine?: React.JSX.Element,
	type: React.JSX.Element,
	move: string,
	cat: string,
	power: number | string,
	acc: string,
	pp: number
};

export type MovesData = ColData & {
	id: string,
	effect: Move.EffectEntry[],
	flavorText: Move.FlavorTextEntry[]
};

const formatColumnHeader = (data: keyof ColData) => {
	switch (data) {
		case 'pp' : 
			return 'PP'
		case 'acc' :
		case 'cat' :
			return capitalize(data).concat('.');
		default : 
			return capitalize(data)
	};
};

const sortNumsWithNull = (data: 'power') => (rowA: ColData, rowB: ColData) => {
	const a = rowA[data] === '—' ? 0 : rowA[data] as number;
	const b = rowB[data] === '—' ? 0 : rowB[data] as number;
	return a - b;
};

// when switching filter method, this function will run again if data is sorted, to avoid error, use optional chaining.
const sortElement = (data: 'type' | 'machine' | 'level') => (rowA: ColData, rowB: ColData) => {
	const a: number | string = typeof rowA[data] === 'object' ? (rowA[data] as React.JSX.Element).props['data-value'] : rowA[data];
	const b: number | string = typeof rowB[data] === 'object' ? (rowB[data] as React.JSX.Element).props['data-value'] : rowB[data];
	return String(a).localeCompare(String(b), undefined, {numeric: true});
};

const columnDataCreator = (filteredMethod: 'level-up' | 'machine'): TableColumn<ColData>[] => {
	const column = [(filteredMethod === 'level-up' ? 'level' : 'machine'), 'move', 'type', 'cat', 'power', 'acc', 'pp'] as const;
	return column.reduce<TableColumn<ColData>[]>((pre, cur) => {
		pre.push({
			id: cur,
			name: formatColumnHeader(cur),
			// the declaration file of rdt specifies that the return type of "selector" can only be Primitive, but in my use case, I want to show React.JSX.Element in some of the field.
			selector: row => row[cur] as any,
			sortable: true,
			center: true,
			sortFunction: cur === 'type' || cur === 'machine' || cur === 'level' ? sortElement(cur) : cur === 'power' ? sortNumsWithNull(cur) : undefined
		});
		return pre;
	}, []);
};

type MovesClientProps = {
	pokemonData: Pokemon.Root
	locale: Locale,
	types: CachedType,
	versionData: CachedVersion,
	moveData: CachedMove,
	generationData: CachedGeneration,
	speciesData: PokemonSpecies.Root,
	debutGeneration: string,
	chainData: EvolutionChain.Root,
	movesDamageClass: CachedMoveDamageClass
};


const MovesClient = memo<MovesClientProps>(function MovesClient({
	pokemonData,
	locale,
	types,
	versionData,
	moveData,
	generationData,
	speciesData,
	debutGeneration,
	chainData,
	movesDamageClass,
}) {

	const generationNames = useMemo(() => Object.values(generationData).map(generation => generation.name), [generationData]);
	const generationOptions = useMemo(() => generationNames.slice(generationNames.indexOf(debutGeneration)), [generationNames, debutGeneration]);
	const [selectedGeneration, setSelectedGeneration] = useState(debutGeneration);
	const versions = generationData[transformToKeyName(selectedGeneration)].version_groups;

	const versionOptions = useMemo(() => generationOptions.reduce<string[]>((pre, cur) => {
		pre.push(...generationData[transformToKeyName(cur)].version_groups.map(version => version.name));
		return pre;
	}, []), [generationOptions, generationData]);
	const [selectedVersion, setSelectedVersion] = useState(versions[0].name);
	const [filteredMethod, setFilteredMethod] = useState<'level-up' | 'machine'>('level-up');
	const [machines, setMachines] = useState<CachedMachine | null>(null);
	const [isMachinesLoading, setIsMachinesLoading] = useState(false);

	const getVersionName = useCallback((version: string) => {
		if (locale !== 'en') {
			const matchedVersions = Object.values(versionData).filter(entry => entry.version_group.name === version);
			let versionName = '';
			matchedVersions.forEach((entry, index, array) => {
				versionName += getNameByLanguage(entry.name, locale, versionData[transformToKeyName(entry.name)]);
				if (index < array.length - 1) {
					versionName += '/';
				};
			});
			return versionName;
		} else {
			return version;
		};
	}, [versionData, locale]);

	// for pokemon that learns move(s) on evolution.
	let maxEvoLevel: undefined | number;
	if (speciesData.evolves_from_species !== null) {
		maxEvoLevel = 0;

		// find range.
		const matchedChains = chainData.chains.filter(chain => chain.includes(speciesData.id));
		const rangeIds = new Set<number>();

		matchedChains.forEach(chain => {
			chain.forEach((id, index) => {
				// the first pokemon in the chain doesn't contain evolution detail.
				if (index !== 0 && index <= chain.indexOf(speciesData.id)) {
					rangeIds.add(id);
				};
			});
		});

		type ChainDetails = typeof chainData.details[number][];
		// find max evolution level in the range.
		const chainDetails = [...rangeIds].map(id => chainData.details[id]);
		const findHeighestEvoLevel = (chainDetails: ChainDetails | ChainDetails[number]) => {
			chainDetails.forEach(entry => {
				// some newly added pokemon in the API may lack evolution-chain's detail data.
				if (entry !== undefined) {
					if (entry instanceof Array) {
						findHeighestEvoLevel(entry);
					} else {
						if (entry.min_level !== null && entry.min_level > maxEvoLevel!) {
							maxEvoLevel = entry.min_level;
						};
					};
				}
			});
		};
		findHeighestEvoLevel(chainDetails);
	};

	const filterMoves = useCallback((method: typeof filteredMethod, version: string | string[]) => {
		const conditions = {
			move_learn_method: method,
			version_group: version
		};
		type ConditionKey = keyof typeof conditions;
		
		const test = (versionDetail: Pokemon.VersionGroupDetail) => Object.keys(conditions).every(key => {
			const entry = conditions[key as ConditionKey];
			if (Array.isArray(entry)) {
				return entry.some(condition => versionDetail[key as ConditionKey].name === condition);
			} else {
				return entry === versionDetail[key as ConditionKey].name;
			};
		});

		const matches = pokemonData.moves.filter(move => move.version_group_details.some(test));
		const results = matches.map(move => ({...move, version_group_details: move.version_group_details.filter(test)}));
		return results;
	}, [pokemonData]);

	const filteredMoves = useMemo(() => filterMoves(filteredMethod, selectedVersion), [filterMoves, filteredMethod, selectedVersion]);
	const movesLearnedByMachine = useMemo(() => filterMoves('machine', versionOptions), [filterMoves, versionOptions]);

	// all moves for current pokemon.
	// const movesToFetch = useMemo(() => pokemonData.moves.filter(entry => !moveData[transformToKeyName(entry.move.name)]).map(entry => getIdFromURL(entry.move.url)), [pokemonData, moveData]);

	const checkLearnOnEvo = useCallback((level: number, maxEvoLevel: number | undefined) => {
		// level-up; data-value attribute is used for sorting, if maxEvoLevel is 0, put it after level 1.
		const learnOnEvolution = <span data-tag="allowRowEvents" data-value={maxEvoLevel === 0 ? 2 : maxEvoLevel} title="Learned when Evolution" className="learnUponEvolution">Evo.</span>;
		// there's some incorrect data in the API... (when level === 0, it means that this move is acquired on evolution, then maxEvoLevel should not be undefined.)
		return level === 0 ? maxEvoLevel === undefined ? 1 : learnOnEvolution : level;
	}, []);

	const movesDataCreator = (moves: typeof filteredMoves): MovesData[] => {
		const isFilteredByLevel = filteredMethod === 'level-up';
		const data = moves.map(entry => {
			const lookupName = transformToKeyName(entry.move.name);
			const cachedMove = moveData[lookupName];
			const versionDetails = entry.version_group_details;
			const moveName = capitalize(getNameByLanguage(entry.move.name, locale, moveData[transformToKeyName(entry.move.name)]));

			const type = cachedMove.type.name;
			const typeContent = <span data-value={type} data-tag="allowRowEvents" className={`type type-${type}`}>{getNameByLanguage(type, locale, types[type]).toUpperCase()}</span>;

			// some moves can be learned at different levels.
			const levelContent = versionDetails.length === 1 ? checkLearnOnEvo(versionDetails[0].level_learned_at, maxEvoLevel) : versionDetails.map(detail => checkLearnOnEvo(detail.level_learned_at, maxEvoLevel));

			// category
			const categoryText = getNameByLanguage(cachedMove.damage_class.name, locale, movesDamageClass[cachedMove.damage_class.name]);

			let machineContent: undefined | React.JSX.Element;
			// get machines, chnage pokemon, get machines, check if all correct? also check redux stat change

			// if (!isFilteredByLevel) {
			// 	// const url = movesLearnedByMachine.find(entry => transformToKeyName(entry.move.name) === lookupName)!.move.url;
			// 	// the latest version may not have machine data
			// 	const machineEntry = moveData[lookupName].machines.find(entry => entry.version_group.name === selectedVersion);
			// 	let machineUrl = machineEntry ? machineEntry.machine.url : undefined;
			// 	machineContent = <MachineContent url={machineUrl} type={type} key={lookupName.concat(`_${selectedVersion}`)}/>
			// };
			if (!isFilteredByLevel) {
				if (isMachinesLoading) {
					machineContent = (
						<div data-value={'loading'}>
							{/* <Image
								src="/spinner.gif"
								alt="Loading..."
								width={30}
								height={30}
							/> */}
							<Skeleton variant="rectangular" width={72.7} height={30}  />
						</div>
					)
				} else if (machines) {
					const machine = machines[lookupName].version_groups?.[transformToKeyName(selectedVersion)] || 'No Data';
					machineContent = (
						<div data-value={machine} className="machineData">
							<div data-tag="allowRowEvents">{machine.toUpperCase()}</div>
							<Image width={30} height={30} data-tag="allowRowEvents" src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-${type}.png`} alt={`tm-${type}`} className="machine"/>
						</div>
					)
				}
			}
			const displayContent = isFilteredByLevel ? levelContent : machineContent;
			return {
				// id is used as an key for React Data Table.
				id: isFilteredByLevel ? moveName : moveName.concat(machineContent!.props['data-value']),
				[isFilteredByLevel ? 'level' : 'machine']: displayContent,
				move: moveName,
				type: typeContent,
				cat: categoryText,
				power: cachedMove.power !== null ? cachedMove.power : '—',
				acc: cachedMove.accuracy !== null ? `${cachedMove.accuracy}%` : '—',
				pp: cachedMove.pp,
				effect: cachedMove.effect_entries,
				flavorText: cachedMove.flavor_text_entries
			};
		});

		data.forEach((move, index) => {
			// moves that learned at differetn levels
			if (move.level instanceof Array) {
				(move.level as (number | React.JSX.Element)[]).forEach(level => {
					const lv = typeof level === 'object' ? 0 : level;
					data.push({...move, level: level, id: move.move.concat(`-${lv}`)})
				})
				delete data[index];
			};
		});

		//  initial sort, remove empty element
		return data.flat().sort((a, b) => {
			const sortField = isFilteredByLevel ? 'level': 'machine';

			const rowA: string | number = typeof a[sortField] === 'object' ? (a[sortField] as React.JSX.Element).props['data-value'] : a[sortField] as number;
			const rowB: string | number = typeof b[sortField] === 'object' ? (b[sortField] as React.JSX.Element).props['data-value'] : b[sortField] as number;
			return String(rowA).localeCompare(String(rowB), undefined, {numeric: true});
		});
	};

	const columnData = useMemo(() => columnDataCreator(filteredMethod), [filteredMethod]);
	const movesData = movesDataCreator(filteredMoves);

	const changeGeneration = (generation: string) => {
		const nextVersion = generationData[transformToKeyName(generation)].version_groups[0].name;
		setSelectedGeneration(generation);
		setSelectedVersion(nextVersion);
	};

	const changeVersion = (version: string) => {
		setSelectedVersion(version);
	};

	// const isMachineDataReady = movesLearnedByMachine.every(entry => machines[transformToKeyName(entry.move.name)]);

	const changefilteredMethod = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
		setFilteredMethod(e.target.checked ? 'machine' : 'level-up');
		
		if (e.target.checked && machines === null) {
			const machinesToFetch: string[] = [];
			let fetchedMachines: Machine.Root[] | undefined;
			const machineData: CachedMachine = {};

			movesLearnedByMachine.forEach(entry => {
				const keyName = transformToKeyName(entry.move.name);
				machinesToFetch.push(...moveData[keyName].machines.map(entry => entry.machine.url));
			})

			setIsMachinesLoading(true)
			const dataResponses = await Promise.all(machinesToFetch.map(url => fetch(url)));
			const datas = dataResponses.map(response => response.json());
			fetchedMachines = await Promise.all(datas);

			fetchedMachines.forEach(machine => {
				const keyName = transformToKeyName(machine.move.name);
				if (!machineData[keyName]) {
					machineData[keyName] = {version_groups: {}};
				};
				machineData[keyName].version_groups = {
					...machineData[keyName].version_groups,
					[transformToKeyName(machine.version_group.name)]: machine.item.name
				};
			});
			// some machine data is lacking in the API, but we still have to cache them to correctly check whether machine data ready or not.
			movesLearnedByMachine.forEach(machine => {
				const keyName = transformToKeyName(machine.move.name);
				if (!machineData[keyName]) {
					machineData[keyName] = {version_groups: {}};
				};
			});
			setMachines(machineData)
			setIsMachinesLoading(false)
			
			// dispatch(machineDataLoaded(machineData));
		};
	}, [setFilteredMethod, moveData, machines, setMachines, setIsMachinesLoading, movesLearnedByMachine]);

	// const isDataReady = filteredMethod === 'level-up' ? !!movesData : !!movesData && isMachineDataReady;
	return (
		<>
			<div className="moves text-center mt-5">
				<h1>Moves</h1>
				<div>
					{generationOptions.map(generation => (
						<button 
							className={`generationBtn btn btn-outline-secondary m-1 ${selectedGeneration === generation ? 'active' : ''}`}
							// disabled={!isDataReady}
							key={generation}
							onClick={() => changeGeneration(generation)}
						>{(generation.replace('generation-', '')).toUpperCase()}</button>
					))}
				</div>
				<div className='col-12 varieties'>
					<ul>
						{versions.map(version => (
							<React.Fragment key={version.name}>
								<li className={version.name === selectedVersion ? 'active' : ''}>
									<button disabled={false} className='text-capitalize' onClick={() => changeVersion(version.name)}>{getVersionName(version.name)}</button>
								</li>
							</React.Fragment>
						))}
					</ul>
				</div>
				{movesData && (
					<MovesTable
						movesData={movesData}
						columnData={columnData}
						changefilteredMethod={changefilteredMethod} 
						filteredMethod={filteredMethod} 
						selectedVersion={selectedVersion}
						//  remove this prop
						isDataReady={true}
						locale={locale}
					/>
				)}
			</div>
		</>
	)
});
export default MovesClient;


type MachineContentProps = {
	url: string | undefined;
	type: string
}


// if we have the machine stored in moves-client, we're gonna have to fetch all of them or the whole table will re-renders when we change gneration/version
// const MachineContent = ({url, type}: MachineContentProps) => {
// 	const [isLoading, setIsLoading] = useState(true);	
// 	const [data, setData] = useState<Machine.Root | null>(null);

// 	useEffect(() => {
// 		if (url && data === null) {
// 			const getMachine = async() => {
// 				const response = await fetch(url);
// 				const machine: Machine.Root = await response.json();
// 				setData(machine);
// 				setIsLoading(false)
// 			};
// 			getMachine();
// 		} else if (url === undefined) {
// 			setIsLoading(false)
// 		};
// 	}, [url, data, setData]);

// 	let content;
	
// 	if (isLoading) {
// 		content = (
// 			<Image
// 				src="/spinner.gif"
// 				alt="Loading..."
// 				width={30}
// 				height={30}
// 			/>
// 		)
// 	} else if(!isLoading && data === null) {
// 		content = <span>No Data</span>
// 	} else {
// 		const machine = data!.item.name;
// 		content = (
// 			<div data-value={machine} className="machineData">
// 				<div data-tag="allowRowEvents">{machine?.toUpperCase()}</div>
// 				<Image width={30} height={30} data-tag="allowRowEvents" src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-${type}.png`} alt={`tm-${type}`} className="machine"/>
// 			</div>
// 		)
// 	}

// 	return (
// 		<>
// 			{content}
// 		</>
// 	)
// }