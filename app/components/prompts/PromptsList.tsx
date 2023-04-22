import { useEffect, useState } from 'react';
import styles from './promptsList.module.scss';
import { PromptTag } from './PromptTag';
import { getPromptCategoryList, getPromptList } from '../../aigc-tools-requests';
import { Prompt, PromptCategory } from '@/app/aigc-typings';
import { Button } from '@chakra-ui/react';

const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
};

export const Prompts: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();
  const [promptCategories, setPromptCategories] = useState<PromptCategory[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    getPromptCategoryList()
      .then((res) => {
        if (res && res.result && res.result.length) {
          setPromptCategories(
            res.result.map((item) => {
              item.color = generateRandomColor();
              return item;
            }),
          );
        }
      })
      .catch((err) => {
        console.log('err: ', err);
      });
  }, []);

  useEffect(() => {
    getPromptList(selectedCategoryId ?? 0)
      .then((res) => {
        if (res && res.result && res.result.length) {
          setPrompts(res.result);
        } else {
          setPrompts([]);
        }
      })
      .catch((err) => {
        console.log('err: ', err);
      });
  }, [selectedCategoryId]);

  return (
    <div className={styles.container}>
      <p>筛选</p>
      <div className={styles.tagList}>
        {promptCategories.map((tag) => (
          <PromptTag
            key={tag.id}
            color={tag.color!}
            name={tag.category}
            onClick={() => setSelectedCategoryId(tag.id)}
            seleced={selectedCategoryId === tag.id}
          />
        ))}
      </div>

      <ul className={styles.promptList}>
        {prompts.map((prompt) => (
          <li className={styles.promptContent} key={prompt.id}>
            <div className={styles.cardBody}>
              <div className={styles.promptHeader}>
                <h4 className={styles.promptTitle}>{prompt.act}</h4>
                <Button size="xs">使用</Button>
              </div>
              <span className={styles.promptDetail}>{prompt.prompt}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
