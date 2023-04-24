/** @type {import('next').NextConfig} */

const host = '45.32.94.79';
// const host = '172.25.9.84'
const port = '8080';
const url = `http://${host}:${port}`

const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    }); // 针对 SVG 的处理规则

    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/user/pay/notify',
        destination: `${url}/v1/user/pay/notify`,
      },
      {
        source: '/api/user/:account*/invite/url',
        destination: `${url}/v1/user/:account*/invite/url`,
      },
      {
        source: '/api/user/:path*',
        destination: `${url}/v1/user/:path*`,
      },
      
      {
        source: '/api/authenticate',
        destination: `${url}/authenticate`,
      },
      {
        source: '/api/prompt-category-list',
        destination: `${url}/v1/prompt/category/list`,
      },
      {
        source: '/api/prompt-list',
        destination: `${url}/v1/0/prompt/list`,
      },
      {
        source: '/api/package-list',
        destination: `${url}/v1/member/plan/list`,
      },
    ]
  },
};

if (process.env.DOCKER) {
  nextConfig.output = 'standalone'
}

module.exports = nextConfig;
