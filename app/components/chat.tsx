import { memo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Message, useChatStore, ROLES, createMessage } from '../store';
import {
  copyToClipboard,
  downloadAs,
  getEmojiUrl,
  isMobileScreen,
  selectOrCopy,
  autoGrowTextArea,
} from '../utils';

import GPT3Tokenizer from 'gpt3-tokenizer';

import dynamic from 'next/dynamic';
import { useDebouncedCallback } from 'use-debounce';
import { useToast } from '@chakra-ui/react';

import { Prompt } from '../store/prompt';

import { IconButton } from './button';
import styles from './home.module.scss';
import chatStyle from './chat.module.scss';

import { Input, Modal, showModal } from './ui-lib';

import DeleteIcon from '../icons/delete.svg';
import AddIcon from '../icons/add.svg';
import LogoLoading from '../icons/logo_loading.svg';
import BrainIcon from '../icons/brain.svg';
import CopyIcon from '../icons/copy.svg';
import DownloadIcon from '../icons/download.svg';
import ExportIcon from '../icons/export.svg';
import ReturnIcon from '../icons/return.svg';
import SendWhiteIcon from '../icons/send-white.svg';
import ContinueIcon from '../icons/continue.svg';
import LoadingIcon from '../icons/three-dots.svg';
import { ControllerPool } from '../requests';

import UploadIcon from '../icons/upload.svg';
import { LAST_INPUT_KEY } from '../constant';
import StopIcon from '../icons/pause.svg';
import BottomIcon from '../icons/bottom.svg';
import PromptIcon from '../icons/prompt.svg';
import { IframeShare } from './mj-prompt-builder';
import Guide from 'byte-guide';

const Markdown = dynamic(async () => memo((await import('./markdown')).Markdown), {
  loading: () => <LoadingIcon />,
});

const Emoji = dynamic(async () => (await import('emoji-picker-react')).Emoji, {
  loading: () => <LoadingIcon />,
});

export function Avatar(props: { role: Message['role'] }) {
  const config = useChatStore((state) => state.config);

  if (props.role !== 'user') {
    return <LogoLoading className={styles['user-avtar']} />;
  }

  return (
    <div className={styles['user-avtar']}>
      <Emoji unified={config.avatar} size={18} getEmojiUrl={getEmojiUrl} />
    </div>
  );
}

