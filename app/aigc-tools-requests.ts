import type {
  BaseResponse,
  CheckInInfo,
  CheckInRule,
  ExchangeRule,
  ExchangeType,
  LoginResult,
  PackageInfo,
  Prompt,
  PromptCategory,
  UserInfo,
} from './aigc-typings';
import { TOKEN_STORAGE_KEY, USER_ACCOUNT } from './constant';

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
  const _headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (!withoutCredentials) {
    _headers.Authorization = window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '';
  }

  const res = await fetch(url, {
    method,
    headers: headers ?? _headers,
    body: body ? JSON.stringify(body) : undefined,
    // credentials: withoutCredentials ? 'omit' : 'include',
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

export async function register(
  account: string,
  password: string,
  validateCode: string,
  inviteCode?: string | null,
) {
  return fetchImpl({
    url: '/api/user/regist',
    body: { account, password, validateCode, inviteCode },
    method: 'POST',
    withoutCredentials: true,
  });
}

export async function requestValidateCode(account: string): Promise<BaseResponse<any>> {
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
    url: `/api/user/get-pay-url`,
    body: {
      money: pkg.price,
      // money: 0.01,
      // name: pkg.planName,
      name: 'vip',
      notify_url: 'http://45.63.57.39:8080/v1/user/pay/notify',
      out_trade_no: randomString(),
      pid: '10010',
      return_url: `${window.location.origin}/result`,
      type: 'alipay',
      param: pkg.id,
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
    withoutCredentials: true,
  });
}

export async function getPromptList(categoryId: number): Promise<BaseResponse<Prompt[]>> {
  const body: any = {};
  if (categoryId !== 0) {
    body.categoryId = categoryId;
  }
  return fetchImpl({
    url: '/api/prompt-list',
    method: 'POST',
    body,
    withoutCredentials: true,
  });
}

export async function searchPromptList(search: string): Promise<
  BaseResponse<{
    current: number;
    hitCount: true;
    pages: number;
    records: Prompt[];
    searchCount: true;
    size: number;
    total: number;
  }>
> {
  return fetchImpl({
    url: `/api/query-prompt?query=${search}&pageIndex=1&pageSize=9999`,
    method: 'GET',
    withoutCredentials: true,
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
    withoutCredentials: true,
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
    url: `/api/pay/notify?out_trade_no=${out_trade_no}&trade_no=${trade_no}&plan_id=${plan_id}&account=${account}`,
    method: 'GET',
  });
}

export async function getInviteUrl(account: string): Promise<
  BaseResponse<{
    inviteUrl: string;
    qrCode: string;
  }>
> {
  return fetchImpl({
    url: `/api/invite/url/${account}`,
    method: 'GET',
  });
}

export async function getUserByAccount(
  account = window.localStorage.getItem(USER_ACCOUNT),
): Promise<BaseResponse<UserInfo>> {
  return fetchImpl({
    url: `/api/user/${account}`,
    method: 'GET',
  }).then((res) => {
    if (res && res.result) {
      return res;
    }
    return Promise.reject(res);
  });
}

export async function getCheckIn(
  account = window.localStorage.getItem(USER_ACCOUNT),
): Promise<BaseResponse<CheckInInfo>> {
  return fetchImpl({
    url: `/api/user-check-in/${account}`,
    method: 'GET',
  });
}

export async function getCheckInRule(): Promise<
  BaseResponse<{
    vip0: CheckInRule;
    vip1: CheckInRule;
    vip2: CheckInRule;
  }>
> {
  return fetchImpl({
    url: `/api/user-check-in/rule`,
    method: 'GET',
  });
}

export async function checkIn(
  account = window.localStorage.getItem(USER_ACCOUNT),
): Promise<BaseResponse<any>> {
  return fetchImpl({
    url: `/api/user-check-in/${account}`,
    method: 'POST',
  });
}

export async function receivePoints(
  /**
    CONTINUE_SEVEN_DAY(0,"连续七天签到奖励"),
    SEVEN_DAY(1,"累计七天奖励"),
    FOUR_TEEN_DAY(2,"累计14天奖励"),
    TWENTY_ONE(3,"累计21天奖励"),
    TWENTY_EIGHT(4,"累计28天奖励");
   */
  rewardType: 0 | 1 | 2 | 3 | 4,
  account = window.localStorage.getItem(USER_ACCOUNT),
): Promise<BaseResponse<any>> {
  return fetchImpl({
    url: `/api/receive-points`,
    method: 'POST',
    body: {
      account,
      rewardType,
    },
  });
}

export async function getPointsExchangeRule(): Promise<BaseResponse<ExchangeRule>> {
  return fetchImpl({
    url: `/api/points-exchange/rule`,
    method: 'GET',
  });
}

export async function exchangePoints({
  exchangeType,
  points,
  account = window.localStorage.getItem(USER_ACCOUNT),
}: {
  exchangeType: ExchangeType;
  points: number;
  account?: string | null;
}): Promise<BaseResponse<any>> {
  return fetchImpl({
    url: `/api/points-exchange`,
    method: 'POST',
    body: {
      account,
      exchangeType,
      points,
    },
  });
}

export async function resetPwd(
  account: string,
  newPassword: string,
  validateCode: string,
) {
  return fetchImpl({
    url: '/api/user/set-new-password',
    body: { account, newPassword, validateCode },
    method: 'POST',
    withoutCredentials: true,
  });
}

export async function requestValidateCodeInResetPwd(
  account: string,
): Promise<BaseResponse<any>> {
  return await fetchImpl({
    url: '/api/user/find-password-validate',
    body: { account },
    method: 'POST',
    withoutCredentials: true,
  });
}
