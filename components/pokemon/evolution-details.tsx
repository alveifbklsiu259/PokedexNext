import { memo } from "react";
import Image from "next/image";
import { FaMars, FaVenus } from 'react-icons/fa';
import { AiOutlineCheck } from 'react-icons/ai';
import { type Locale } from "@/i18nConfig";
import { getData, getEvolutionChains, getItemsFromChain } from "@/lib/api";
import { transformToKeyName, getNameByLanguage } from "@/lib/util";
import { EvolutionChainResponse } from "@/lib/definitions";
import ChainDetailsBtn from "./chain-detail-btn";

const textsForOtherRequirements = {
	gender: 'Gender',
	held_item: 'Hold Item',
	item: 'Use Item',
	known_move: 'Know Move',
	known_move_type: 'Know Move Type',
	location: 'Location',
	min_affection: 'Minimum Affection',
	min_beauty: 'Minimum Beauty',
	min_happiness: 'Minimum Happiness',
	min_level: 'Minimum Level',
	needs_overworld_rain: "During rain",
	party_species: "With Pokemon In Party",
	party_type: 'With xxx-type Pokemon In Party',
	relative_physical_stats: 'Attack : Defense', // -1: < , 1: >, 0: =
	time_of_day: 'Time of Day',
	trade_species: 'Trade for',
	turn_upside_down: 'Hold game system upside-down'
};

type EvolutionDetailsProps = {
	locale: Locale,
	chainId: number,
	defaultFormId: number,
	isChainDefault: boolean,
}

type GetKeys<T> = {
	[K in keyof T]: T[K]
}

const EvolutionDetails = memo<EvolutionDetailsProps>(async function EvolutionDetails({locale, chainId, defaultFormId, isChainDefault}) {
	// // evolution chain
	const chainData = await getEvolutionChains(chainId);

	// item
	const requiredItems = getItemsFromChain(chainData?.details);
	const items = await getData('item', requiredItems, 'name');

	// some evolution detail data is missing In the API, e.g. 489, 490...
	const chainDetails: EvolutionChainResponse.EvolutionDetail[] | undefined = chainData?.details?.[defaultFormId];
	// some pokemon can evolve by different triggers.
	let selectedDetail = chainDetails?.[0];
	if (isChainDefault === false && chainDetails && chainDetails?.length > 1) {
		selectedDetail = chainDetails[1];
	};

	type Requirements = Partial<GetKeys<Omit<typeof selectedDetail, 'trigger'>>>

	let requirements: Requirements,
		trigger: string, 
		mainText: string | React.JSX.Element = '',
		otherRequirements: React.JSX.Element | undefined,
		content: React.JSX.Element;

	const rephrase = (requirements: Requirements, requirement: keyof Requirements) => {
		let value = requirements[requirement];
		switch(requirement) {
			case 'gender' : 
				switch (value) {
					case 1 : {
						value = <FaVenus className="fa-venus"></FaVenus>
						break;
					}
					default : {
						value = <FaMars className="fa-mars"></FaMars>
					}
				}
				break;

				case 'relative_physical_stats' :
				switch (value) {
					case 1 : {
						value = 'Attack > Defense';
						break;
					}
					case -1 : {
						value = 'Attack < Defense';
						break;
					}
					default : {
						value = 'Attack = Defense';
					}
				}
				break;

			case 'held_item' : 
				value = (
					<>
						{getNameByLanguage(value, locale, items[transformToKeyName(value)!])}
						<Image className="item" src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${value}.png`} alt={`${value}`} />
					</>
				)
				break;
			
			default : 
				value = requirements[requirement];
		};

		if (value === true) {
			value = <AiOutlineCheck></AiOutlineCheck>
		};
		return value;
	};

	if (selectedDetail) {
		requirements = Object.entries(selectedDetail)
			.filter(([condition, value]) => (value || value === 0) && condition !== 'trigger')
			.reduce<Requirements>((pre, cur) => {
				// if it's an object, just pass the name
				pre[cur[0] as keyof Requirements] = typeof cur[1] === 'object' ? cur[1].name : cur[1];
				return pre;
			}, {});

		trigger = selectedDetail.trigger.name;
		
		switch(trigger) {
			case 'level-up' : 
				if (requirements["min_level"]) {
					mainText = `Level ${requirements["min_level"]}`
					delete requirements["min_level"];
				} else {
					mainText = `Level up`
				};
				break;
	
			case 'trade' : 
				mainText = `Trade`
				break;
	
			case 'use-item' : 
				if (requirements["item"]) {
					mainText = (
						<>
							<span>
								{`Use ${getNameByLanguage(requirements["item"], locale, items[transformToKeyName(requirements["item"])!])}`}
							</span>
							<Image width='30' height='30' className="item" src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${requirements["item"]}.png`} alt={`${requirements["item"]}`} />
						</>
					)
					delete requirements["item"];
				};
				break;
			
			case 'shed' : 
				mainText = 'Level 20, Empty spot in party, Pokeball in bag';
				break;
			default : 
				mainText = 'No Data';
		};
		
		otherRequirements = (
			<ul className="p-0 mt-2 mb-4">
				{
					Object.keys(requirements).map((requirement) => (
						<li key={requirement}>
							{textsForOtherRequirements[requirement as keyof Requirements]} : {rephrase(requirements, requirement as keyof Requirements)}
						</li>
					))
				}
			</ul>
		);

		content = (
			<>
				<div className="evolutionDetails">
					<div className="mainText">{mainText}</div>
					{Object.keys(requirements).length ? <ChainDetailsBtn otherRequirements={otherRequirements} /> : ''}
				</div>
			</>
		);
	} else {
		content = (
			<div className="evolutionDetails">
				<div className="mainText">No Data</div>
			</div>
		);
	};

	return (
		<>
			{content}
		</>
	)
});
export default EvolutionDetails;