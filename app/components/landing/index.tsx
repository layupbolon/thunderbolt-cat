'use client';

import { Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import styles from './landing.module.scss';
import { Header } from '../header/Header';
import { Prompts } from '../prompts/PromptsList';

export const Landing = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.bg}></div>
      <Header />

      <h1 className={styles.title}>聊天熊猫</h1>
      <h2 className={styles.subTitle}>ChatGPT 国内入口，无需魔法直接使用</h2>
      <div className={styles.btns}>
        <Button
          style={{ width: '150px', height: '50px', fontSize: '18px' }}
          size={'lg'}
          bg={'blue.400'}
          color={'white'}
          _hover={{
            bg: 'blue.500',
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
