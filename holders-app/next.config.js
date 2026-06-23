/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oscxbvjukxzmmgdnfrsd.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
