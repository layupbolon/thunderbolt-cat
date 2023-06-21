'use client';

import { Button } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './landing.module.scss';
import { INVITE_CODE, LOGO_SLOGAN } from '@/app/constant';
import Logo from '../../icons/logo.svg';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useEffect } from 'react';
import { Message, useChatStore, ROLES, createMessage } from '../../store';

export const Landing = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatStore = useChatStore();

  useEffect(() => {
    const invite = searchParams.get('invite');
    if (invite) {
      window.localStorage.setItem(INVITE_CODE, invite);
    } else {
      window.localStorage.removeItem(INVITE_CODE);
    }
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          <Logo />
          {LOGO_SLOGAN}
        </h1>
        <h2 className={styles.subTitle}>
          新时代的智能小助手，从此生活、工作变得更加轻松愉快！
        </h2>
        <div className={styles.btns}>
          <Button
            size={'lg'}
            rightIcon={<ArrowForwardIcon />}
            bg={'#7928CA'}
            color={'white'}
            bgGradient="linear(to-l, rgb(29, 147, 171), #ced514)"
            _hover={{
              bg: 'linear(to-l, #2d9164, #131f62)',
            }}
            onClick={() => {
              router.push('/prompt');
            }}
          >
            AI 智能机器人
          </Button>
          <Button
            size={'lg'}
            rightIcon={<ArrowForwardIcon />}
            colorScheme="teal"
            // bg={'#2a9aae'}
            // color={'white'}
            // bgGradient="linear(to-l, rgb(188, 179, 201), #cd9085)"
            _hover={{
              bg: 'linear(to-l, #2d9164, #131f62)',
            }}
            onClick={() => {
              router.push('/chat');

              if (chatStore.sessions.some((session) => session.midjourney)) {
                chatStore.selectSession(
                  chatStore.sessions.findIndex((session) => session.midjourney),
                );
              } else {
                chatStore.newSession({
                  midjourney: true,
                  promptId: '0',
                  promptRule: 'AI 绘画',
                });
              }
            }}
            ml={4}
          >
            AI 绘画
          </Button>
        </div>
      </div>
    </div>
  );
};
