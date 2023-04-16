import { NextRequest } from 'next/server';

const OPENAI_URL = 'api.openai.com';
const DEFAULT_PROTOCOL = 'https';
const PROTOCOL = process.env.PROTOCOL ?? DEFAULT_PROTOCOL;
const BASE_URL = process.env.BASE_URL ?? OPENAI_URL;

export async function requestOpenai(req: NextRequest) {
  const apiKey = req.headers.get('token');
  const openaiPath = req.headers.get('path');

  console.log('[Proxy] ', openaiPath);

  return fetch(`${PROTOCOL}://${BASE_URL}/${openaiPath}`, {
    // return fetch(`http://45.32.94.79:8080/${openaiPath}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer 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`,
      // Authorization:
      //   'eyJhbGciOiJIUzI1NiJ9.eyJzZW5kZXJBY2NvdW50IjoiZGNlMWE3NDQ1M2Q0OGYxMTc2NjAzN2M0OTgwZTE2N2IiLCJ2aXNpdExpbWl0IjoxMDAwLCJvcGVuSWQiOiIiLCJ2aXBUeXBlIjoxLCJpZCI6OSwiYWNjb3VudCI6IjE4MDE5MDM3NzY3IiwicmVnaXN0RGF0ZSI6IjIwMjMtMDMtMjkgMjI6NTY6MDciLCJ2YWxpZGF0ZURhdGUiOiIyMDIzLTA0LTAxIDIyOjU2OjEwIiwic3ViIjoiMTgwMTkwMzc3NjciLCJpYXQiOjE2ODE2MTE2NTMsImV4cCI6MTY4MTY0NzY1M30.Uxi50vzpT8nu4OO67fqQ_QgdMRm9VWGudlYTAMn-OLE',
    },
    method: req.method,
    body: req.body,
  });
}
