export default function Loading() {
	return <h1>language loading...</h1>
}


// fetching data will trigger loading.js (suspense) to run;
// rendering will trigger loading.js (suspense) to run? (when the data is cached in data cache, loading will still be shown when refresh, but I'm not sure if that's because there's asynchronous code in the route, or is it that even just rendering will trigger Suspense)