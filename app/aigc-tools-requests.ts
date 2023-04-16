import type { BaseResponse, LoginResult, Prompt, PromptCategory } from './aigc-typings';
import { TOKEN_STORAGE_KEY } from './constant';

async function fetchImpl({
  body,
  url,
  method,
}: {
  url: string;
  body?: Record<string, unknown>;
  method: string;
}) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const innerResponse = (await res.json()) as any;
  if (res.status !== 200) {
    // if (innerResponse.status === 403) {
    //   window.location.href = '/login';
    // }
    return Promise.reject(innerResponse);
  }
  return Promise.resolve(innerResponse);
}

export async function login(
  account: string,
  password: string,
): Promise<BaseResponse<LoginResult>> {
  return fetchImpl({
    url: '/api/user/login',
    body: { account, password },
    method: 'POST',
  });
}

export async function register(account: string, password: string, validateCode: string) {
  return fetchImpl({
    url: '/api/user/regist',
    body: { account, password, validateCode },
    method: 'POST',
  });
}

export async function requestValidateCode(account: string) {
  return fetchImpl({ url: '/api/user/validate', body: { account }, method: 'POST' });
}

// TODO
export async function getPayUrl() {
  return fetchImpl({
    url: '/api/user/get-pay-url',
    body: {
      money: '00.01',
      name: 'vip-test',
      notify_url: 'http://45.32.94.79:8080/notify',
      out_trade_no: '11223344',
      pid: '1111',
      return_url: 'http://aiconnectworld.org/pay',
      type: 'alipay',
    },
    method: 'POST',
  });
}

export async function getUserByToken(token: string): Promise<{ jwt: string }> {
  return fetchImpl({
    url: '/api/user/get-user-by-token',
    body: { token },
    method: 'POST',
  });
}

export async function getPromptCategoryList(): Promise<BaseResponse<PromptCategory[]>> {
  return fetchImpl({
    url: '/api/prompt-category-list',
    method: 'GET',
  });
}

export async function getPromptList(categoryId: number): Promise<BaseResponse<Prompt[]>> {
  return fetchImpl({
    url: '/api/prompt-list',
    method: 'GET',
    body: {
      categoryId,
    },
  });
}

export async function auth({ account, password }: { account: string; password: string }) {
  return fetchImpl({
    url: '/api/auth',
    method: 'POST',
    body: { account, password },
  });
}
