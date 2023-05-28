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
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import { requestValidateCodeInResetPwd, resetPwd } from '../../aigc-tools-requests';
import Logo from '../../icons/logo.svg';

export default function ForgetCard() {
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [account, setAccount] = useState<string>();
  const [validateCode, setValidateCode] = useState<string>();
  const [pwd, setPwd] = useState<string>();
  const [pwd2, setPwd2] = useState<string>();

  const [countdown, setCountdown] = useState<number>();
  const [timerId, setTimerId] = useState<NodeJS.Timer>();

  const router = useRouter();

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
    requestValidateCodeInResetPwd(account!)
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

  const handleResetPwd = () => {
    resetPwd(account!, pwd!, validateCode!)
      .then(() => {
        toast({
          title: '修改密码成功',
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
            忘记密码
          </Heading>
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
                  isDisabled={countdown !== undefined}
                  // loadingText="Submitting"
                >
                  {countdown === undefined ? '发送验证码' : `${countdown}秒后可重新发送`}
                </Button>
              </Box>
            </HStack>
            <FormControl id="password" isRequired>
              <FormLabel>新密码</FormLabel>
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
                onClick={handleResetPwd}
              >
                提 交
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
