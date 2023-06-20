import { useEffect, useState } from 'react';
import styles from './promptsList.module.scss';
import { PromptTag } from './PromptTag';
import {
  getPromptCategoryList,
  getPromptList,
  searchPromptList,
} from '../../aigc-tools-requests';
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
  Text,
  RadioGroup,
  Stack,
  Radio,
} from '@chakra-ui/react';
import { GPTModel, useChatStore } from '../../store';
import { useRouter } from 'next/navigation';
import { SLOT_FIELDS } from '@/app/constant';
import { useDebouncedCallback } from 'use-debounce';
import { ArrowForwardIcon } from '@chakra-ui/icons';

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
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  const [slotFields, setSlotFields] = useState<Record<string, string>>({});
  const [gptModel, setGPTModel] = useState<GPTModel>(GPTModel.GPT3_5);
  const [createNewSession, updateCurrentSession] = useChatStore((state) => [
    state.newSession,
    state.updateCurrentSession,
  ]);
  const [search, setSearch] = useState<string>();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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

  const onSearch = useDebouncedCallback(
    (text: string) => {
      setLoading(true);
      setSearchPrompts([]);
      searchPromptList(text)
        .then((res) => {
          if (res && res.result) {
            setSearchPrompts(res.result.records);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    },
    666,
    { leading: false, trailing: true },
  );

  return (
    <div className={styles.container}>
      <Flex direction={'column'} justifyContent="center" alignItems={'center'} mb="1rem">
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
            router.push('/chat');
          }}
        >
          开始对话
        </Button>
      </Flex>

      <div className={styles.searchArea}>
        <Input
          placeholder="搜索快捷指令"
          type="text"
          style={{
            marginTop: '0.5rem',
            marginBottom: '1rem',
            width: '35rem',
            maxWidth: '90vw',
            color: 'white',
          }}
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            onSearch(e.currentTarget.value);
          }}
        />
      </div>
      {search && search.length ? null : (
        <>
          <p>分类</p>
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
        </>
      )}

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
        <>
          <ul className={styles.promptList}>
            {(search && search.length && searchPrompts.length
              ? searchPrompts
              : prompts
            ).map((prompt) => (
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
                    const slotFields = slots.reduce<Record<string, string>>(
                      (res, cur) => {
                        res[cur] = '';
                        return res;
                      },
                      {},
                    );
                    setSlotFields(slotFields);
                    onOpen();
                  } else {
                    setSlotFields({});

                    window.localStorage.setItem(SLOT_FIELDS, JSON.stringify({}));

                    createNewSession({
                      promptId: prompt.id + '',
                      promptRule: prompt.act,
                      midjourney: false,
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
        </>
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
              <Text size={'sm'} color={'rgb(187, 187, 187)'} mb="1.5rem">
                这是霹雳猫的基础模型，拥有全部的功能，可以完全自定义环境。
              </Text>
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
            <FormControl>
              <FormLabel>GPT 模型</FormLabel>
              <RadioGroup
                onChange={(value) => setGPTModel(value as GPTModel)}
                value={gptModel}
              >
                <Stack direction="row">
                  <Radio value={GPTModel.GPT3_5}>GPT 3.5</Radio>
                  <Radio value={GPTModel.GPT4}>GPT 4</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>
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
                    session.gptModel = gptModel;
                  });
                  router.push('/chat');
                  onClose();
                  return;
                }
                createNewSession({
                  promptId: currentPrompt!.id + '',
                  promptRule: currentPrompt!.act,
                  midjourney: false,
                });
                updateCurrentSession((session) => {
                  session.slotFields = slotFields;
                  session.gptModel = gptModel;
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