function exportMessages(messages: Message[], topic: string) {
  const mdText =
    `# ${topic}\n\n` +
    messages
      .map((m) => {
        return m.role === 'user'
          ? `## 来自你的消息:\n${m.content}`
          : `## 来自 ChatGPT 的消息:\n${m.content.trim()}`;
      })
      .join('\n\n');
  const filename = `${topic}.md`;

  showModal({
    title: '导出聊天记录为 Markdown',
    children: (
      <div className="markdown-body">
        <pre className={styles['export-content']}>{mdText}</pre>
      </div>
    ),
    actions: [
      <IconButton
        key="copy"
        icon={<CopyIcon />}
        bordered
        text="全部复制"
        onClick={() => copyToClipboard(mdText)}
      />,
      <IconButton
        key="download"
        icon={<DownloadIcon />}
        bordered
        text="下载文件"
        onClick={() => downloadAs(mdText, filename)}
      />,
    ],
  });
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.context;

  const addContextPrompt = (prompt: Message) => {
    chatStore.updateCurrentSession((session) => {
      session.context.push(prompt);
    });
  };

  const removeContextPrompt = (i: number) => {
    chatStore.updateCurrentSession((session) => {
      session.context.splice(i, 1);
    });
  };

  const updateContextPrompt = (i: number, prompt: Message) => {
    chatStore.updateCurrentSession((session) => {
      session.context[i] = prompt;
    });
  };

  return (
    <div className={chatStyle['prompt-toast']} key="prompt-toast">
      {props.showToast && (
        <div
          className={chatStyle['prompt-toast-inner'] + ' clickable'}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={chatStyle['prompt-toast-content']}>
            {`已设置 ${context.length} 条前置上下文`}
          </span>
        </div>
      )}
      {props.showModal && (
        <div className="modal-mask">
          <Modal
            title="前置上下文和历史记忆"
            onClose={() => props.setShowModal(false)}
            actions={[
              <IconButton
                key="reset"
                icon={<CopyIcon />}
                bordered
                text="重置对话"
                onClick={() =>
                  confirm('重置后将清空当前对话记录以及历史记忆，确认重置？') &&
                  chatStore.resetSession()
                }
              />,
              <IconButton
                key="copy"
                icon={<CopyIcon />}
                bordered
                text={'复制记忆'}
                onClick={() => copyToClipboard(session.memoryPrompt)}
              />,
            ]}
          >
            <>
              <div className={chatStyle['context-prompt']}>
                {context.map((c, i) => (
                  <div className={chatStyle['context-prompt-row']} key={i}>
                    <select
                      value={c.role}
                      className={chatStyle['context-role']}
                      onChange={(e) =>
                        updateContextPrompt(i, {
                          ...c,
                          role: e.target.value as any,
                        })
                      }
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <Input
                      value={c.content}
                      type="text"
                      className={chatStyle['context-content']}
                      rows={1}
                      onInput={(e) =>
                        updateContextPrompt(i, {
                          ...c,
                          content: e.currentTarget.value as any,
                        })
                      }
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      className={chatStyle['context-delete-button']}
                      onClick={() => removeContextPrompt(i)}
                      bordered
                    />
                  </div>
                ))}

                <div className={chatStyle['context-prompt-row']}>
                  <IconButton
                    icon={<AddIcon />}
                    text={'新增一条'}
                    bordered
                    className={chatStyle['context-prompt-button']}
                    onClick={() =>
                      addContextPrompt({
                        role: 'system',
                        content: '',
                        date: '',
                      })
                    }
                  />
                </div>
              </div>
              <div className={chatStyle['memory-prompt']}>
                <div className={chatStyle['memory-prompt-title']}>
                  <span>
                    历史记忆 ({session.lastSummarizeIndex} of {session.messages.length})
                  </span>

                  <label className={chatStyle['memory-prompt-action']}>
                    发送记忆
                    <input
                      type="checkbox"
                      checked={session.sendMemory}
                      onChange={() =>
                        chatStore.updateCurrentSession(
                          (session) => (session.sendMemory = !session.sendMemory),
                        )
                      }
                    ></input>
                  </label>
                </div>
                <div className={chatStyle['memory-prompt-content']}>
                  {session.memoryPrompt || '尚未记忆'}
                </div>
              </div>
            </>
          </Modal>
        </div>
      )}
    </div>
  );
}

export function PromptHints(props: {
  prompts: Prompt[];
  onPromptSelect: (prompt: Prompt) => void;
}) {
  if (props.prompts.length === 0) return null;

  return (
    <div className={styles['prompt-hints']}>
      {props.prompts.map((prompt, i) => (
        <div
          className={styles['prompt-hint']}
          key={prompt.title + i.toString()}
          onClick={() => props.onPromptSelect(prompt)}
        >
          <div className={styles['hint-title']}>{prompt.title}</div>
          <div className={styles['hint-content']}>{prompt.content}</div>
        </div>
      ))}
    </div>
  );
}

function useScrollToBottom() {
  // for auto-scroll
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollToBottom = () => {
    const dom = scrollRef.current;
    if (dom) {
      setTimeout(() => (dom.scrollTop = dom.scrollHeight), 1);
    }
  };

  // auto scroll
  useLayoutEffect(() => {
    autoScroll && scrollToBottom();
  });

  return {
    scrollRef,
    autoScroll,
    setAutoScroll,
    scrollToBottom,
  };
}

