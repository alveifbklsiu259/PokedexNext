import { memo } from "react";
import { i18nNamespaces, type Locale } from "@/i18nConfig";
import { getNameByLanguage, transformToKeyName } from "@/lib/util";
import { getData, getEndpointData } from "@/lib/api";
import { initTranslationsServer } from "@/lib/i18n";

type StatsProps = {
	locale: Locale;
	pokemonId: number;
};

const Stats = memo<StatsProps>(async function Stats({ locale, pokemonId }) {
	const pokemonData = await getData("pokemon", pokemonId);
	const statResponse = await getEndpointData("stat");
	const statToFetch = statResponse.results.map((data) => data.url);
	const stats = await getData("stat", statToFetch, "name");
	const { t } = await initTranslationsServer(locale, i18nNamespaces);

	return (
		<div className="col-12 mt-5 stats">
			<h1 className="text-center">{t('pokemon:stats')}</h1>
			<table className="mx-auto">
				<tbody>
					{pokemonData.stats.map((entry) => (
						<tr key={entry.stat.name}>
							<td className="text-capitalize text-center" width="30%">
								{getNameByLanguage(
									entry.stat.name,
									locale,
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
							{t('total')}
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
