import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const res = await fetch(`http://45.32.94.79:8080/authenticate`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: req.method,
      body: req.body,
    });
    console.log('res: ', res.body);

    return new Response(res.body);
  } catch (error) {
    console.error('[aigc-tools-server]', error);
  }
}
