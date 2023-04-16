import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    return await fetch(`http://45.32.94.79:8080/v1/0/prompt/list`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'eyJhbGciOiJIUzI1NiJ9.eyJzZW5kZXJBY2NvdW50IjoiZGNlMWE3NDQ1M2Q0OGYxMTc2NjAzN2M0OTgwZTE2N2IiLCJ2aXNpdExpbWl0IjoxMDAwLCJvcGVuSWQiOiIiLCJ2aXBUeXBlIjoxLCJpZCI6OSwiYWNjb3VudCI6IjE4MDE5MDM3NzY3IiwicmVnaXN0RGF0ZSI6IjIwMjMtMDMtMjkgMjI6NTY6MDciLCJ2YWxpZGF0ZURhdGUiOiIyMDIzLTA0LTAxIDIyOjU2OjEwIiwic3ViIjoiMTgwMTkwMzc3NjciLCJpYXQiOjE2ODE1Mzg4MzUsImV4cCI6MTY4MTU3NDgzNX0.Qcw3pNh5cS592bPy5Dvso-MVT6BWbFGD3jUcr2o0iVQ',
      },
      method: req.method,
    });
  } catch (error) {
    console.error('[aigc-tools-server]', error);
    return new Response('出错啦', { status: 500 });
  }
}
