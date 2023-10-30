// import { useState, memo } from 'react';
// import { flushSync } from 'react-dom';
// import { selectAbilities, abilityLoaded, type CachedAbility } from './pokemonDataSlice';
// import { LanguageOption, selectLanguage } from '../display/displaySlice';
// import Spinner from '../spinner';
// import Modal from '../modal';
// import { transformToKeyName, transformToDash, getNameByLanguage, getTextByLanguage } from '../../_utils/util';
// import { getAbilitiesToDisplay, getData } from '../../_utils/api';
// import type { Pokemon, Ability } from '../../../typeModule';
// import { useAppDispatch, useAppSelector } from '../../_app/hooks';
// import { AiFillQuestionCircle } from 'react-icons/ai';

// type AbilitiesProps = {
//     language: LanguageOption
// 	pokemonData: Pokemon.Root,
//     abilityData: CachedAbility
// };

// const Abilities = memo<AbilitiesProps>(function Abilities({language, pokemonData, abilityData}) {
// 	// const dispatch = useAppDispatch();
// 	// const abilities = useAppSelector(selectAbilities);
// 	const language = useAppSelector(selectLanguage);
// 	const [isModalShown, setIsModalShown] = useState(false);
// 	const [isDetail, setIsDetail] = useState(false);
// 	const [abilityData, setAbilityData] = useState<Ability.Root | null>(null);
// 	const abilitiesToDisplay = getAbilitiesToDisplay(pokemon).map(ability => transformToDash(ability));

// 	const handleShowModal = async (ability: string) => {
// 		const abilityKey = transformToKeyName(ability);
// 		let fetchedAbility: CachedAbility;

// 		// for spinner to show
// 		if (abilityData?.name !== ability) {
// 			setAbilityData(null);
// 		};

// 		setIsModalShown(true);
// 		if (!abilities[abilityKey]) {
// 			fetchedAbility = await getData('ability', [ability], 'name');
// 			// for some reason Redux's state update and the local state update will not be batched if the state the current component is listening for will be updated and there's any await expression before the state updates, I just found out that flushSynch will help solve this problem, so use it to batch the state updates.
// 			flushSync(() => {
// 				dispatch(abilityLoaded(fetchedAbility));
// 				setAbilityData(fetchedAbility[abilityKey]);
// 			});
// 		} else {
// 			setAbilityData(abilities[abilityKey]);
// 		};
// 	};

// 	const handleShowModalDetail = () => {
// 		setIsDetail(!isDetail);
// 	};

// 	let brief: string | undefined, detail: string | undefined;

// 	if (abilityData) {
// 		brief = getTextByLanguage(language, abilityData.flavor_text_entries, 'flavor_text');
// 		detail = getTextByLanguage(language, abilityData.effect_entries, 'effect');
// 	};
// 	const customClass = `modalBody ${!abilityData && isModalShown ? 'modalLoading' : ''}`

// 	return (
// 		<>
// 			{abilitiesToDisplay.map(ability => (
// 			<div key={ability}>
// 				<span className='me-2'>{getNameByLanguage(ability.replace('-',' '), language, abilities[transformToKeyName(ability)]).toLowerCase()}</span>
// 				<AiFillQuestionCircle onClick={() => {handleShowModal(ability)}} className="icon"></AiFillQuestionCircle>
// 				<br />
// 			</div>
// 			))}
// 			{isModalShown && (
// 				<Modal
// 					customClass={customClass} 
// 					isModalShown={isModalShown} 
// 					setIsModalShown={setIsModalShown} 
// 					setIsDetail={setIsDetail}
// 				>
// 					{
// 						abilityData ? (
// 							<>
// 								<h1 className='abilityName my-2'>{getNameByLanguage(abilityData.name, language, abilityData)}</h1>
// 								<div className='abilityDescription p-3'>
// 									<p>{isDetail ? detail : brief}</p>
// 								</div>
// 								<div className='modalBtnContainer'>
// 									<button onClick={handleShowModalDetail} className="btn btn-warning">Show {isDetail ? 'Brief' : 'Detail'}</button>
// 								</div>
// 							</>
// 						) : (
// 							<Spinner />
// 						)
// 					}
// 				</Modal>
// 			)}
// 		</>
// 	)
// });
// export default Abilities;