import type { ChatRequest, ChatResponse } from './api/openai/typing';
import { Message, ModelConfig, useAccessStore, useChatStore } from './store';

const TIME_OUT_MS = 60000;

const makeRequestParam = (
  messages: Message[],
  options?: {
    filterBot?: boolean;
    stream?: boolean;
  },
): ChatRequest & { promptId?: string; promptParams?: Record<string, string> } => {
  let sendMessages = messages.map((v) => ({
    role: v.role,
    content: v.content,
  }));

  if (options?.filterBot) {
    sendMessages = sendMessages.filter((m) => m.role !== 'assistant');
  }

  const modelConfig = { ...useChatStore.getState().config.modelConfig };

  // @yidadaa: wont send max_tokens, because it is nonsense for Muggles
  // @ts-expect-error
  delete modelConfig.max_tokens;

  return {
    messages: sendMessages,
    stream: options?.stream,
    ...modelConfig,
  };
};

function getHeaders() {
  const accessStore = useAccessStore.getState();
  let headers: Record<string, string> = {};

  if (accessStore.enabledAccessControl()) {
    headers['access-code'] = accessStore.accessCode;
  }

  if (accessStore.token && accessStore.token.length > 0) {
    headers['token'] = accessStore.token;
  }

  return headers;
}

export function requestOpenaiClient(path: string) {
  return (body: any, method = 'POST') =>
    fetch('/api/openai?_vercel_no_cache=1', {
      method,
      headers: {
        'Content-Type': 'application/json',
        path,
        ...getHeaders(),
      },
      body: body && JSON.stringify(body),
    });
}

export async function requestChat(messages: Message[]) {
  const req: ChatRequest = makeRequestParam(messages, { filterBot: true });

  const res = await requestOpenaiClient('v1/chat/completions')(req);

  try {
    const response = (await res.json()) as ChatResponse;
    return response;
  } catch (error) {
    console.error('[Request Chat] ', error, res.body);
  }
}

export async function requestChatStream(
  messages: Message[],
  options?: {
    filterBot?: boolean;
    modelConfig?: ModelConfig;
    onMessage: (message: string, done: boolean) => void;
    onError: (error: Error, statusCode?: number) => void;
    onController?: (controller: AbortController) => void;
    promptId?: string;
    promptParams?: Record<string, string>;
  },
) {
  const req = makeRequestParam(messages, {
    stream: true,
    filterBot: options?.filterBot,
  });

  if (req.messages.length < 4) {
    req.promptId = options?.promptId;
    req.promptParams = options?.promptParams;
  }

  console.log('[Request] ', req);

  const controller = new AbortController();
  const reqTimeoutId = setTimeout(() => controller.abort(), TIME_OUT_MS);

  try {
    const res = await fetch('/api/aigc-chat-stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        path: 'v1/chat/completions/stream',
        // ...getHeaders(),
      },
      body: JSON.stringify(req),
      signal: controller.signal,
      credentials: 'include',
    });
    clearTimeout(reqTimeoutId);

    let responseText = '';

    const finish = () => {
      options?.onMessage(responseText, true);
      controller.abort();
    };

    if (res.ok) {
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      options?.onController?.(controller);

      while (true) {
        const resTimeoutId = setTimeout(() => finish(), TIME_OUT_MS);
        const content = await reader?.read();
        clearTimeout(resTimeoutId);

        if (!content || !content.value) {
          break;
        }

        const text = decoder.decode(content.value, { stream: true });
        responseText += text;

        const done = content.done;
        options?.onMessage(responseText, false);

        if (done) {
          break;
        }
      }

      finish();
    } else if (res.status === 401 || res.status === 403) {
      console.error('Unauthorized');
      options?.onError(new Error('Unauthorized'), res.status);
    } else {
      console.error('Stream Error', res.body);
      options?.onError(new Error('Stream Error'), res.status);
    }
  } catch (err) {
    console.error('NetWork Error', err);
    options?.onError(err as Error);
  }
}

export async function requestWithPrompt(messages: Message[], prompt: string) {
  messages = messages.concat([
    {
      role: 'user',
      content: prompt,
      date: new Date().toLocaleString(),
    },
  ]);

  const res = await requestChat(messages);

  return res?.choices?.at(0)?.message?.content ?? '';
}

// To store message streaming controller
export const ControllerPool = {
  controllers: {} as Record<string, AbortController>,

  addController(sessionIndex: number, messageId: number, controller: AbortController) {
    const key = this.key(sessionIndex, messageId);
    this.controllers[key] = controller;
    return key;
  },

  stop(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    const controller = this.controllers[key];
    controller?.abort();
  },

  stopAll() {
    Object.values(this.controllers).forEach((v) => v.abort());
  },

  hasPending() {
    return Object.values(this.controllers).length > 0;
  },

  remove(sessionIndex: number, messageId: number) {
    const key = this.key(sessionIndex, messageId);
    delete this.controllers[key];
  },

  key(sessionIndex: number, messageIndex: number) {
    return `${sessionIndex},${messageIndex}`;
  },
};
