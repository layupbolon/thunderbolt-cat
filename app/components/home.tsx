'use client';

require('../polyfill');

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { IconButton } from './button';
import { Chat } from './chat';
import { ErrorBoundary } from './error';
import styles from './home.module.scss';
import LogoLoading from '../icons/logo_loading.svg';
import CloseIcon from '../icons/close.svg';
import LoadingIcon from '../icons/three-dots.svg';
import { useChatStore } from '../store';
import { Header } from './header/Header';

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles['loading-content']}>
      {!props.noLogo && <LogoLoading />}
      <LoadingIcon />
    </div>
  );
}

const ChatList = dynamic(async () => (await import('./chat-list')).ChatList, {
  loading: () => <Loading noLogo />,
});

function useSwitchTheme() {
  const config = useChatStore((state) => state.config);

  useEffect(() => {
    document.body.classList.remove('light');
    document.body.classList.remove('dark');

    document.body.classList.add('dark');

    const metaDescriptionDark = document.querySelector('meta[name="theme-color"][media]');
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"]:not([media])',
    );

    const themeColor = getComputedStyle(document.body)
      .getPropertyValue('--theme-color')
      .trim();
    metaDescriptionDark?.setAttribute('content', themeColor);
    metaDescriptionLight?.setAttribute('content', themeColor);
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

function _Home() {
  const chatStore = useChatStore();
  const loading = !useHasHydrated();
  const [showSideBar, setShowSideBar] = useState(true);

  useSwitchTheme();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles['chat-container']}>
      <Header back fixed />
      <div className={styles['tight-container']}>
        <div className={styles.sidebar + ` ${showSideBar && styles['sidebar-show']}`}>
          <div
            className={styles['sidebar-body']}
            onClick={() => {
              setShowSideBar(false);
            }}
          >
            <ChatList />
          </div>

          <div className={styles['sidebar-tail']}>
            <div className={styles['sidebar-actions']}>
              <div className={styles['sidebar-action'] + ' ' + styles.mobile}>
                <IconButton
                  icon={<CloseIcon />}
                  onClick={() => {
                    chatStore.deleteSession();
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles['window-content']}>
          <Chat
            key="chat"
            showSideBar={() => setShowSideBar(true)}
            sideBarShowing={showSideBar}
          />
        </div>
      </div>
    </div>
  );
}

export function Home() {
  return (
    <ErrorBoundary>
      <_Home></_Home>
    </ErrorBoundary>
  );
}
