'use client';
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { register, requestValidateCode } from '../../aigc-tools-requests';
import { INVITE_CODE } from '@/app/constant';
import Logo from '../../icons/logo.svg';

export default function SignupCard() {
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [account, setAccount] = useState<string>();
  const [validateCode, setValidateCode] = useState<string>();
  const [pwd, setPwd] = useState<string>();
  const [pwd2, setPwd2] = useState<string>();

  const [countdown, setCountdown] = useState<number>();
  const [timerId, setTimerId] = useState<NodeJS.Timer>();

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [timerId]);

  const startCountdown = () => {
    if (timerId) {
      clearInterval(timerId);
    }

    let secondsRemaining = 60;
    setCountdown(secondsRemaining);

    const newTimerId = setInterval(() => {
      secondsRemaining -= 1;
      setCountdown(secondsRemaining);

      if (secondsRemaining <= 0) {
        clearInterval(newTimerId);
        setTimerId(undefined);
        setCountdown(undefined);
      }
    }, 1000);

    setTimerId(newTimerId);
  };

  const handleRequestValidateCode = () => {
    requestValidateCode(account!)
      .then((res) => {
        if (res && +res.code !== 0) {
          toast({
            title: '验证码已发送',
            status: 'success',
            duration: 1000,
            isClosable: true,
          });
          startCountdown();
        } else {
          return Promise.reject(res.message);
        }
      })
      .catch((err) => {
        toast({
          title: err,
          status: 'error',
          duration: 1000,
          isClosable: true,
        });
      });
  };

  const handleRegister = () => {
    register(account!, pwd!, validateCode!, window.localStorage.getItem(INVITE_CODE))
      .then(() => {
        toast({
          title: '注册成功',
          status: 'success',
          duration: 1000,
          isClosable: true,
        });
        router.push('/login');
      })
      .catch((err) => {
        toast({
          title: err.message,
          status: 'error',
          duration: 1000,
          isClosable: true,
        });
      });
  };

  return (
    <Flex minH={'100vh'} minW={'100vw'} align={'center'} justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Logo />
          <Heading fontSize={'4xl'} textAlign={'center'} color="white">
            注册账户
          </Heading>
          <Text fontSize={'lg'} color={'rgb(187, 187, 187)'}>
            享受AI带来的便利吧
          </Text>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4}>
            <FormControl id="account" isRequired>
              <FormLabel>手机号/邮箱</FormLabel>
              <Input
                type="text"
                value={account}
                onChange={(e) => setAccount(e.currentTarget.value)}
              />
            </FormControl>
            <HStack>
              <Box>
                <FormControl id="validateCode" isRequired>
                  <FormLabel>验证码</FormLabel>
                  <Input
                    type="text"
                    value={validateCode}
                    onChange={(e) => setValidateCode(e.currentTarget.value)}
                  />
                </FormControl>
              </Box>
              <Box style={{ alignSelf: 'end' }}>
                <Button
                  size="md"
                  bg={'blue.400'}
                  color={'white'}
                  _hover={{
                    bg: 'blue.500',
                  }}
                  onClick={handleRequestValidateCode}
                  isLoading={!!timerId}
                  // loadingText="Submitting"
                >
                  {countdown === undefined ? '发送验证码' : `${countdown}秒后可重新发送`}
                </Button>
              </Box>
            </HStack>
            <FormControl id="password" isRequired>
              <FormLabel>密码</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={pwd}
                  onChange={(e) => setPwd(e.currentTarget.value)}
                />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    onClick={() => setShowPassword((showPassword) => !showPassword)}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl id="confirm-password" isRequired>
              <FormLabel>确认密码</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={pwd2}
                  onChange={(e) => setPwd2(e.currentTarget.value)}
                />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    onClick={() => setShowPassword((showPassword) => !showPassword)}
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText="Submitting"
                size="lg"
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                disabled={
                  !account ||
                  !account.length ||
                  !validateCode ||
                  !validateCode.length ||
                  !pwd ||
                  !pwd.length ||
                  !pwd2 ||
                  !pwd2.length ||
                  pwd !== pwd2
                }
                onClick={handleRegister}
              >
                注 册
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={'center'}>
                已有账号?
                <Link color={'blue.400'} href="/login">
                  登录
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
