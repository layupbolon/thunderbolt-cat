'use client';

import { useRouter } from 'next/navigation';
import styles from './header.module.scss';
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
  ModalHeader,
  ModalOverlay,
  Stack,
  useColorModeValue,
  Image,
  Text,
  keyframes,
  useToast,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import { getCheckIn, getUserByAccount } from '../../aigc-tools-requests';
import { UserInfo } from '@/app/aigc-typings';
import { ArrowForwardIcon } from '@chakra-ui/icons';

interface Props {
  back?: boolean;
  fixed?: boolean;
}

export const Header = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserInfo>();
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  const router = useRouter();

  const handleGetUserByToken = useCallback(() => {
    setLoading(true);
    Promise.all([getCheckIn(), getUserByAccount()])
      .then(([checkInResult, userAccountResult]) => {
        console.log('checkInResult: ', checkInResult);
        setUser(userAccountResult.result);
      })
      .catch(() => {
        window.location.href = '/login';
      })
      .finally(() => {
        setLoading(false);
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
    <header className={styles.header} style={props.fixed ? { position: 'fixed' } : {}}>
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
                          <Text color={'gray.500'} fontSize={'sm'}>
                            GPT-3.5剩余次数
                          </Text>
                          <Text fontWeight={600}>
                            {Math.max(
                              (user?.visitLimit ?? 0) - (user?.visitCount ?? 0),
                              0,
                            )}
                          </Text>
                        </Stack>
                      )}

                      <Stack spacing={0} align={'center'}>
                        <Text color={'gray.500'} fontSize={'sm'}>
                          GPT-4剩余次数
                        </Text>
                        <Text fontWeight={600}>
                          {Math.max(
                            (user?.visit4Limit ?? 0) - (user?.visit4Count ?? 0),
                            0,
                          )}
                        </Text>
                      </Stack>

                      <Stack spacing={0} align={'center'}>
                        <Text color={'gray.500'} fontSize={'sm'}>
                          AI绘画剩余次数
                        </Text>
                        <Text fontWeight={600}>
                          {Math.max((user?.imageLimit ?? 0) - (user?.imageCount ?? 0), 0)}
                        </Text>
                      </Stack>

                      {user?.vipType === 2 &&
                        user.validateDate &&
                        user.validateDate.length && (
                          <Stack spacing={0} align={'center'}>
                            {new Date().getTime() >
                            new Date(
                              user.validateDate[0],
                              user.validateDate[1] - 1,
                              user.validateDate[2],
                              user.validateDate[3],
                              user.validateDate[4],
                              user.validateDate[5],
                            ).getTime() ? (
                              <Text fontWeight={600}>会员已过期</Text>
                            ) : (
                              <>
                                <Text color={'gray.500'} fontSize={'sm'}>
                                  会员到期时间
                                </Text>
                                <Text fontWeight={600}>
                                  {new Date(
                                    user.validateDate[0],
                                    user.validateDate[1] - 1,
                                    user.validateDate[2],
                                    user.validateDate[3],
                                    user.validateDate[4],
                                    user.validateDate[5],
                                  ).toLocaleDateString()}
                                </Text>
                              </>
                            )}
                          </Stack>
                        )}
                    </Stack>
                    <Stack spacing={0} align={'center'} mt={4}>
                      <Text color={'gray.500'} fontSize={'sm'}>
                        签到积分
                      </Text>
                      <Text
                        color={'blue.400'}
                        fontSize="1rem"
                        fontWeight={600}
                        _hover={{
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          router.push('/exchange');
                          setIsOpen(false);
                          // toast({
                          //   title: '敬请期待',
                          //   status: 'info',
                          //   duration: 2000,
                          //   isClosable: true,
                          // });
                        }}
                      >
                        {user?.points ?? 0}
                      </Text>
                    </Stack>

                    <Button
                      w={'full'}
                      colorScheme="yellow"
                      color={'white'}
                      variant="solid"
                      rounded={'md'}
                      mt={8}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                      onClick={() => {
                        router.push('/checkIn');
                        setIsOpen(false);
                      }}
                    >
                      签 到
                    </Button>

                    <Button
                      w={'full'}
                      mt={5}
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
                        setIsOpen(false);
                      }}
                    >
                      升级会员
                    </Button>

                    <Button
                      w={'full'}
                      rightIcon={<ArrowForwardIcon />}
                      colorScheme="teal"
                      variant="outline"
                      rounded={'md'}
                      mt={5}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                      onClick={() => {
                        router.push('/invite');
                        setIsOpen(false);
                      }}
                    >
                      邀请好友
                    </Button>
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
