import type {
  BaseResponse,
  LoginResult,
  PackageInfo,
  Prompt,
  PromptCategory,
  UserInfo,
} from './aigc-typings';

async function fetchImpl({
  body,
  url,
  method,
  headers,
  withoutCredentials,
}: {
  url: string;
  body?: Record<string, unknown>;
  method: string;
  headers?: HeadersInit;
  withoutCredentials?: boolean;
}) {
  const res = await fetch(url, {
    method,
    headers: headers ?? {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: withoutCredentials ? 'omit' : 'include',
  });

  const innerResponse = (await res.json()) as any;
  if (res.status !== 200) {
    if (innerResponse.status === 403) {
      window.location.href = '/login';
    }
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
    withoutCredentials: true,
  });
}

export async function register(account: string, password: string, validateCode: string) {
  return fetchImpl({
    url: '/api/user/regist',
    body: { account, password, validateCode },
    method: 'POST',
    withoutCredentials: true,
  });
}

export async function requestValidateCode(account: string) {
  return await fetchImpl({
    url: '/api/user/validate',
    body: { account },
    method: 'POST',
    withoutCredentials: true,
  });
}

function randomString(len?: number) {
  len = len || 4;
  const timestamp = new Date().getTime();

  const $chars = '1234567890';
  const maxPos = $chars.length;
  let randomStr = '';
  for (let i = 0; i < len; i++) {
    randomStr += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return randomStr + timestamp;
}

export async function getPayUrl(pkg: PackageInfo): Promise<BaseResponse<string>> {
  return fetchImpl({
    url: '/api/user/get-pay-url',
    body: {
      money: pkg.price,
      // money: 0.01,
      name: pkg.planName,
      notify_url: 'http://45.32.94.79:8080/v1/user/pay/notify',
      out_trade_no: randomString(),
      pid: '1588',
      return_url: `${window.location.origin}/result`,
      type: 'alipay',
    },
    method: 'POST',
  });
}

export async function getUserByToken(): Promise<BaseResponse<UserInfo>> {
  return fetchImpl({
    url: '/api/user/get-user-by-token',
    method: 'GET',
    headers: {
      'Content-Type': 'text/plain',
    },
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
    method: 'POST',
    body: {
      categoryId,
    },
  });
}

export async function auth({
  account,
  password,
}: {
  account: string;
  password: string;
}): Promise<{ jwt: string }> {
  return fetchImpl({
    url: '/api/authenticate',
    method: 'POST',
    body: { account, password },
  });
}

/**
 * 获取套餐包列表
 */
export async function getPackageList(): Promise<BaseResponse<PackageInfo[]>> {
  return fetchImpl({
    url: '/api/package-list',
    method: 'GET',
  });
}

export async function payNotify({
  out_trade_no,
  trade_no,
  plan_id,
  account,
}: {
  out_trade_no: string;
  trade_no: string;
  plan_id: string;
  account: string;
}) {
  return fetchImpl({
    url: `/api/user/pay/notify?out_trade_no=${out_trade_no}&trade_no=${trade_no}&plan_id=${plan_id}&account=${account}`,
    method: 'GET',
  });
}