export function ChatActions(props: {
  scrollToBottom: () => void;
  imageSelected: (img: any) => void;
  hitBottom: boolean;
  onInput: (text: string) => void;
}) {
  // stop all responses
  const couldStop = ControllerPool.hasPending();
  const stopAll = () => ControllerPool.stopAll();

  function selectImage() {
    document.getElementById('chat-image-file-select-upload')?.click();
  }

  const onImageSelected = (e: any) => {
    console.log(e);
    const file = e.target.files[0];
    const filename = file.name;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result;
      props.imageSelected({
        filename,
        base64,
      });
    };
    e.target.value = null;
  };

  useEffect(() => {
    IframeShare({
      btnEl: 'mj-prompt-builder-btn',
      url: 'https://punk.openai1s.com/aiimg/prompt?nohead=1&postmsg=1&notext=1',
      mode: 'slider',
      position: 'right',
      width: '650px',
      preload: true,
      defaultOpen: false,
      allowRepeatSubmit: true,
    });

    const handleMessage = (event: any) => {
      if (event.origin === 'https://punk.openai1s.com') {
        let prompt = event.data;
        // console.log(prompt, '打印加工后的prompt');
        if (prompt.startsWith('/imagine prompt: ')) {
          prompt = prompt.replace('/imagine prompt: ', '');
        }
        props.onInput(prompt);
        // document.getElementById('chat-input')!.innerText = event.data;
        // prompts.innerHTML = event.data;
      }
    };

    //监听prompt参数
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className={chatStyle['chat-input-actions']}>
      <Guide
        localKey="thunderbolt-cat-guide"
        steps={[
          {
            selector: '#thunderbolt-cat-mj-upload',
            title: '上传图片',
            content: <div>混图、识图、垫图等功能需要上传图片，具体可点击查看</div>,
            placement: 'right',
          },
          {
            selector: '#thunderbolt-cat-mj-prompt',
            title: 'AI绘图提示词生成器',
            content: (
              <ul style={{ listStyle: 'none' }}>
                <li>提高绘图效率</li>
                <li>提高创作质量</li>
                <li>丰富创作主题</li>
                <li>灵活性高</li>
                <li>节省时间和精力</li>
              </ul>
            ),
            placement: 'right',
          },
        ]}
        onClose={() => {
          /* do sth */
        }}
        afterStepChange={(nextIndex, nextStep) => {
          /* do sth */
        }}
        closable={false}
        stepText={(stepIndex, stepCount) => ''}
        nextText="下一步"
        // prevText="上一步"
        // showPreviousBtn
        okText="我知道了"
      />
      {couldStop && (
        <div className={`${chatStyle['chat-input-action']} clickable`} onClick={stopAll}>
          <StopIcon />
        </div>
      )}
      {!props.hitBottom && (
        <div
          className={`${chatStyle['chat-input-action']} clickable`}
          onClick={props.scrollToBottom}
        >
          <BottomIcon />
        </div>
      )}
      <div
        className={`${chatStyle['chat-input-action']} clickable`}
        onClick={selectImage}
        id="thunderbolt-cat-mj-upload"
      >
        <input
          type="file"
          accept=".png,.jpg,.webp,.jpeg"
          id="chat-image-file-select-upload"
          style={{ display: 'none' }}
          onChange={onImageSelected}
        />
        <UploadIcon />
      </div>

      <div
        className={`${chatStyle['chat-input-action']} clickable mj-prompt-builder-btn`}
        id="thunderbolt-cat-mj-prompt"
      >
        <PromptIcon />
      </div>
    </div>
  );
}

