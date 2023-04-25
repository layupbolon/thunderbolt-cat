import { useState, useEffect, useMemo, HTMLProps } from 'react';

import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';

import styles from './settings.module.scss';

import ResetIcon from '../icons/reload.svg';
import CloseIcon from '../icons/close.svg';
import ClearIcon from '../icons/clear.svg';
import EditIcon from '../icons/edit.svg';
import EyeIcon from '../icons/eye.svg';
import EyeOffIcon from '../icons/eye-off.svg';

import { List, ListItem, Popover, showToast } from './ui-lib';

import { IconButton } from './button';
import {
  SubmitKey,
  useChatStore,
  Theme,
  ALL_MODELS,
  useUpdateStore,
  useAccessStore,
  ModalConfigValidator,
} from '../store';
import { Avatar } from './chat';

import { AllLangs, changeLang, getLang } from '../locales';
import { getCurrentVersion, getEmojiUrl } from '../utils';
import Link from 'next/link';
import { UPDATE_URL } from '../constant';
import { SearchService, usePromptStore } from '../store/prompt';
import { UserInfo } from '../aigc-typings';
import { ErrorBoundary } from './error';
import { InputRange } from './input-range';

function SettingItem(props: { title: string; subTitle?: string; children: JSX.Element }) {
  return (
    <ListItem>
      <div className={styles['settings-title']}>
        <div>{props.title}</div>
        {props.subTitle && (
          <div className={styles['settings-sub-title']}>{props.subTitle}</div>
        )}
      </div>
      {props.children}
    </ListItem>
  );
}

function PasswordInput(props: HTMLProps<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);

  function changeVisibility() {
    setVisible(!visible);
  }

  return (
    <div className={styles['password-input']}>
      <IconButton
        icon={visible ? <EyeIcon /> : <EyeOffIcon />}
        onClick={changeVisibility}
        className={styles['password-eye']}
      />
      <input {...props} type={visible ? 'text' : 'password'} />
    </div>
  );
}

