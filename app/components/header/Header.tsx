'use client';

import { useRouter } from 'next/navigation';
import styles from './header.module.scss';
import ChatGPTIcon from '../../icons/chatgpt.svg';
import LeftIcon from '../../icons/left.svg';
import { LOGO_SLOGAN } from '@/app/constant';

interface Props {
  back?: boolean;
  rightSlot?: React.ReactNode;
}

export const Header = (props: Props) => {
  const router = useRouter();
  return (
    <header className={styles.header}>
      <span
        className={styles.logo}
        onClick={() => {
          router.replace('/');
        }}
      >
        {props.back && (
          <span
            className={styles.back}
            onClick={() => {
              router.back();
            }}
          >
            <LeftIcon />
          </span>
        )}

        <ChatGPTIcon />
        <h1>{LOGO_SLOGAN}</h1>
      </span>

      {props.rightSlot}
    </header>
  );
};
