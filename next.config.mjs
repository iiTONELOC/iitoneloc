/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  img-src 'self' data:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://earthquake.usgs.gov;
  worker-src 'self' blob:;
  frame-src 'self';
  font-src 'self';
  object-src 'self';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  `;

const appleTouchIconPath = "/images/apple-touch-icon.png";
const appleTouchIconRoutes = [
  {
    source: "/apple-touch-icon.png",
    destination: appleTouchIconPath,
  },
  {
    source: "/apple-touch-icon-precomposed.png",
    destination: appleTouchIconPath,
  },
];
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader.replaceAll("\n", "").trim(),
  },
];

const nextConfig = {
  rewrites: async () => appleTouchIconRoutes,
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
