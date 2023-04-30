import { useEffect, useState } from 'react';
import styles from './promptsList.module.scss';
import { PromptTag } from './PromptTag';
import { getPromptCategoryList, getPromptList } from '../../aigc-tools-requests';
import { Prompt, PromptCategory } from '@/app/aigc-typings';
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useChatStore } from '../../store';
import { useRouter } from 'next/navigation';
import { SLOT_FIELDS } from '@/app/constant';

const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r},${g},${b})`;
};

export const Prompts: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [promptCategories, setPromptCategories] = useState<PromptCategory[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>();
  const [slotFields, setSlotFields] = useState<Record<string, string>>({});
  const [createNewSession, onUserInput, updateCurrentSession] = useChatStore((state) => [
    state.newSession,
    state.onUserInput,
    state.updateCurrentSession,
  ]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    getPromptCategoryList()
      .then((res) => {
        if (res && res.result && res.result.length) {
          const result = res.result.map((item) => {
            item.color = generateRandomColor();
            return item;
          });
          result.unshift({
            category: '全部',
            id: 0,
            createTime: [],
            description: '全部',
            updateTime: [],
            color: generateRandomColor(),
          } as PromptCategory);
          setPromptCategories(result);
        }
      })
      .catch((err) => {
        console.log('err: ', err);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    getPromptList(selectedCategoryId ?? 0)
      .then((res) => {
        if (res && res.result && res.result.length) {
          const prompts = res.result;
          if ((selectedCategoryId ?? 0) === 0) {
            prompts.unshift({
              prompt: '万能',
              categoryId: -1,
              id: -1,
              act: '万能',
              createTime: '',
              updateTime: '',
              userId: '',
              title: '万能',
            });
          }
          setPrompts(prompts);
        } else {
          setPrompts([]);
        }
      })
      .catch((err) => {
        console.log('err: ', err);
      })
      .finally(() => {
        setLoading(false);
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
            onClick={() => {
              if (tag.id !== selectedCategoryId) {
                setSelectedCategoryId(tag.id);
              } else {
                setSelectedCategoryId(0);
              }
            }}
            seleced={selectedCategoryId === tag.id}
          />
        ))}
      </div>
      {loading ? (
        <Flex justifyContent={'center'} alignItems={'center'} padding={'3rem'}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Flex>
      ) : (
        <ul className={styles.promptList}>
          {prompts.map((prompt) => (
            <li
              className={styles.promptContent}
              key={prompt.id}
              onClick={() => {
                setCurrentPrompt(prompt);

                // 万能模板
                if (prompt.id === -1) {
                  onOpen();
                  return;
                }

                const promptContent = prompt.prompt;
                const slots = promptContent.match(/\[(.*?)\]/g) as string[];
                if (slots && Array.isArray(slots) && slots.length) {
                  const slotFields = slots.reduce<Record<string, string>>((res, cur) => {
                    res[cur] = '';
                    return res;
                  }, {});
                  setSlotFields(slotFields);
                  onOpen();
                } else {
                  setSlotFields({});

                  window.localStorage.setItem(SLOT_FIELDS, JSON.stringify({}));

                  createNewSession({
                    promptId: prompt.id + '',
                    promptRule: prompt.act,
                  });
                  updateCurrentSession((session) => {
                    session.slotFields = {};
                  });
                  router.push('/chat');
                }
              }}
            >
              <div className={styles.overlay}>
                <span className={styles.text}>去使用</span>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.promptHeader}>
                  {/* <LogoLoading /> */}
                  <h4 className={styles.promptTitle}>
                    {prompt.act !== prompt.title ? (
                      <>
                        <span style={{ fontSize: '1.1rem' }}>{prompt.act}</span>
                        <Text fontSize="0.5rem" color={'gray.500'}>
                          {prompt.title}
                        </Text>
                      </>
                    ) : (
                      prompt.title
                    )}
                  </h4>
                </div>
              </div>
            </li>
          ))}
        </ul>
        // @ts-ignore
      )}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{currentPrompt?.act}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {currentPrompt?.act !== currentPrompt?.title && (
              <Text size={'sm'} color={'rgb(187, 187, 187)'} mb="1.5rem">
                {currentPrompt?.title}
              </Text>
            )}
            {currentPrompt?.id === -1 ? (
              <span>这是霹雳猫的基础模型，拥有全部的功能，可以完全自定义环境。</span>
            ) : (
              <>
                {Object.keys(slotFields).map((key, index) => {
                  return (
                    <FormControl key={key}>
                      <FormLabel>{key}</FormLabel>
                      <Input
                        autoFocus={index === 0}
                        value={slotFields[key]}
                        onChange={(e) =>
                          setSlotFields({
                            ...slotFields,
                            [key]: e.target.value,
                          })
                        }
                      />
                    </FormControl>
                  );
                })}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => {
                if (currentPrompt?.id === -1) {
                  createNewSession();
                  updateCurrentSession((session) => {
                    session.topic = '万能';
                  });
                  router.push('/chat');
                  onClose();
                  return;
                }
                createNewSession({
                  promptId: currentPrompt!.id + '',
                  promptRule: currentPrompt!.act,
                });
                updateCurrentSession((session) => {
                  session.slotFields = slotFields;
                });
                router.push('/chat');
                onClose();
              }}
              isDisabled={
                currentPrompt?.id !== -1 &&
                Object.values(slotFields).some((value) => !value || !value.length)
              }
            >
              进入场景
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
