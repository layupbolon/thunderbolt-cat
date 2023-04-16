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
  registDate: string;
  dateOfBirth: null;
  createTime: string;
  updateTime: string;
  senderAccount: string;
  validateDate: string;
  state: number;
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
