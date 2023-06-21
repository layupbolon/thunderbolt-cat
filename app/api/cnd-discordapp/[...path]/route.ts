import { NextRequest } from 'next/server';

async function handle(req: NextRequest) {
  const reqPath = `${req.nextUrl.pathname}`.replaceAll('/api/cnd-discordapp/', '');

  let fetchUrl = `https://cdn.discordapp.com/${reqPath}`;
  return await fetch(fetchUrl, { method: req.method, body: req.body, cache: 'no-store' });
}

export const GET = handle;
