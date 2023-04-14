import { useEffect, useState, use } from 'react';
import useSWR from 'swr';
import styles from './promptsList.module.scss';
import { PromptTag } from './PromptTag';
import { getPromptList } from '../../aigc-tools-requests';
import { PromptCategory } from '@/app/aigc-typings';
import { Button } from '@chakra-ui/react';

const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
};

interface PromptTag {
  type: string;
  color: string;
}

interface Prompt {
  type: string;
  rule: string;
  prompt: string;
}

// 根据 PromptTag 结构生成一种测试数据
const colors: string[] = [
  '#f56a00',
  '#7265e6',
  '#ffbf00',
  '#00a2ae',
  '#00a854',
  '#f5317f',
  '#108ee9',
  '#f04134',
];
const promptTags: PromptTag[] = colors.map((color, index) => ({
  type: String(index + 1),
  color,
}));

const prompts = [
  {
    type: '1',
    rule: '1',
    prompt: '1',
  },
  {
    type: '1',
    rule: '2',
    prompt: '2',
  },
  {
    type: '1',
    rule: '3',
    prompt: '3',
  },
  {
    type: '2',
    rule: '4',
    prompt: '4',
  },
  {
    type: '2',
    rule: '5',
    prompt: '5',
  },
  {
    type: '3',
    rule: '6',
    prompt: '6',
  },
];

interface Props {}

export const Prompts: React.FC<Props> = ({}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();
  const [promptCategories, setPromptCategories] = useState<PromptCategory[]>([]);

  // const { data, error, isLoading } = useSWR('getPromptList', getPromptList);
  // console.log('data: ', data);
  // const data = use(getPromptList());

  useEffect(() => {
    getPromptList()
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
          <li className={styles.promptContent} key={prompt.rule}>
            <div className={styles.cardBody}>
              <div className={styles.promptHeader}>
                <h4 className={styles.promptTitle}>{prompt.rule}</h4>
                <Button>使用</Button>
              </div>
              <p className={styles.promptDetail}>{prompt.prompt}</p>
            </div>
            <ul className={styles.cardFoot}>
              <li className={styles.tag}>{prompt.type}</li>
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};
