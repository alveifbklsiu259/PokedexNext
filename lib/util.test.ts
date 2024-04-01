import 'whatwg-fetch'
import { Pokemon, PokemonForm, PokemonSpecies } from "./definitions";
import { getIdFromURL, transformToKeyName, transformToDash, getNameByLanguage, getFormName } from "./util";
import i18nConfig from "../i18nConfig";



let pokemonData: Pokemon.Root,
    speciesData: PokemonSpecies.Root;

function getRandomLocale(locales: typeof i18nConfig.locales) {
    const random = Math.floor(Math.random() * locales.length);
    return locales[random];
};

const randomLocale = getRandomLocale(i18nConfig.locales)

beforeAll(async () => {
    const randomNum = Math.ceil(Math.random() * 1000);
    const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomNum}`);
    const pd: Pokemon.Root = await pokemonRes.json();
    const speciesRes = await fetch(pd.species.url);
    const sd: PokemonSpecies.Root = await speciesRes.json();
    pokemonData = pd;
    speciesData = sd;
})


test('getIdFromURL', () => {
    expect(getIdFromURL(pokemonData.species.url)).toBeGreaterThanOrEqual(0);
});

describe('transform text', () => {
    const str = 'test-text'

    test('transformToKeyName', () => {
        expect(transformToKeyName(str)).toContain('_');
    });

    test('transformToDash', () => {
        expect(transformToDash(transformToKeyName(str))).toContain('-');
    })
});

test('getNameByLanguage', () => {
    expect(speciesData).toHaveProperty('names')
    expect(getNameByLanguage(speciesData.name, randomLocale, speciesData)).toBeTruthy();
    expect(getNameByLanguage(speciesData.name, randomLocale)).toBeTruthy();
});

test('getFormName', async () => {
    const formRes = await fetch(pokemonData.forms[0].url);
    const formData: PokemonForm.Root = await formRes.json();
    expect(getFormName(speciesData, randomLocale, pokemonData, formData)).toBeTruthy();
    expect(getFormName(speciesData, randomLocale, pokemonData)).toBeTruthy();

    if (pokemonData.is_default) {
        expect(getFormName(speciesData, randomLocale, pokemonData)).toBe(getNameByLanguage(pokemonData.name, randomLocale, speciesData))
    };
});