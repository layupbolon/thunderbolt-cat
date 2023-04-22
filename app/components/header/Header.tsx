'use client';

import { useRouter } from 'next/navigation';
import styles from './header.module.scss';
import ChatGPTIcon from '../../icons/chatgpt.svg';
import LeftIcon from '../../icons/left.svg';
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
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { getUserByToken } from '../../aigc-tools-requests';
import { UserInfo } from '@/app/aigc-typings';

interface Props {
  back?: boolean;
}

export const Header = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserInfo>();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const handleGetUserByToken = useCallback(() => {
    getUserByToken()
      .then((res) => {
        setUser(res.result);
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

        <ChatGPTIcon />
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
        {/* <Avatar
          bg="rgb(29, 147, 171)"
          size={'sm'}
          style={{ marginLeft: '1rem' }}
          onClick={() => {
            handleGetUserByToken();
            setIsOpen(true);
          }}
        /> */}
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
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>用户信息</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Center py={6}>
                <Box
                  maxW={'270px'}
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
                      src={
                        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ'
                      }
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
                      <Stack spacing={0} align={'center'}>
                        <Text fontWeight={600}>
                          {user?.visitCount ?? 0}/{user?.visitLimit ?? 0}
                        </Text>
                        <Text fontSize={'sm'} color={'gray.500'}>
                          次
                        </Text>
                      </Stack>
                      <Stack spacing={0} align={'center'}>
                        <Text fontWeight={600}>23k</Text>
                        <Text fontSize={'sm'} color={'gray.500'}>
                          Followers
                        </Text>
                      </Stack>
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
