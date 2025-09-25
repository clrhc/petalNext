/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/01997e69-306e-b9db-dbf4-a3624ed3ab01',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;
