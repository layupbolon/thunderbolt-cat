import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type ChatCompletionResponseMessage } from 'openai';
import { CreateToastFnReturn, useToast } from '@chakra-ui/react';
import { ControllerPool, requestChatStream, requestWithPrompt } from '../requests';
import { isMobileScreen, trimTopic } from '../utils';

import { showToast } from '../components/ui-lib';
import { TOKEN_STORAGE_KEY } from '../constant';
import { middleware } from '../../middleware';

function useGetMidjourneySelfProxyUrl(url: string) {
  return `https://images.weserv.nl?url=${url}`;
}

export type Message = ChatCompletionResponseMessage & {
  date: string;
  streaming?: boolean;
  isError?: boolean;
  id?: number;
  attr?: any;
  model?: string;
};

export function createMessage(override: Partial<Message>): Message {
  return {
    id: Date.now(),
    date: new Date().toLocaleString(),
    role: 'user',
    content: '',
    attr: {},
    ...override,
  };
}

export enum SubmitKey {
  Enter = 'Enter',
  CtrlEnter = 'Ctrl + Enter',
  ShiftEnter = 'Shift + Enter',
  AltEnter = 'Alt + Enter',
  MetaEnter = 'Meta + Enter',
}

export enum Theme {
  Auto = 'auto',
  Dark = 'dark',
  Light = 'light',
}

export interface ChatConfig {
  historyMessageCount: number; // -1 means all
  compressMessageLengthThreshold: number;
  sendBotMessages: boolean; // send bot's message or not
  submitKey: SubmitKey;
  avatar: string;
  fontSize: number;
  theme: Theme;
  tightBorder: boolean;
  sendPreviewBubble: boolean;

  disablePromptHint: boolean;

  modelConfig: {
    temperature: number;
    max_tokens: number;
    presence_penalty: number;
  };
}

export type ModelConfig = ChatConfig['modelConfig'];

export const ROLES: Message['role'][] = ['system', 'user', 'assistant'];

const ENABLE_GPT4 = true;

export const ALL_MODELS = [
  {
    name: 'gpt-4',
    available: ENABLE_GPT4,
  },
  {
    name: 'gpt-4-0314',
    available: ENABLE_GPT4,
  },
  {
    name: 'gpt-4-32k',
    available: ENABLE_GPT4,
  },
  {
    name: 'gpt-4-32k-0314',
    available: ENABLE_GPT4,
  },
  {
    name: 'gpt-3.5-turbo',
    available: true,
  },
  {
    name: 'gpt-3.5-turbo-0301',
    available: true,
  },
];

export function limitNumber(x: number, min: number, max: number, defaultValue: number) {
  if (typeof x !== 'number' || isNaN(x)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, x));
}

export function limitModel(name: string) {
  return ALL_MODELS.some((m) => m.name === name && m.available)
    ? name
    : ALL_MODELS[4].name;
}

export const ModalConfigValidator = {
  model(x: string) {
    return limitModel(x);
  },
  max_tokens(x: number) {
    return limitNumber(x, 0, 32000, 2000);
  },
  presence_penalty(x: number) {
    return limitNumber(x, -2, 2, 0);
  },
  temperature(x: number) {
    return limitNumber(x, 0, 2, 1);
  },
};

const DEFAULT_CONFIG: ChatConfig = {
  historyMessageCount: 4,
  compressMessageLengthThreshold: 1000,
  sendBotMessages: true as boolean,
  submitKey: SubmitKey.CtrlEnter as SubmitKey,
  avatar: '1f603',
  fontSize: 14,
  theme: Theme.Auto as Theme,
  tightBorder: false,
  sendPreviewBubble: true,

  disablePromptHint: false,

  modelConfig: {
    temperature: 0.3,
    max_tokens: 2000,
    presence_penalty: 0,
  },
};

export interface ChatStat {
  tokenCount: number;
  wordCount: number;
  charCount: number;
}

export const enum GPTModel {
  GPT3_5 = 'GPT3.5',
  GPT4 = 'GPT4',
}

