import type { BaseResponse, LoginResult, PromptCategory } from './aigc-typings';
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
      // Authorization: window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '',
      Authorization:
        'eyJhbGciOiJIUzI1NiJ9.eyJzZW5kZXJBY2NvdW50IjoiZGNlMWE3NDQ1M2Q0OGYxMTc2NjAzN2M0OTgwZTE2N2IiLCJ2aXNpdExpbWl0IjoxMDAwLCJvcGVuSWQiOiIiLCJ2aXBUeXBlIjoxLCJpZCI6OSwiYWNjb3VudCI6IjE4MDE5MDM3NzY3IiwicmVnaXN0RGF0ZSI6IjIwMjMtMDMtMjkgMjI6NTY6MDciLCJ2YWxpZGF0ZURhdGUiOiIyMDIzLTA0LTAxIDIyOjU2OjEwIiwic3ViIjoiMTgwMTkwMzc3NjciLCJpYXQiOjE2ODE0MzU3MjcsImV4cCI6MTY4MTQ3MTcyN30.UQgApeRAyP7p-MTvIN6SWIigbxB2Y-ubSg72GgTJyNQ',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const innerResponse = (await res.json()) as any;
  console.log('innerResponse: ', innerResponse);
  if (innerResponse.status !== 200) {
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

export async function getPromptList(): Promise<BaseResponse<PromptCategory[]>> {
  return fetchImpl({
    url: '/api/prompt/suibian',
    method: 'GET',
  });
}

export async function auth({ account, password }: { account: string; password: string }) {
  return fetchImpl({
    url: '/api/auth',
    method: 'POST',
    body: { account, password },
  });
}
