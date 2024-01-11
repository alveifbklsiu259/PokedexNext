import withPlaiceholder from "@plaiceholder/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '/PokeAPI/sprites/master/sprites/**'
            }
        ]
    },
    // *********
    reactStrictMode: false,
    typescript: {
        ignoreBuildErrors: true
    }
}

export default withPlaiceholder(nextConfig)

