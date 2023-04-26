'use client';

import { useRouter } from 'next/navigation';
import styles from './header.module.scss';
import ChatGPTIcon from '../../icons/chatgpt.svg';
import LeftIcon from '../../icons/left.svg';
import Logo from '../../icons/logo_header.svg';
import { LOGO_SLOGAN } from '@/app/constant';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  useColorModeValue,
  Image,
  Text,
  keyframes,
  Divider,
  Highlight,
  Input,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { getUserByToken, getInviteUrl } from '../../aigc-tools-requests';
import { UserInfo } from '@/app/aigc-typings';
import { CopyIcon } from '@chakra-ui/icons';
import { copyToClipboard } from '@/app/utils';

interface Props {
  back?: boolean;
}

export const Header = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserInfo>();
  const [loading, setLoading] = useState<boolean>(true);
  const [inviteUrl, setInviteUrl] = useState<string>();
  const [inviteQrCode, setInviteQrCode] = useState<string>();
  const router = useRouter();

  const handleGetUserByToken = useCallback(() => {
    getUserByToken()
      .then((res) => {
        setUser(res.result);
        getInviteUrl(res.result.account).then((res) => {
          setInviteUrl(res.result.inviteUrl);
          setInviteQrCode(res.result.qrCode);
        });
        setLoading(false);
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  const pulseRing = keyframes`
	0% {
    transform: scale(0.33);
  }
  40%,
  50% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
	`;

  const size = '40px';

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

        <Logo />
        <h1>{LOGO_SLOGAN}</h1>
      </span>

      <HStack>
        <Button
          size={'md'}
          bg={'#7928CA'}
          color={'white'}
          style={{ marginRight: '1rem' }}
          bgGradient="linear(to-l, rgb(29, 147, 171), #ced514)"
          _hover={{
            bg: 'linear(to-l, #2d9164, #131f62)',
          }}
          onClick={() => {
            router.push('/upgrade');
          }}
        >
          升级会员
        </Button>

        <Box
          as="div"
          position="relative"
          w={size}
          h={size}
          _before={{
            content: "''",
            position: 'relative',
            display: 'block',
            width: '300%',
            height: '300%',
            boxSizing: 'border-box',
            marginLeft: '-100%',
            marginTop: '-100%',
            borderRadius: '50%',
            bgColor: 'teal',
            animation: `2.25s ${pulseRing} cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite`,
          }}
        >
          <Avatar
            bg="rgb(29, 147, 171)"
            size="full"
            // style={{ marginLeft: '1rem' }}
            onClick={() => {
              handleGetUserByToken();
              setIsOpen(true);
            }}
            position="absolute"
            top={0}
          />
        </Box>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>用户中心</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Center py={6}>
                <Box
                  maxW={'100%'}
                  w={'full'}
                  bg={useColorModeValue('white', 'gray.800')}
                  boxShadow={'2xl'}
                  rounded={'md'}
                  overflow={'hidden'}
                >
                  <Image
                    h={'120px'}
                    w={'full'}
                    src={
                      'https://images.unsplash.com/photo-1612865547334-09cb8cb455da?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
                    }
                    objectFit={'cover'}
                    alt=""
                  />
                  <Flex justify={'center'} mt={-12}>
                    <Avatar
                      size={'xl'}
                      css={{
                        border: '2px solid white',
                      }}
                    />
                  </Flex>

                  <Box p={6}>
                    <Stack spacing={0} align={'center'} mb={5}>
                      <Heading fontSize={'2xl'} fontWeight={500} fontFamily={'body'}>
                        {user?.account}
                      </Heading>
                      <Text color={'gray.500'}>
                        {user?.vipType === 0
                          ? '非会员'
                          : user?.vipType === 1
                          ? '次数会员'
                          : user?.vipType === 2
                          ? '高级会员'
                          : '---'}
                      </Text>
                    </Stack>

                    <Stack direction={'row'} justify={'center'} spacing={6}>
                      {(user?.vipType === 0 || user?.vipType === 1) && (
                        <Stack spacing={0} align={'center'}>
                          <Text fontWeight={600}>
                            {user?.visitCount ?? 0}/{user?.visitLimit ?? 0}
                          </Text>
                          <Text fontSize={'sm'} color={'gray.500'}>
                            次
                          </Text>
                        </Stack>
                      )}
                      {user?.vipType === 2 &&
                        user.validateDate &&
                        user.validateDate.length && (
                          <Stack spacing={0} align={'center'}>
                            <Text fontWeight={600}>到期时间</Text>
                            <Text fontSize={'sm'} color={'gray.500'}>
                              {new Date(
                                user.validateDate[0],
                                user.validateDate[1] - 1,
                                user.validateDate[2],
                                user.validateDate[3],
                                user.validateDate[4],
                                user.validateDate[5],
                              ).toLocaleDateString()}
                            </Text>
                          </Stack>
                        )}
                    </Stack>

                    <Button
                      w={'full'}
                      mt={8}
                      bg={'#7928CA'}
                      color={'white'}
                      bgGradient="linear(to-l, rgb(29, 147, 171), #ced514)"
                      rounded={'md'}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                      onClick={() => {
                        router.push('/upgrade');
                      }}
                    >
                      升级会员
                    </Button>

                    <Divider css={{ marginTop: '2rem', marginBottom: '2rem' }} />

                    {inviteUrl && (
                      <Stack direction={'row'} justify={'center'} spacing={6}>
                        <Stack spacing={0} align={'center'}>
                          <Text fontSize="md">专属邀请链接：</Text>
                          <InputGroup size="md">
                            <Input
                              size="md"
                              value={inviteUrl}
                              isReadOnly
                              css={{ width: '20rem' }}
                            />
                            <InputRightAddon
                              onClick={() => {
                                copyToClipboard(inviteUrl);
                              }}
                            >
                              <CopyIcon _hover={{ cursor: 'pointer' }} />
                            </InputRightAddon>
                          </InputGroup>
                          <Text fontSize="md">专属邀请二维码：</Text>
                          <Image
                            src={`data:image/gif;base64,${inviteQrCode}`}
                            alt="invite qrcode"
                          />
                          <Text fontSize="md">邀请规则：</Text>
                          <ul>
                            <li>
                              次数用户每邀请一个新用户，且新用户开通 vip
                              （包月，或者购买次数包），将增加100次
                            </li>
                            <li>
                              包月用户每邀请一个新用户，且新用户开通 vip
                              （包月，或者购买次数包），使用有效期将增加5天
                            </li>
                          </ul>
                        </Stack>
                      </Stack>
                    )}
                  </Box>
                </Box>
              </Center>
            </ModalBody>
          </ModalContent>
        </Modal>
      </HStack>
    </header>
  );
};
