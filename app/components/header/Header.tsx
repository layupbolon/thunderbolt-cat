'use client';

import { useRouter } from 'next/navigation';
import styles from './header.module.scss';
import ChatGPTIcon from '../../icons/chatgpt.svg';
import LeftIcon from '../../icons/left.svg';

interface Props {
  back?: boolean;
  rightSlot?: React.ReactNode;
}

export const Header = (props: Props) => {
  const router = useRouter();
  return (
    <header className={styles.header}>
      <span className={styles.logo}>
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
        <h1>聊天熊猫</h1>
      </span>

      {props.rightSlot}
    </header>
  );
};
