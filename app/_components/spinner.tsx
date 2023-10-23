'use client'

import { memo } from 'react'
import Image from 'next/image';

const Spinner = memo(function Spinner() {
	return (
		<div>
			<Image
				src="/spinner.gif"
				alt="Loading..."
				className='spinner'
				width={256}
				height={256}
			/>
		</div>
	)
});

export default Spinner;