export function Chat(props: { showSideBar?: () => void; sideBarShowing?: boolean }) {
  type RenderMessage = Message & { preview?: boolean };

  const chatStore = useChatStore();
  const [session, sessionIndex] = useChatStore((state) => [
    state.currentSession(),
    state.currentSessionIndex,
  ]);
  const fontSize = useChatStore((state) => state.config.fontSize);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState('');
  const [useImages, setUseImages] = useState<any[]>([]);
  const [mjImageMode, setMjImageMode] = useState<string>('IMAGINE');
  const [isLoading, setIsLoading] = useState(false);
  const { scrollRef, setAutoScroll, scrollToBottom } = useScrollToBottom();
  const [hitBottom, setHitBottom] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (session.promptId && session.messages.length === 0 && !session.midjourney) {
      chatStore.onUserInput('', {
        toast,
        setAutoScroll,
        midjourney: !!session.midjourney,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChatBodyScroll = (e: HTMLElement) => {
    const isTouchBottom = e.scrollTop + e.clientHeight >= e.scrollHeight - 100;
    setHitBottom(isTouchBottom);
  };

  const scrollInput = () => {
    const dom = inputRef.current;
    if (!dom) return;
    const paddingBottomNum: number = parseInt(
      window.getComputedStyle(dom).paddingBottom,
      10,
    );
    dom.scrollTop = dom.scrollHeight - dom.offsetHeight + paddingBottomNum;
  };

  // auto grow input
  const [inputRows, setInputRows] = useState(2);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(5, Math.max(2 + Number(!isMobileScreen()), rows));
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  // only search prompts when user input is short
  const SEARCH_TEXT_LIMIT = 30;
  const onInput = (text: string) => {
    scrollInput();
    setUserInput(text);
    const n = text.trim().length;

    // clear search results
    if (n === 0) {
    } else if (!chatStore.config.disablePromptHint && n < SEARCH_TEXT_LIMIT) {
      // check if need to trigger auto completion
      // if (text.startsWith('/')) {
      //   let searchText = text.slice(1);
      //   onSearch(searchText);
      // }
    }
  };

  // submit user input
  const doSubmit = async (userInput: string) => {
    userInput = userInput.trim();
    if (session.midjourney) {
      if (useImages.length > 0 && mjImageMode === 'IMAGINE' && userInput == '') {
        alert('垫图模式下需要输入内容才能使用图片，请以“/mj”开头输入内容');
        return;
      }
    } else {
      if (userInput == '') return;

      const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
      const encoded = tokenizer.encode(userInput);
      const limitToken = 1000;
      if (encoded.text.length > limitToken) {
        toast({
          title: `输入过长，最多只能输入${limitToken}个字符，当前输入了${encoded.text.length}个字符`,
          status: 'warning',
          duration: 9000,
          isClosable: true,
        });
        return;
      }
    }
    setIsLoading(true);
    try {
      const res: any = await chatStore.onUserInput(userInput, {
        midjourney: !!session.midjourney,
        useImages,
        mjImageMode,
        setAutoScroll,
        toast,
      });
      if (res !== false) {
        localStorage.setItem(LAST_INPUT_KEY, userInput);
        setUserInput('');
        setUseImages([]);
        setMjImageMode('IMAGINE');
        if (!isMobileScreen) inputRef.current?.focus();
        setAutoScroll(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const onContinue = () => {
    setIsLoading(true);
    chatStore
      .onUserInput('继续', { toast, midjourney: !!session.midjourney })
      .then(() => setIsLoading(false));
    setUserInput('');
    if (!isMobileScreen()) inputRef.current?.focus();
    setAutoScroll(true);
  };

  // stop response
  const onUserStop = (messageId: number) => {
    ControllerPool.stop(sessionIndex, messageId);
  };

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == 'Enter' && e.shiftKey) {
      // 阻止原生的换行事件
      e.preventDefault();
      // 手动换行
      setUserInput((pre) => pre + '\n');
    } else if (e.key == 'Enter') {
      // 阻止原生的换行事件
      e.preventDefault();
      doSubmit(userInput);
    }
  };
  const onRightClick = (e: any, message: Message) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message.content)) {
      e.preventDefault();
    }
  };

  const onResend = (botIndex: number) => {
    // find last user input message and resend
    for (let i = botIndex; i >= 0; i -= 1) {
      if (messages[i].role === 'user') {
        setIsLoading(true);
        chatStore
          .onUserInput(messages[i].content, {
            toast,
            setAutoScroll,
            midjourney: !!session.midjourney,
          })
          .then(() => setIsLoading(false));
        chatStore.updateCurrentSession((session) => session.messages.splice(i, 2));
        inputRef.current?.focus();
        return;
      }
    }
  };

  const config = useChatStore((state) => state.config);

  const context: RenderMessage[] = session.context ? session.context.slice() : [];

  if (context.length === 0 && session.slotFields) {
    context.push(
      createMessage({
        content: Object.keys(session.slotFields).reduce<string>((acc, key) => {
          acc += `${key}: ${session.slotFields![key]} \n`;
          return acc;
        }, ''),
      }),
    );
  }

  // preview messages
  const messages = context
    .concat(session.messages as RenderMessage[])
    .concat(
      isLoading
        ? [
            {
              ...createMessage({
                role: 'assistant',
                content: '……',
              }),
              preview: true,
            },
          ]
        : [],
    )
    .concat(
      userInput.length > 0 && config.sendPreviewBubble
        ? [
            {
              ...createMessage({
                role: 'user',
                content: userInput,
              }),
              preview: true,
            },
          ]
        : [],
    );

  const [showPromptModal, setShowPromptModal] = useState(false);

  // Auto focus
  useEffect(() => {
    if (props.sideBarShowing && isMobileScreen()) return;
    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.chat} key={session.id}>
      <div className={styles['window-header']}>
        <div className={styles['window-header-title']}>
          <div
            className={`${styles['window-header-main-title']} ${styles['chat-body-title']}`}
            onClickCapture={() => {
              const newTopic = prompt('重命名对话', session.topic);
              if (newTopic && newTopic !== session.topic) {
                chatStore.updateCurrentSession((session) => (session.topic = newTopic!));
              }
            }}
          >
            {session.topic}
          </div>
          {!session.midjourney && (
            <div className={styles['window-header-sub-title']}>
              {`与 ChatGPT 的 ${session.messages.length} 条对话`}
            </div>
          )}
        </div>
        <div className={styles['window-actions']}>
          <div className={styles['window-action-button'] + ' ' + styles.mobile}>
            <IconButton
              icon={<ReturnIcon />}
              bordered
              title={'查看消息列表'}
              onClick={props?.showSideBar}
            />
          </div>
          <div className={styles['window-action-button']}>
            <IconButton
              icon={<BrainIcon />}
              bordered
              title={'查看压缩后的历史 Prompt'}
              onClick={() => {
                setShowPromptModal(true);
              }}
            />
          </div>
          <div className={styles['window-action-button']}>
            <IconButton
              icon={<ExportIcon />}
              bordered
              title={'导出聊天记录'}
              onClick={() => {
                exportMessages(
                  session.messages.filter((msg) => !msg.isError),
                  session.topic,
                );
              }}
            />
          </div>
        </div>

        <PromptToast
          showToast={!hitBottom}
          showModal={showPromptModal}
          setShowModal={setShowPromptModal}
        />
      </div>

      <div
        className={styles['chat-body']}
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        onWheel={(e) => setAutoScroll(hitBottom && e.deltaY > 0)}
        onTouchStart={() => {
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        {messages
          .filter((message) => message.content && message.content.length)
          .map((message, i) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={i}
                className={
                  isUser
                    ? styles['chat-message-user']
                    : [
                        styles['chat-message'],
                        message.model == 'midjourney' ? styles['chat-model-mj'] : '',
                      ].join(' ')
                }
              >
                <div className={styles['chat-message-container']}>
                  <div className={styles['chat-message-avatar']}>
                    <Avatar role={message.role} />
                  </div>
                  {(message.preview || message.streaming) && (
                    <div className={styles['chat-message-status']}>正在输入…</div>
                  )}
                  <div className={styles['chat-message-item']}>
                    {!isUser &&
                      !(message.preview || message.content.length === 0) &&
                      !session.midjourney && (
                        <div className={styles['chat-message-top-actions']}>
                          {message.streaming ? (
                            <div
                              className={styles['chat-message-top-action']}
                              onClick={() => onUserStop(message.id ?? i)}
                            >
                              停止
                            </div>
                          ) : (
                            <div
                              className={styles['chat-message-top-action']}
                              onClick={() => onResend(i)}
                            >
                              重试
                            </div>
                          )}

                          <div
                            className={styles['chat-message-top-action']}
                            onClick={() => copyToClipboard(message.content)}
                          >
                            复制
                          </div>
                        </div>
                      )}
                    <Markdown
                      content={message.content}
                      loading={
                        (message.preview || message.content.length === 0) && !isUser
                      }
                      onContextMenu={(e) => onRightClick(e, message)}
                      onDoubleClickCapture={() => {
                        if (!isMobileScreen || session.midjourney) return;
                        setUserInput(message.content);
                      }}
                      fontSize={fontSize}
                      parentRef={scrollRef}
                      defaultShow={i >= messages.length - 10}
                    />
                  </div>
                  {!isUser &&
                    message.model == 'midjourney' &&
                    message.attr?.finished &&
                    ['VARIATION', 'IMAGINE'].includes(message.attr?.action) && (
                      <div
                        className={[
                          styles['chat-message-actions'],
                          styles['column-flex'],
                        ].join(' ')}
                      >
                        <div>
                          <button
                            onClick={() => doSubmit(`UPSCALE::1::${message.attr.taskId}`)}
                            className={`${styles['chat-message-action-btn']} clickable`}
                          >
                            U1
                          </button>
                          <button
                            onClick={() => doSubmit(`UPSCALE::2::${message.attr.taskId}`)}
                            className={`${styles['chat-message-action-btn']} clickable`}
                          >
                            U2
                          </button>
                          <button
                            onClick={() => doSubmit(`UPSCALE::3::${message.attr.taskId}`)}
                            className={`${styles['chat-message-action-btn']} clickable`}
                          >
                            U3
                          </button>
                          <button
                            onClick={() => doSubmit(`UPSCALE::4::${message.attr.taskId}`)}
                            className={`${styles['chat-message-action-btn']} clickable`}
                          >
                            U4
                          </button>
                          {/*<button onClick={() => doSubmit(`/mj REROLL::0::${message.attr.taskId}`)} className={`${styles["chat-message-action-btn"]} clickable`}>RESET</button>*/}
                        </div>
                        <div>
                          <button
                            onClick={() =>
                              doSubmit(`VARIATION::1::${message.attr.taskId}`)
                            }
                            className={`${styles['chat-message-action-btn']} clickable`}
                          >
                            V1
                          </button>
                          <button
                            onClick={() =>
                              doSubmit(`VARIATION::2::${message.attr.taskId}`)
                            }
                            className={`${styles['chat-message-action-btn']} clickable`}
                          >
                            V2
                          </button>
                          <button
                            onClick={() =>
                              doSubmit(`VARIATION::3::${message.attr.taskId}`)
                            }
                            className={`${styles['chat-message-action-btn']} clickable`}
                          >
                            V3
                          </button>
                          <button
                            onClick={() =>
                              doSubmit(`VARIATION::4::${message.attr.taskId}`)
                            }
                            className={`${styles['chat-message-action-btn']} clickable`}
                          >
                            V4
                          </button>
                        </div>
                      </div>
                    )}
                  {!isUser && !message.preview && (
                    <div className={styles['chat-message-actions']}>
                      <div className={styles['chat-message-action-date']}>
                        {message.date.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <div className={styles['chat-input-panel']}>
        {session.midjourney && (
          <>
            <ChatActions
              scrollToBottom={scrollToBottom}
              hitBottom={hitBottom}
              imageSelected={(img: any) => {
                if (useImages.length >= 2) {
                  alert(`最多可选择 2 张图片`);
                  return;
                }
                setUseImages([...useImages, img]);
              }}
              onInput={onInput}
            />
            {useImages.length > 0 && (
              <div className={styles['chat-select-images']}>
                {useImages.map((img: any, i) => (
                  <img
                    src={img.base64}
                    key={i}
                    onClick={() => {
                      setUseImages(useImages.filter((_, ii) => ii != i));
                    }}
                    title={img.filename}
                    alt={img.filename}
                  />
                ))}
                <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                  {[
                    { name: '垫图（图生图）模式', value: 'IMAGINE' },
                    { name: '混图模式', value: 'BLEND' },
                    { name: '识图（图生文）模式', value: 'DESCRIBE' },
                  ].map((item, i) => (
                    <label key={i}>
                      <input
                        type="radio"
                        name="mj-img-mode"
                        checked={mjImageMode == item.value}
                        value={item.value}
                        onChange={(e) => {
                          setMjImageMode(e.target.value);
                        }}
                      />
                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
                <div style={{ fontSize: '12px' }}>
                  <small>
                    提示：垫图模式/识图(describe)模式只会使用第一张图片，混图(blend)模式会按顺序使用选中的两张图片（点击图片可以移除）
                  </small>
                </div>
              </div>
            )}
          </>
        )}
        <div className={styles['chat-input-panel-inner']}>
          <textarea
            id="chat-input"
            ref={inputRef}
            className={styles['chat-input']}
            placeholder={
              useImages.length > 0 && mjImageMode != 'IMAGINE'
                ? '该模式下不支持输入内容'
                : 'Enter 发送，Shift + Enter 换行'
            }
            onInput={(e) => onInput(e.currentTarget.value)}
            value={userInput}
            onKeyDown={onInputKeyDown}
            onFocus={() => setAutoScroll(true)}
            onBlur={() => setAutoScroll(false)}
            autoFocus={!props?.sideBarShowing}
            rows={inputRows}
            disabled={useImages.length > 0 && mjImageMode != 'IMAGINE'}
          />
          {!session.midjourney && (
            <IconButton
              icon={<ContinueIcon />}
              text={'继续'}
              className={styles['chat-input-continue']}
              noDark
              onClick={onContinue}
            />
          )}
          <IconButton
            icon={<SendWhiteIcon />}
            text={'发送'}
            className={styles['chat-input-send']}
            noDark
            onClick={() => doSubmit(userInput)}
          />
        </div>
      </div>
    </div>
  );
}
