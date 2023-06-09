import { NextRequest } from 'next/server';

// const host = '45.32.94.79';
const host = process.env.host ?? '45.63.57.39';
const port = '8080';
const url = `http://${host}:${port}`;

const OPENAI_URL = 'api.openai.com';
const DEFAULT_PROTOCOL = 'https';
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest) {
  const token = req.headers.get('token');
  const openaiPath = req.headers.get('path');

  console.log('[Proxy] ', openaiPath);

  const body = await req.json();

  // return fetch(`${PROTOCOL}://${BASE_URL}/${openaiPath}`, {
  return fetch(`${url}/${openaiPath}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ?? '',
    },
    method: req.method,
    body: JSON.stringify(body),
  });
}
