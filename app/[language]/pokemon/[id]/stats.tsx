import { memo } from "react";
import { LanguageOption } from "../../_components/display/display-slice";
import { CachedStat } from "../../_components/pokemonData/pokemon-data-slice";
import { getNameByLanguage, transformToKeyName } from "@/app/_utils/util";
import { Pokemon } from "@/typeModule";
import { getData, getEndpointData } from "@/app/_utils/api";

type StatsProps = {
	language: LanguageOption;
	pokemonId: number;
};

const Stats = memo<StatsProps>(async function Stats({ language, pokemonId }) {
	const pokemonData = await getData("pokemon", pokemonId);
	const statResponse = await getEndpointData("stat");
	const statToFetch = statResponse.results.map((data) => data.url);
	const stats = await getData("stat", statToFetch, "name");

	return (
		<div className="col-12 mt-5 stats">
			<h1 className="text-center">Stats</h1>
			<table className="mx-auto">
				<tbody>
					{pokemonData.stats.map((entry) => (
						<tr key={entry.stat.name}>
							<td className="text-capitalize text-center" width="30%">
								{getNameByLanguage(
									entry.stat.name,
									language,
									stats[transformToKeyName(entry.stat.name)]
								)}
							</td>
							<td width="10%">{entry.base_stat}</td>
							<td width="255px">
								<div className="stat-bar-bg">
									<div style={{ width: `${(entry.base_stat / 255) * 100}%` }}>
										{/* key is used to retrigger animation */}
										<div
											key={pokemonData.id}
											className={`stat-bar stat-${entry.stat.name} progressAnimation`}
										></div>
									</div>
								</div>
							</td>
						</tr>
					))}
					<tr>
						<td className="text-center" style={{ fontSize: "bold" }}>
							Total
						</td>
						<td>
							{pokemonData.stats.reduce(
								(accumulator, currentVal) => accumulator + currentVal.base_stat,
								0
							)}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
});
export default Stats;
