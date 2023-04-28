import { createParser } from 'eventsource-parser';
import { NextRequest } from 'next/server';
import { requestOpenai } from '../common';

export async function POST(req: NextRequest) {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const res = await requestOpenai(req);

    if (!res.ok) {
      return res;
    }

    const contentType = res.headers.get('Content-Type') ?? '';
    console.log('contentType: ', contentType);
    if (!contentType.includes('stream')) {
      const content = await (
        await res.text()
      ).replace(/provided:.*. You/, 'provided: ***. You');
      console.log('[Stream] error ', content);
      return '```json\n' + content + '```';
    }

    const stream = new ReadableStream({
      async start(controller) {
        function onParse(event: any) {
          if (event.type === 'event') {
            const data = event.data;
            // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta.content;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        }

        const parser = createParser(onParse);
        for await (const chunk of res.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });
    return new Response(stream);
  } catch (error) {
    console.error('[Chat Stream]', error);
    return new Response(
      ['```json\n', JSON.stringify(error, null, '  '), '\n```'].join(''),
    );
  }
}

export const config = {
  runtime: 'edge',
  regions: ['cle1', 'iad1', 'pdx1', 'sfo1'],
};
