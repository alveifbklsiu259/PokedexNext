import { redirect } from "next/navigation";

export default async function Page() {
	redirect('/en')
};


// can I use suspense to make a component show disabled hovered icon when hydration is not finished?