export interface ChatSession {
  id: number;
  topic: string;
  sendMemory: boolean;
  memoryPrompt: string;
  context: Message[];
  messages: Message[];
  stat: ChatStat;
  lastUpdate: string;
  lastSummarizeIndex: number;
  clearContextIndex?: number;
  promptId?: string;
  slotFields?: Record<string, string>;
  /**
   * 此 session 是否第一次 chat；1代表是；0代表否
   */
  firstCall: number;
  gptModel: GPTModel;
  /**
   * 是否是 midjourney
   */
  midjourney?: boolean;
}

const DEFAULT_TOPIC = '新的聊天';
export const BOT_HELLO: Message = createMessage({
  role: 'assistant',
  content: '有什么可以帮你的吗',
});

function createEmptySession(selectedPrompt?: {
  promptId: string;
  promptRule: string;
  midjourney?: boolean;
}): ChatSession {
  const createDate = new Date().toLocaleString();

  return {
    id: Date.now(),
    topic: selectedPrompt?.promptRule ?? DEFAULT_TOPIC,
    sendMemory: true,
    memoryPrompt: '',
    context: [],
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: createDate,
    lastSummarizeIndex: 0,
    promptId: selectedPrompt?.promptId,
    firstCall: 1,
    gptModel: GPTModel.GPT3_5,
    midjourney: selectedPrompt?.midjourney,
  };
}

interface ChatStore {
  config: ChatConfig;
  sessions: ChatSession[];
  currentSessionIndex: number;
  clearSessions: () => void;
  removeSession: (index: number) => void;
  moveSession: (from: number, to: number) => void;
  selectSession: (index: number) => void;
  newSession: (selectedPrompt?: {
    promptId: string;
    promptRule: string;
    midjourney: boolean;
  }) => void;
  deleteSession: () => void;
  currentSession: () => ChatSession;
  onNewMessage: (message: Message) => void;
  onUserInput: (
    content: string,
    extAttr?: {
      toast: CreateToastFnReturn;
      midjourney: boolean;
    } & Record<string, any>,
  ) => Promise<void>;
  summarizeSession: () => void;
  updateStat: (message: Message) => void;
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
  updateMessage: (
    sessionIndex: number,
    messageIndex: number,
    updater: (message?: Message) => void,
  ) => void;
  resetSession: () => void;
  getMessagesWithMemory: () => Message[];
  getMemoryPrompt: () => Message;

  getConfig: () => ChatConfig;
  resetConfig: () => void;
  updateConfig: (updater: (config: ChatConfig) => void) => void;
  clearAllData: () => void;
}

function countMessages(msgs: Message[]) {
  return msgs.reduce((pre, cur) => pre + cur.content.length, 0);
}

