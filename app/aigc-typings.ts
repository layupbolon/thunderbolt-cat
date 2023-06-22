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
  /**
   * 签到积分
   */
  points: number;
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
  /**
   * 1: gpt3 次数包；2：包月；3：gpt4 次数包；4：AI绘画次数
   */
  type: number;
  count: number;
  day: number;
  imageCount: number;
  createTime: number[];
  updateTime: number[];
}

export interface CheckInInfo {
  id: number;
  account: string;
  createTime: string;
  updateTime: string;
  /**
   * 星期一是否已签到
   */
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  /**
   * 是否连续 7 天
   */
  sevenDay: number;
  fourteenDay: number;
  twentyOne: number;
  twentyEight: number;
}

export interface CheckInRule {
  twentyOneDay: number;
  sevenDay: number;
  twentyEightDay: number;
  everyDay: number;
  fourteenDay: number;
  continueSeven: number;
}

export interface ExchangeRule {
  exchangePerGpt3Count: number;
  exchangePerGpt4Count: number;
  exchangePerHour: number;
}

export enum ExchangeType {
  GPT3 = 0,
  GPT4 = 1,
  HOURS = 2,
}
