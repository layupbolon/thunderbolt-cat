'use client';

import { Button } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './landing.module.scss';
import { INVITE_CODE, LOGO_SLOGAN } from '@/app/constant';
import Logo from '../../icons/logo.svg';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { useEffect } from 'react';

export const Landing = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const invite = searchParams.get('invite');
    if (invite) {
      window.localStorage.setItem(INVITE_CODE, invite);
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
            立即使用
          </Button>
        </div>
      </div>
    </div>
  );
};
