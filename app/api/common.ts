import { NextRequest } from 'next/server';

const host = '45.32.94.79';
// const host = '172.25.9.84'
const port = '8080';
const url = `http://${host}:${port}`;

const OPENAI_URL = 'api.openai.com';
const DEFAULT_PROTOCOL = 'https';
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest) {
  const apiKey = req.headers.get('token');
  const openaiPath = req.headers.get('path');

  console.log('[Proxy] ', openaiPath);

  // return fetch(`${PROTOCOL}://${BASE_URL}/${openaiPath}`, {
  return fetch(`${url}/${openaiPath}`, {
    headers: {
      'Content-Type': 'application/json',
      Cookie: `token=${req.cookies.get('token')?.value}`,
    },
    method: req.method,
    body: req.body,
  });
}