const LOCAL_KEY = 'chat-next-web-store';

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [createEmptySession()],
      currentSessionIndex: 0,
      config: {
        ...DEFAULT_CONFIG,
      },

      clearSessions() {
        set(() => ({
          sessions: [createEmptySession()],
          currentSessionIndex: 0,
        }));
      },

      resetConfig() {
        set(() => ({ config: { ...DEFAULT_CONFIG } }));
      },

      getConfig() {
        return get().config;
      },

      updateConfig(updater) {
        const config = get().config;
        updater(config);
        set(() => ({ config }));
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },

      removeSession(index: number) {
        set((state) => {
          let nextIndex = state.currentSessionIndex;
          const sessions = state.sessions;

          if (sessions.length === 1) {
            return {
              currentSessionIndex: 0,
              sessions: [createEmptySession()],
            };
          }

          sessions.splice(index, 1);

          if (nextIndex === index) {
            nextIndex -= 1;
          }

          return {
            currentSessionIndex: nextIndex,
            sessions,
          };
        });
      },

      moveSession(from: number, to: number) {
        set((state) => {
          const { sessions, currentSessionIndex: oldIndex } = state;

          // move the session
          const newSessions = [...sessions];
          const session = newSessions[from];
          newSessions.splice(from, 1);
          newSessions.splice(to, 0, session);

          // modify current session id
          let newIndex = oldIndex === from ? to : oldIndex;
          if (oldIndex > from && oldIndex <= to) {
            newIndex -= 1;
          } else if (oldIndex < from && oldIndex >= to) {
            newIndex += 1;
          }

          return {
            currentSessionIndex: newIndex,
            sessions: newSessions,
          };
        });
      },

      newSession(selectedPrompt?: {
        promptId: string;
        promptRule: string;
        midjourney?: boolean;
      }) {
        set((state) => ({
          currentSessionIndex: 0,
          sessions: [createEmptySession(selectedPrompt)].concat(state.sessions),
        }));
      },

      deleteSession() {
        const deletedSession = get().currentSession();
        const index = get().currentSessionIndex;
        const isLastSession = get().sessions.length === 1;
        if (!isMobileScreen() || confirm('确认删除选中的对话？')) {
          get().removeSession(index);

          showToast('已删除会话', {
            text: '撤销',
            onClick() {
              set((state) => ({
                sessions: state.sessions
                  .slice(0, index)
                  .concat([deletedSession])
                  .concat(state.sessions.slice(index + Number(isLastSession))),
              }));
            },
          });
        }
      },

      currentSession() {
        let index: number = get().currentSessionIndex;
        const sessions = get().sessions;

        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }

        const session = sessions[index];

        return session;
      },

      onNewMessage(message) {
        get().updateCurrentSession((session) => {
          session.lastUpdate = new Date().toLocaleString();
        });
        get().updateStat(message);
        get().summarizeSession();
      },

      async onUserInput(
        content,
        extAttr?: {
          toast: CreateToastFnReturn;
          midjourney: boolean;
        } & Record<string, any>,
      ) {
        if (
          extAttr?.mjImageMode &&
          (extAttr?.useImages?.length ?? 0) > 0 &&
          extAttr.mjImageMode !== 'IMAGINE'
        ) {
          if (extAttr.mjImageMode === 'BLEND' && extAttr.useImages.length < 2) {
            alert('混图模式下至少需要 2 张图片');
            return new Promise((resolve: any, reject) => {
              resolve(false);
            });
          }
          content = extAttr?.mjImageMode;
          extAttr.useImages.forEach((img: any, index: number) => {
            content += `::[${index + 1}]${img.filename}`;
          });
        }

        const userMessage: Message = createMessage({
          role: 'user',
          content,
        });

        const botMessage: Message = createMessage({
          role: 'assistant',
          streaming: true,
          id: userMessage.id! + 1,
        });

        // get recent messages
        const recentMessages = get().getMessagesWithMemory();
        const sendMessages = recentMessages.concat(userMessage);
        const sessionIndex = get().currentSessionIndex;
        const messageIndex = get().currentSession().messages.length + 1;

        // save user's and bot's message
        get().updateCurrentSession((session) => {
          session.messages.push(userMessage);
          session.messages.push(botMessage);
        });

        // make request
        console.log('[User Input] ', sendMessages);

        if (extAttr?.midjourney) {
          botMessage.model = 'midjourney';
          const startFn = async () => {
            const prompt = content.trim();
            let action: string = 'IMAGINE';
            const firstSplitIndex = prompt.indexOf('::');
            if (firstSplitIndex > 0) {
              action = prompt.substring(0, firstSplitIndex);
            }
            if (
              ![
                'UPSCALE',
                'VARIATION',
                'IMAGINE',
                'DESCRIBE',
                'BLEND',
                'REROLL',
              ].includes(action)
            ) {
              botMessage.content = '任务提交失败：未知的任务类型';
              botMessage.streaming = false;
              return;
            }
            botMessage.attr.action = action;
            let actionIndex: any = null;
            let actionUseTaskId: any = null;
            if (action === 'VARIATION' || action == 'UPSCALE' || action == 'REROLL') {
              actionIndex = parseInt(
                prompt.substring(firstSplitIndex + 2, firstSplitIndex + 3),
              );
              actionUseTaskId = prompt.substring(firstSplitIndex + 5);
            }
            try {
              let res = null;
              const reqFn = (path: string, method: string, body?: any) => {
                return fetch('/api/midjourney/mj/' + path, {
                  method: method,
                  headers: {
                    'Content-Type': 'application/json',
                    token: window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '',
                  },
                  body,
                });
              };
              switch (action) {
                case 'IMAGINE': {
                  res = await reqFn(
                    'submit/imagine',
                    'POST',
                    JSON.stringify({
                      prompt: prompt,
                      base64: extAttr?.useImages?.[0]?.base64 ?? null,
                    }),
                  );
                  break;
                }
                case 'DESCRIBE': {
                  res = await reqFn(
                    'submit/describe',
                    'POST',
                    JSON.stringify({
                      base64: extAttr?.useImages[0].base64,
                    }),
                  );
                  break;
                }
                case 'BLEND': {
                  res = await reqFn(
                    'submit/blend',
                    'POST',
                    JSON.stringify({
                      base64Array: [
                        extAttr?.useImages[0].base64,
                        extAttr?.useImages[1].base64,
                      ],
                    }),
                  );
                  break;
                }
                case 'UPSCALE':
                case 'VARIATION':
                case 'REROLL': {
                  res = await reqFn(
                    'submit/change',
                    'POST',
                    JSON.stringify({
                      action: action,
                      index: actionIndex,
                      taskId: actionUseTaskId,
                    }),
                  );
                  break;
                }
                default:
              }
              if (res == null) {
                botMessage.content = `任务提交失败：不支持的任务类型 -> ${action}`;
                botMessage.streaming = false;
                return;
              }

              if (res.status === 401 || res.status === 403) {
                window.location.href = '/login';
                throw new Error('现在是未授权状态，请先登录。');
              } else if (res.status === 402) {
                extAttr?.toast({
                  title: '会员计划已用完！请升级会员计划！',
                  status: 'warning',
                  duration: 9000,
                  isClosable: true,
                });
                throw new Error('会员计划已用完！请升级会员计划！');
              }
              if (!res.ok) {
                const text = await res.text();
                throw new Error(`\n状态码：${res.status}\n响应体：${text || '无'}`);
              }
              const resJson = await res.json();
              if (
                res.status < 200 ||
                res.status >= 300 ||
                (resJson.code != 1 && resJson.code != 22)
              ) {
                botMessage.content = `任务提交失败：${
                  resJson?.msg || resJson?.error || resJson?.description || '未知错误'
                }`;
              } else {
                const taskId: string = resJson.result;
                const prefixContent = `**画面描述:** ${prompt}\n**任务ID:** ${taskId}\n`;
                botMessage.content =
                  prefixContent +
                    `[${new Date().toLocaleString()}] - 任务提交成功: ` +
                    resJson?.description || '请稍等片刻';
                botMessage.attr.taskId = taskId;
                const fetchStatus = (taskId: string) => {
                  setTimeout(async () => {
                    const statusRes = await fetch(
                      `/api/midjourney/mj/task/${taskId}/fetch`,
                      {
                        method: 'GET',
                        headers: {
                          'Content-Type': 'application/json',
                          token: window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? '',
                        },
                      },
                    );
                    const statusResJson = await statusRes.json();
                    if (statusRes.status < 200 || statusRes.status >= 300) {
                      botMessage.content = `任务状态获取失败 : ${
                        resJson?.error || resJson?.description || '未知原因'
                      }`;
                    } else {
                      let isFinished = false;
                      let content;
                      switch (statusResJson?.status) {
                        case 'SUCCESS':
                          content = statusResJson.imageUrl;
                          isFinished = true;
                          if (statusResJson.imageUrl) {
                            let imgUrl = useGetMidjourneySelfProxyUrl(
                              statusResJson.imageUrl,
                            );
                            // let imgUrl = statusResJson.imageUrl;
                            botMessage.attr.imgUrl = imgUrl;
                            botMessage.content =
                              prefixContent + `[![${taskId}](${imgUrl})](${imgUrl})`;
                          }
                          if (action === 'DESCRIBE' && statusResJson.prompt) {
                            botMessage.content += `\n${statusResJson.prompt}`;
                          }
                          break;
                        case 'FAILURE':
                          content = statusResJson.failReason || '未知原因';
                          isFinished = true;
                          botMessage.content =
                            prefixContent +
                            `**任务状态:** [${new Date().toLocaleString()}] - ${content}`;
                          break;
                        case 'NOT_START':
                          content = '任务尚未开始';
                          break;
                        case 'IN_PROGRESS':
                          content = `任务正在运行${
                            statusResJson.progress
                              ? `，当前进度：${statusResJson.progress}`
                              : ''
                          }`;
                          break;
                        case 'SUBMITTED':
                          content = '任务已提交至服务器';
                          break;
                        default:
                          content = statusResJson.status;
                      }
                      botMessage.attr.status = statusResJson.status;
                      if (isFinished) {
                        botMessage.attr.finished = true;
                      } else {
                        botMessage.content =
                          prefixContent +
                          `**任务状态:** [${new Date().toLocaleString()}] - ${content}`;
                        if (
                          statusResJson.status === 'IN_PROGRESS' &&
                          statusResJson.imageUrl
                        ) {
                          let imgUrl = useGetMidjourneySelfProxyUrl(
                            statusResJson.imageUrl,
                          );
                          // let imgUrl = statusResJson.imageUrl;
                          botMessage.attr.imgUrl = imgUrl;
                          botMessage.content += `\n[![${taskId}](${imgUrl})](${imgUrl})`;
                        }
                        fetchStatus(taskId);
                      }
                      set(() => ({}));
                      if (isFinished) {
                        extAttr?.setAutoScroll(true);
                      }
                    }
                  }, 3000);
                };
                fetchStatus(taskId);
              }
            } catch (e: any) {
              botMessage.content = `任务提交失败：${
                e?.error || e?.message || '未知错误'
              }`;
            } finally {
              ControllerPool.remove(sessionIndex, botMessage.id ?? messageIndex);
              botMessage.streaming = false;
            }
          };
          await startFn();
          get().onNewMessage(botMessage);
          set(() => ({}));
          extAttr?.setAutoScroll(true);
        } else {
          const session = get().currentSession();

          requestChatStream(sendMessages, {
            gptModal: session.gptModel,
            promptId: session.promptId,
            promptParams: session.slotFields,
            firstCall: session.firstCall,
            onMessage(content, done) {
              // stream response
              if (done) {
                botMessage.streaming = false;
                if (content) {
                  botMessage.content = content;
                  get().onNewMessage(botMessage);
                }
                ControllerPool.remove(sessionIndex, botMessage.id ?? messageIndex);
                set(() => ({}));
              } else {
                botMessage.streaming = true;
                if (content) {
                  botMessage.content = content;
                }
                set(() => ({}));
              }
            },
            onError(error, statusCode) {
              if (statusCode === 401 || statusCode === 403) {
                window.location.href = '/login';
                botMessage.content = '现在是未授权状态，请先登录。';
              } else if (statusCode === 402) {
                botMessage.content = '会员计划已用完！请升级会员计划！';
                extAttr?.toast({
                  title: '会员计划已用完！请升级会员计划！',
                  status: 'warning',
                  duration: 9000,
                  isClosable: true,
                });
              } else {
                botMessage.content += '\n\n' + '出错了，稍后重试吧';
              }
              botMessage.streaming = false;
              userMessage.isError = true;
              botMessage.isError = true;
              set(() => ({}));
              ControllerPool.remove(sessionIndex, botMessage.id ?? messageIndex);
            },
            onController(controller) {
              // collect controller for stop/retry
              ControllerPool.addController(
                sessionIndex,
                botMessage.id ?? messageIndex,
                controller,
              );
            },
            filterBot: !get().config.sendBotMessages,
            modelConfig: get().config.modelConfig,
          }).finally(() => {
            get().updateCurrentSession((session) => {
              session.firstCall = 0;
            });
          });
        }
      },

      getMemoryPrompt() {
        return {
          role: 'system',
          content:
            '这是 ai 和用户的历史聊天总结作为前情提要：' +
            get().currentSession().memoryPrompt,
          date: '',
        } as Message;
      },

      getMessagesWithMemory() {
        const session = get().currentSession();

        const clearedContextMessages = session.messages.slice(
          session.clearContextIndex ?? 0,
        );
        const messages = clearedContextMessages.filter((msg) => !msg.isError);
        const n = messages.length;

        const context = session.context.slice();

        if (
          session.sendMemory &&
          session.memoryPrompt &&
          session.memoryPrompt.length > 0
        ) {
          const memoryPrompt = get().getMemoryPrompt();
          context.push(memoryPrompt);
        }

        const recentMessages = context.concat(
          messages.slice(-4), // 取最新的10条消息
        );

        return recentMessages;
      },

      updateMessage(
        sessionIndex: number,
        messageIndex: number,
        updater: (message?: Message) => void,
      ) {
        const sessions = get().sessions;
        const session = sessions.at(sessionIndex);
        const messages = session?.messages;
        updater(messages?.at(messageIndex));
        set(() => ({ sessions }));
      },

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = [];
          session.memoryPrompt = '';
        });
      },

      summarizeSession() {
        const session = get().currentSession();

        if (session.midjourney) {
          return;
        }

        // should summarize topic after chating more than 50 words
        const SUMMARIZE_MIN_LEN = 50;
        if (
          session.topic === DEFAULT_TOPIC &&
          countMessages(session.messages) >= SUMMARIZE_MIN_LEN
        ) {
          // requestWithPrompt(session.messages, Locale.Store.Prompt.Topic).then((res) => {
          //   get().updateCurrentSession(
          //     (session) => (session.topic = res ? trimTopic(res) : DEFAULT_TOPIC),
          //   );
          // });
        }

        const config = get().config;
        let toBeSummarizedMsgs = session.messages.slice(session.lastSummarizeIndex);

        const historyMsgLength = countMessages(toBeSummarizedMsgs);

        if (historyMsgLength > get().config?.modelConfig?.max_tokens ?? 2048) {
          const n = toBeSummarizedMsgs.length;
          toBeSummarizedMsgs = toBeSummarizedMsgs.slice(
            Math.max(0, n - config.historyMessageCount),
          );
        }

        // add memory prompt
        toBeSummarizedMsgs.unshift(get().getMemoryPrompt());

        const lastSummarizeIndex = session.messages.length;

        console.log(
          '[Chat History] ',
          toBeSummarizedMsgs,
          historyMsgLength,
          config.compressMessageLengthThreshold,
        );

        if (historyMsgLength > config.compressMessageLengthThreshold) {
          requestChatStream(
            toBeSummarizedMsgs.concat({
              role: 'system',
              content:
                '简要总结一下你和用户的对话，用作后续的上下文提示 prompt，控制在 100 字以内',
              date: '',
            }),
            {
              gptModal: GPTModel.GPT3_5,
              firstCall: 0,
              filterBot: false,
              onMessage(message, done) {
                session.memoryPrompt = message;
                if (done) {
                  console.log('[Memory] ', session.memoryPrompt);
                  session.lastSummarizeIndex = lastSummarizeIndex;
                }
              },
              onError(error, statusCode) {
                if (statusCode === 401 || statusCode === 403) {
                  window.location.href = '/login';
                }
                console.error('[Summarize] ', error);
              },
            },
          );
        }
      },

      updateStat(message) {
        get().updateCurrentSession((session) => {
          session.stat.charCount += message.content.length;
          // TODO: should update chat count and word count
        });
      },

      updateCurrentSession(updater) {
        const sessions = get().sessions;
        const index = get().currentSessionIndex;
        updater(sessions[index]);
        set(() => ({ sessions }));
      },

      clearAllData() {
        if (confirm('确认清除所有聊天、设置数据？')) {
          localStorage.clear();
          location.reload();
        }
      },
    }),
    {
      name: LOCAL_KEY,
      version: 1.2,
      migrate(persistedState, version) {
        const state = persistedState as ChatStore;

        if (version === 1) {
          state.sessions.forEach((s) => (s.context = []));
        }

        if (version < 1.2) {
          state.sessions.forEach((s) => (s.sendMemory = true));
        }

        return state;
      },
    },
  ),
);
