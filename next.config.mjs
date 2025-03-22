/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  img-src 'self' https://raw.githubusercontent.com;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' ;
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://api.github.com;
  frame-src 'self';
  font-src 'self';
  object-src 'self';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  `;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, "").trim(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
