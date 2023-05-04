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
  /**
   * GPT3 已使用次数
   */
  visitCount: number;
  /**
   * GPT3 使用次数上限
   */
  visitLimit: number;
  /**
   * 0: 非会员；1：次数会员；2：包月会员
   */
  vipType: number;
  /**
   * GPT4 已使用次数
   */
  visit4Count: number;
  /**
   * GPT4 使用次数上限
   */
  visit4Limit: number;
  /**
   * AI绘图已使用次数
   */
  imageCount: number;
  /**
   * AI绘图使用次数上限
   */
  imageLimit: number;
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
  title: string;
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
