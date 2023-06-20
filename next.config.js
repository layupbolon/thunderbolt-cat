// const host = '45.63.57.39';
const host = process.env.host ?? '45.63.57.39';
const port = '8080';
const url = `http://${host}:${port}`

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    esmExternals:false
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    }); // 针对 SVG 的处理规则

    return config;
  },
  rewrites() {
    return [
      {
        source: '/api/order/:path*',
        destination: `${url}/api/order/:path*`,
      },
      {
        source: '/api/user/:path*',
        destination: `${url}/v1/user/:path*`,
      },
      {
        source: '/api/user-check-in/:path*',
        destination: `${url}/v1/user-check-in/:path*`,
      },
      {
        source: '/api/receive-points',
        destination: `${url}/v1/receive-points`,
      },
      {
        source: '/api/points-exchange/rule',
        destination: `${url}/v1/points-exchange/rule`,
      },
      {
        source: '/api/points-exchange',
        destination: `${url}/v1/points-exchange`,
      },
      {
        source: '/api/pay/notify',
        destination: `${url}/v1/user/pay/notify`,
      },
      {
        source: '/api/invite/url/:account',
        destination: `${url}/v1/user/:account/invite/url`,
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
      {
        source: '/api/query-prompt',
        destination: `${url}/v1/prompt/list`,
      },
    ]
  },
};

if (process.env.DOCKER) {
  nextConfig.output = 'standalone'
}

module.exports = nextConfig;
