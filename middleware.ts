import { i18nRouter } from "next-i18n-router";
import i18nConfig from "./i18nConfig";
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	i18nRouter(request, i18nConfig);
	const pathname = request.nextUrl.pathname;
	if (!pathname.includes('pokemons') && !pathname.includes('pokemon')) {
		let locale = 'en';
		for (let l of i18nConfig.locales) {
			if (pathname.includes(l)) {
				locale = l;
			};
		};
		return NextResponse.redirect(new URL(`${locale}/pokemons`, request.url))
	}
}

// applies this middleware only to files in the app directory
export const config = {
	matcher: "/((?!api|static|.*\\..*|_next).*)",
};