export function Settings(props: { closeSettings: () => void; user?: UserInfo }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [config, updateConfig, resetConfig, clearAllData, clearSessions] = useChatStore(
    (state) => [
      state.config,
      state.updateConfig,
      state.resetConfig,
      state.clearAllData,
      state.clearSessions,
    ],
  );

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentId = getCurrentVersion();
  const remoteId = updateStore.remoteId;
  const hasNewVersion = currentId !== remoteId;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestCommitId(force).then(() => {
      setCheckingUpdate(false);
    });
  }

  useEffect(() => {
    checkUpdate();
  }, []);

  const accessStore = useAccessStore();
  const enabledAccessControl = useMemo(
    () => accessStore.enabledAccessControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const promptStore = usePromptStore();
  const builtinCount = SearchService.count.builtin;
  const customCount = promptStore.prompts.size ?? 0;

  const showUsage = !!accessStore.token || !!accessStore.accessCode;

  useEffect(() => {
    checkUpdate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.closeSettings();
      }
    };
    document.addEventListener('keydown', keydownEvent);
    return () => {
      document.removeEventListener('keydown', keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorBoundary>
      <div className={styles['window-header']}>
        <div className={styles['window-header-title']}>
          <div className={styles['window-header-main-title']}>设置</div>
          <div className={styles['window-header-sub-title']}>设置选项</div>
        </div>
        <div className={styles['window-actions']}>
          <div className={styles['window-action-button']}>
            <IconButton
              icon={<ClearIcon />}
              onClick={() => {
                const confirmed = window.confirm('是否要重置所有配置？');
                if (confirmed) {
                  clearSessions();
                }
              }}
              bordered
              title={'清除所有数据'}
            />
          </div>
          <div className={styles['window-action-button']}>
            <IconButton
              icon={<ResetIcon />}
              onClick={() => {
                const confirmed = window.confirm('是否要重置所有配置？');
                if (confirmed) {
                  resetConfig();
                }
              }}
              bordered
              title={'重置所有选项'}
            />
          </div>
          <div className={styles['window-action-button']}>
            <IconButton
              icon={<CloseIcon />}
              onClick={props.closeSettings}
              bordered
              title={'关闭'}
            />
          </div>
        </div>
      </div>
      <div className={styles['settings']}>
        <List>
          <SettingItem title={'账号'}>
            <span style={{ fontSize: 14 }}>{props.user?.account ?? ''}</span>
          </SettingItem>
          <SettingItem title={'头像'}>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <EmojiPicker
                  lazyLoadEmojis
                  theme={EmojiTheme.AUTO}
                  getEmojiUrl={getEmojiUrl}
                  onEmojiClick={(e) => {
                    updateConfig((config) => (config.avatar = e.unified));
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
              <div className={styles.avatar} onClick={() => setShowEmojiPicker(true)}>
                <Avatar role="user" />
              </div>
            </Popover>
          </SettingItem>

          <SettingItem title={'发送键'}>
            <select
              value={config.submitKey}
              onChange={(e) => {
                updateConfig(
                  (config) => (config.submitKey = e.target.value as any as SubmitKey),
                );
              }}
            >
              {Object.values(SubmitKey).map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </select>
          </SettingItem>

          <ListItem>
            <div className={styles['settings-title']}>{'主题'}</div>
            <select
              value={config.theme}
              onChange={(e) => {
                updateConfig((config) => (config.theme = e.target.value as any as Theme));
              }}
            >
              {Object.values(Theme).map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </select>
          </ListItem>

          <SettingItem title={'Language'}>
            <select
              value={getLang()}
              onChange={(e) => {
                changeLang(e.target.value as any);
              }}
            >
              <option value={'cn'} key={'cn'}>
                简体中文
              </option>
            </select>
          </SettingItem>

          <SettingItem title={'字体大小'} subTitle={'聊天内容的字体大小'}>
            <InputRange
              title={`${config.fontSize ?? 14}px`}
              value={config.fontSize}
              min="12"
              max="18"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) => (config.fontSize = Number.parseInt(e.currentTarget.value)),
                )
              }
            ></InputRange>
          </SettingItem>

          <SettingItem title={'紧凑边框'}>
            <input
              type="checkbox"
              checked={config.tightBorder}
              onChange={(e) =>
                updateConfig((config) => (config.tightBorder = e.currentTarget.checked))
              }
            ></input>
          </SettingItem>

          <SettingItem title={'发送预览气泡'}>
            <input
              type="checkbox"
              checked={config.sendPreviewBubble}
              onChange={(e) =>
                updateConfig(
                  (config) => (config.sendPreviewBubble = e.currentTarget.checked),
                )
              }
            ></input>
          </SettingItem>
        </List>
        <List>
          <SettingItem
            title={'禁用提示词自动补全'}
            subTitle={'在输入框开头输入 / 即可触发自动补全'}
          >
            <input
              type="checkbox"
              checked={config.disablePromptHint}
              onChange={(e) =>
                updateConfig(
                  (config) => (config.disablePromptHint = e.currentTarget.checked),
                )
              }
            ></input>
          </SettingItem>

          <SettingItem
            title={'自定义提示词列表'}
            subTitle={`内置 ${builtinCount} 条，用户定义 ${customCount} 条`}
          >
            <IconButton
              icon={<EditIcon />}
              text={'编辑'}
              onClick={() => showToast('该功能仍在开发中……')}
            />
          </SettingItem>
        </List>
        <List>
          {enabledAccessControl ? (
            <SettingItem title={'访问密码'} subTitle={'现在是未授权访问状态'}>
              <PasswordInput
                value={accessStore.accessCode}
                type="text"
                placeholder={'请输入访问密码'}
                onChange={(e) => {
                  accessStore.updateCode(e.currentTarget.value);
                }}
              />
            </SettingItem>
          ) : (
            <></>
          )}

          <SettingItem title={'API Key'} subTitle={'使用自己的 Key 可绕过密码访问限制'}>
            <PasswordInput
              value={accessStore.token}
              type="text"
              placeholder={'OpenAI API Key'}
              onChange={(e) => {
                accessStore.updateToken(e.currentTarget.value);
              }}
            />
          </SettingItem>

          {/* <SettingItem
            title={Locale.Settings.Usage.Title}
            subTitle={
              showUsage
                ? loadingUsage
                  ? Locale.Settings.Usage.IsChecking
                  : Locale.Settings.Usage.SubTitle(
                      usage?.used ?? "[?]",
                      usage?.subscription ?? "[?]",
                    )
                : Locale.Settings.Usage.NoAccess
            }
          >
            {!showUsage || loadingUsage ? (
              <div />
            ) : (
              <IconButton
                icon={<ResetIcon></ResetIcon>}
                text={Locale.Settings.Usage.Check}
                onClick={checkUsage}
              />
            )}
          </SettingItem> */}

          <SettingItem title={'附带历史消息数'} subTitle={'每次请求携带的历史消息数'}>
            <InputRange
              title={config.historyMessageCount.toString()}
              value={config.historyMessageCount}
              min="0"
              max="25"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) => (config.historyMessageCount = e.target.valueAsNumber),
                )
              }
            ></InputRange>
          </SettingItem>

          <SettingItem
            title={'历史消息长度压缩阈值'}
            subTitle={'当未压缩的历史消息超过该值时，将进行压缩'}
          >
            <input
              type="number"
              min={500}
              max={4000}
              value={config.compressMessageLengthThreshold}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.compressMessageLengthThreshold =
                      e.currentTarget.valueAsNumber),
                )
              }
            ></input>
          </SettingItem>
        </List>

        <List>
          <SettingItem title={'模型 (model)'}>
            <select
              value={config.modelConfig.model}
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.modelConfig.model = ModalConfigValidator.model(
                      e.currentTarget.value,
                    )),
                );
              }}
            >
              {ALL_MODELS.map((v) => (
                <option value={v.name} key={v.name} disabled={!v.available}>
                  {v.name}
                </option>
              ))}
            </select>
          </SettingItem>
          <SettingItem
            title={'随机性 (temperature)'}
            subTitle={'值越大，回复越随机，大于 1 的值可能会导致乱码'}
          >
            <InputRange
              value={config.modelConfig.temperature?.toFixed(1)}
              min="0"
              max="2"
              step="0.1"
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.modelConfig.temperature = ModalConfigValidator.temperature(
                      e.currentTarget.valueAsNumber,
                    )),
                );
              }}
            ></InputRange>
          </SettingItem>
          <SettingItem
            title={'单次回复限制 (max_tokens)'}
            subTitle={'单次交互所用的最大 Token 数'}
          >
            <input
              type="number"
              min={100}
              max={32000}
              value={config.modelConfig.max_tokens}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.modelConfig.max_tokens = ModalConfigValidator.max_tokens(
                      e.currentTarget.valueAsNumber,
                    )),
                )
              }
            ></input>
          </SettingItem>
          <SettingItem
            title={'话题新鲜度 (presence_penalty)'}
            subTitle={'值越大，越有可能扩展到新话题'}
          >
            <InputRange
              value={config.modelConfig.presence_penalty?.toFixed(1)}
              min="-2"
              max="2"
              step="0.5"
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.modelConfig.presence_penalty =
                      ModalConfigValidator.presence_penalty(
                        e.currentTarget.valueAsNumber,
                      )),
                );
              }}
            ></InputRange>
          </SettingItem>
        </List>
      </div>
    </ErrorBoundary>
  );
}
