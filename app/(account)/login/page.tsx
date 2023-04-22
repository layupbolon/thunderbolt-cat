'use client';

import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Link,
  Button,
  Heading,
  Text,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../aigc-tools-requests';
import { USER_INFO_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../../constant';

export default function SimpleCard() {
  const [account, setAccount] = useState<string>();
  const [pwd, setPwd] = useState<string>();
  const toast = useToast();
  const router = useRouter();

  const handleLogin = () => {
    auth({ account: account!, password: pwd! })
      .then((res) => {
        if (res && res.jwt) {
          toast({
            title: '登录成功',
            status: 'success',
            duration: 1000,
            isClosable: true,
          });
          localStorage.setItem(TOKEN_STORAGE_KEY, res.jwt);
          router.replace('/');
        } else {
          toast({
            title: `登录失败`,
            status: 'error',
            duration: 1000,
            isClosable: true,
          });
        }
      })
      .catch((err) => {
        toast({
          title: `登录失败，${err.message}`,
          status: 'error',
          duration: 1000,
          isClosable: true,
        });
      });
  };

  return (
    <Flex
      minH={'100vh'}
      minW={'100vw'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>登录账户</Heading>
          <Text fontSize={'lg'} color={'gray.600'}>
            登录后可获得免费使用次数
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>手机号/邮箱</FormLabel>
              <Input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.currentTarget.value)}
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel>密码</FormLabel>
              <Input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.currentTarget.value)}
              />
            </FormControl>
            <Stack spacing={10}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}
              >
                {/* <Checkbox>Remember me</Checkbox> */}
                <Link color={'blue.400'} href="/register">
                  注册
                </Link>
              </Stack>
              <Button
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={handleLogin}
              >
                登 录
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
