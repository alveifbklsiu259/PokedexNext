import { memo } from "react";
import Image from "next/image";
// import Link from "next/link";

type MemoImageProps = React.ComponentPropsWithRef<typeof Image>;

// React.ComponentProps can even be used to get native element's props: e.g. React.ComponentPropsWithRef<'a'>

export const MemoImage = memo(function MemoImage(props: MemoImageProps) {
	return <Image {...props} />;
});

// type MemoLinkProps = React.ComponentPropsWithRef<typeof Link>;

// export const MemoLink = memo(function MemoLink(props: MemoLinkProps) {
// 	return <Link {...props} />;
// });


// for some reason, <Link> will re-render once after mounts (hook 5 changed), maybe we can use useRouter to create a new Link that does not re-render after mount, but since the time it re-render is very short(around 0.1 ms), maybe there's no need to do this.