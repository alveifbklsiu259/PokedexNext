import NotFoundLink from "@/components/not-found-link";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="errorPage">
			<div className="col-6">
				<Image
                    priority
					className="pageNotFoundImg"
					width="475"
					height="475"
					src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png"
					alt="PageNotFound"
				/>
			</div>
			<div>
				<h1 className="mt-3">Page Not Found</h1>
				<div className="p-3 text-center">
					<p className="text-center">
						The page you&apos;re looking for can not be found.
					</p>
					<NotFoundLink/>
				</div>
			</div>
		</div>
	);
}
