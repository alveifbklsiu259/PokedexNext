import { Suspense } from "react";
import PokemonsServer from "@/components/pokemons/pokemons-server";
import type { LanguageOption } from "@/slices/display-slice";
import { PokemonsSkeleton } from "@/components/skeletons";

type PageProps = {
	params: {
		language: LanguageOption;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params, searchParams }: PageProps) {
	console.log(JSON.stringify(searchParams));
	return (
		<>
			<Suspense
				key={JSON.stringify(searchParams)}
				fallback={<PokemonsSkeleton />}
			>
				<PokemonsServer params={params} searchParams={searchParams} />
			</Suspense>
		</>
	);
}

/* 
This route renders the same "Pokemons component" as /[language]/page.tsx does, why do we still keep this route?
There're a couple of reasons:
1. I want to shown the initial Pokemons for /[language] for better SEO, this mean that /[language] can be either statically or dynamically rendered.
2. If we don't have another route /[language]/search and just append search params to /[language] when searching pokemons, then:
2-1 if /[language] is dynamically rendered, when we search and navigate to /[language]?query=xxx, this is considered a subsequent navigation, because Pokemons is a client component, it will only render on the client side, but since /[language] is dynamically rendered, each subsequent navigation will also cause /[language]/page.tsx to be rendered on the server again, which is not so good.
2-2 if /[language] is statically rendered, navigating to /[language]?query=xxx will not have the same issue as 2-1, but if we refresh the after searching e.g. /en?query=xxx, the user will see the initial Pokemons (from the fallback), which is also not good.

By having another statically rendered route, we can solve the above two issues (we can sove 2-2 by wrapping Pokemons in /[language]/search in another suspense, and provide a spinner or whatever as fallback, we don't have to worry about SEO, because the initial Pokemons is provided by /[language]'s suspense fallback)
Note: A client component that uses useSearchParams will have different render behaviors depends on whether the route is static or dynamic.

here's another question: what's the point of rendering this route statically on the server? would it be better off if we render this route only on the client side?
first of all, Pokemons need some data, so we have to fetch the data in a server component.
second, what's the point of marking this route as a client component? it will still be statically rendered on the server(client component will also be rendered on the server), which is the same as rendering as a server component.

*/

// when navigating to a static route, if this route fetched a lot of data ,navigation is slow, why? it's not like the route is dynamic which will be rendered at request time.
// I'm not sure if this is an intended behavior, you can check https://leerob.io/guestbook (the vice president of vercel's blog), when navigating to blog or guestbook, this also happens(the page is a bit unresponsive, and url change also lags a bit)

// I think I find the problem: consider this structure:
// route1/page.tsx: statically rendered on the server, fetch a lot of data, and it renders a client component;
// if route1/page.tsx is passing fetched down to the clinet component, navigating to this route will be slow eve though this route is statically generated at build time.
// if route1/page.tsx is NOT passing fetched down to the clinet component, navigating to this route will be blazing fast.
