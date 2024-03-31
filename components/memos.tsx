import { memo } from "react";
import Image from "next/image";

type MemoImageProps = React.ComponentPropsWithRef<typeof Image>;

export const MemoImage = memo(function MemoImage(props: MemoImageProps) {
	return <Image {...props} />;
});