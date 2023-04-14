import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, { params }: any) {
  try {
    const res = await fetch(`http://45.32.94.79:8080/v1/prompt/${params.slug}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: req.method,
      body: req.body,
    });

    return new Response(res.body);
  } catch (error) {
    console.error('[aigc-tools-server]', error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`http://45.32.94.79:8080/v1/prompt/category/list`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: req.method,
    });

    return new Response(res.body);
  } catch (error) {
    console.error('[aigc-tools-server]', error);
  }
}
