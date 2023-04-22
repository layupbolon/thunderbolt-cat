export interface BaseResponse<T> {
  code: string;
  message: string;
  result: T;
}

export interface UserInfo {
  id: number;
  nickName: string;
  openId: string;
  skey: string;
  account: string;
  password: string;
  sessionKey: string;
  lastVisitTime: string;
  city: string;
  province: string;
  country: string;
  avatarUrl: string;
  gender: number;
  registDate: number[];
  dateOfBirth: number[];
  createTime: string;
  updateTime: string;
  senderAccount: string;
  validateDate: number[];
  state: number;
  visitCount: number;
  visitLimit: number;
  vipType: number;
}

export interface LoginResult {
  user: UserInfo;
  token: string;
}

export interface PromptCategory {
  id: number;
  category: string;
  description: string;
  createTime: number[];
  updateTime: number[];
  color?: string;
}

export interface Prompt {
  act: string;
  categoryId: number;
  createTime: string;
  id: number;
  prompt: string;
  updateTime: string;
  userId: string;
}

export interface PackageInfo {
  id: number;
  planName: string;
  planDescription: string;
  price: number;
  type: number;
  count: number;
  day: number;
  createTime: number[];
  updateTime: number[];
}
