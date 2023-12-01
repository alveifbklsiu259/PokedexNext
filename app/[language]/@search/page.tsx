import SearchWrapper from "../_components/search/search-wrapper"
import { LanguageOption } from "../_components/display/display-slice"
import { getData, getEndpointData } from "../../_utils/api";


type PageProps = {
	params: {language: LanguageOption},
	// searchParams: { [key: string]: string | string[] | undefined }
};


export default async function Page({params}: PageProps) {
	const {language} = params;
	
	const generationResponse = await getEndpointData('generation');
	const generations = await getData('generation', generationResponse.results.map(entry => entry.name), 'name');

	// types
	const typeResponse = await getEndpointData('type');
	const types = await getData('type', typeResponse.results.map(entry => entry.name), 'name');	
	
	console.log('search')
	return (
		<SearchWrapper
			generations={generations}
			types={types}
			language={language}
		/>
		// <h1>7484848</h1>
	)
}