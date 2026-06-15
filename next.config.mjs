/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  img-src 'self' data:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com;
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://earthquake.usgs.gov https://eonet.gsfc.nasa.gov;
  frame-src 'self' https://www.google.com;
  font-src 'self';
  object-src 'self';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  `;

const isProduction = process.env.NODE_ENV === "production";
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader.replaceAll("\n", "").trim(),
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig = {
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
