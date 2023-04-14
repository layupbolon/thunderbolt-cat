'use client';

require('../polyfill');

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { IconButton } from './button';
import { Chat } from './chat';
import { ErrorBoundary } from './error';
import styles from './home.module.scss';
import AddIcon from '../icons/add.svg';
import BotIcon from '../icons/bot.svg';
import PaymentIcon from '../icons/payment.svg';
import CloseIcon from '../icons/close.svg';
import LoadingIcon from '../icons/three-dots.svg';
import Locale from '../locales';
import { useChatStore } from '../store';
import { Header } from './header/Header';
import { getPayUrl } from '../aigc-tools-requests';
import { showModal } from './ui-lib';
import { Auth } from '../components/auth/Auth';
import { Avatar, Button, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles['loading-content']}>
      {!props.noLogo && <BotIcon />}
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
  const [createNewSession, currentIndex, removeSession] = useChatStore((state) => [
    state.newSession,
    state.currentSessionIndex,
    state.removeSession,
  ]);
  const chatStore = useChatStore();
  const loading = !useHasHydrated();
  const [showSideBar, setShowSideBar] = useState(true);
  const router = useRouter();

  useSwitchTheme();

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={styles['tight-container']}>
      <Auth />
      <Header
        back
        rightSlot={
          <HStack>
            <Button
              size={'md'}
              bg={'#7928CA'}
              color={'white'}
              bgGradient="linear(to-l, rgb(29, 147, 171), #ced514)"
              _hover={{
                bg: 'linear(to-l, #2d9164, #131f62)',
              }}
              onClick={() => {
                router.push('/upgrade');
              }}
            >
              升级会员
            </Button>
            <Avatar bg="rgb(29, 147, 171)" size={'sm'} style={{ marginLeft: '1rem' }} />
          </HStack>
        }
      />
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
              <IconButton icon={<CloseIcon />} onClick={chatStore.deleteSession} />
            </div>
            {/* <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => {
                  setOpenSettings(true);
                  setShowSideBar(false);
                }}
                shadow
              />
            </div> */}
            {/* <Button
              color="#ddd"
              leftIcon={<AddIcon />}
              onClick={() => {
                createNewSession();
                setShowSideBar(false);
              }}
            >
              {Locale.Home.NewChat}
            </Button> */}
            <div className={styles['sidebar-action']}>
              <IconButton
                icon={<AddIcon />}
                text={Locale.Home.NewChat}
                onClick={() => {
                  createNewSession();
                  setShowSideBar(false);
                }}
                shadow
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
  );
}

export function Home() {
  return (
    <ErrorBoundary>
      <_Home></_Home>
    </ErrorBoundary>
  );
}
