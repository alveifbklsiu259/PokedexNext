type Layout = {
	children: React.ReactNode;
};

export default async function RootLayout(props: Layout) {
    console.log('layout')
	return <>{props.children}</>;
}
