'use client';

import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import styles from './landing.module.scss';
import { Header } from '../header/Header';
import { Prompts } from '../prompts/PromptsList';
import { LOGO_SLOGAN } from '@/app/constant';

export const Landing = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.bg}></div>
      <Header />

      <h1 className={styles.title}>{LOGO_SLOGAN}</h1>
      <h2 className={styles.subTitle}>ChatGPT 国内入口，无需魔法直接使用</h2>
      <div className={styles.btns}>
        <Button
          style={{ width: '150px', height: '50px', fontSize: '18px' }}
          size={'lg'}
          bg={'#7928CA'}
          color={'white'}
          bgGradient="linear(to-l, rgb(29, 147, 171), #ced514)"
          _hover={{
            bg: 'linear(to-l, #2d9164, #131f62)',
          }}
          onClick={() => {
            router.push('/chat');
          }}
        >
          立即使用
        </Button>
      </div>

      <Prompts />
    </div>
  );
};
