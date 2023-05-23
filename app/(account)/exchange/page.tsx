'use client';

import { ReactNode, useEffect, useState } from 'react';
import {
  Box,
  Stack,
  HStack,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Button,
  useToast,
} from '@chakra-ui/react';
import { Header } from '../../components/header/Header';
import {
  getPointsExchangeRule,
  getUserByAccount,
  exchangePoints,
} from '../../aigc-tools-requests';
import { ExchangeRule, ExchangeType, UserInfo } from '@/app/aigc-typings';

export default function UpgradePackageList() {
  const [exchangeRule, setExchangeRule] = useState<ExchangeRule>({
    exchangePerGpt3Count: 0,
    exchangePerGpt4Count: 0,
    exchangePerHour: 0,
  });
  const [user, setUser] = useState<UserInfo>();
  const toast = useToast();

  const borderColor = useColorModeValue('gray.200', 'gray.500');

  useEffect(() => {
    getPointsExchangeRule().then((res) => {
      setExchangeRule(res.result);
    });
    getUserByAccount()
      .then((res) => {
        setUser(res.result);
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  return (
    <Box padding={'0 0 3rem'} display={'flex'} flexDirection={'column'}>
      <Header back />
      <VStack spacing={2} textAlign="center" mt={'4rem'}>
        <Heading as="h1" fontSize="4xl">
          积分兑换
        </Heading>
      </VStack>
      <Stack
        wrap={'wrap'}
        direction={{ base: 'column', md: 'row' }}
        textAlign="center"
        justify="center"
        spacing={{ base: 4, lg: 10 }}
        py={10}
      >
        <Box
          mb={4}
          shadow="base"
          borderWidth="1px"
          alignSelf={{ base: 'center', lg: 'flex-start' }}
          borderColor={borderColor}
          borderRadius={'xl'}
        >
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl" color={'white'}>
              GPT3.5使用次数100次
            </Text>
            <HStack justifyContent="center" color={'white'}>
              <Text fontSize="4xl" fontWeight="900">
                {exchangeRule.exchangePerGpt3Count * 100}
              </Text>
              <Text fontSize="2xl" color="cyan.200">
                积分
              </Text>
            </HStack>
          </Box>
          <VStack py={4} borderBottomRadius={'xl'}>
            <Box w="60%">
              <Button
                w="full"
                bgGradient="linear(to-l, rgb(29, 147, 171), #ced514)"
                _hover={{
                  bg: 'linear(to-l, #2d9164, #131f62)',
                }}
                onClick={() => {
                  exchangePoints({
                    exchangeType: ExchangeType.GPT3,
                    points: exchangeRule.exchangePerGpt3Count * 100,
                  })
                    .then((res) => {
                      toast({
                        title: res.message,
                        status: 'success',
                        duration: 1000,
                        isClosable: true,
                      });
                    })
                    .catch((err) => {
                      toast({
                        title: `积分兑换失败，${err.message}`,
                        status: 'error',
                        duration: 1000,
                        isClosable: true,
                      });
                    });
                }}
              >
                立即兑换
              </Button>
            </Box>
          </VStack>
        </Box>
        <Box
          mb={4}
          shadow="base"
          borderWidth="1px"
          alignSelf={{ base: 'center', lg: 'flex-start' }}
          borderColor={borderColor}
          borderRadius={'xl'}
        >
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl" color={'white'}>
              GPT4使用次数100次
            </Text>
            <HStack justifyContent="center" color={'white'}>
              <Text fontSize="4xl" fontWeight="900">
                {exchangeRule.exchangePerGpt4Count * 100}
              </Text>
              <Text fontSize="2xl" color="cyan.200">
                积分
              </Text>
            </HStack>
          </Box>
          <VStack py={4} borderBottomRadius={'xl'}>
            <Box w="60%">
              <Button
                w="full"
                bgGradient="linear(to-l, rgb(29, 147, 171), #ced514)"
                _hover={{
                  bg: 'linear(to-l, #2d9164, #131f62)',
                }}
                onClick={() => {
                  exchangePoints({
                    exchangeType: ExchangeType.GPT4,
                    points: exchangeRule.exchangePerGpt4Count * 100,
                  })
                    .then((res) => {
                      toast({
                        title: res.message,
                        status: 'success',
                        duration: 1000,
                        isClosable: true,
                      });
                    })
                    .catch((err) => {
                      toast({
                        title: `积分兑换失败，${err.message}`,
                        status: 'error',
                        duration: 1000,
                        isClosable: true,
                      });
                    });
                }}
              >
                立即兑换
              </Button>
            </Box>
          </VStack>
        </Box>
        {user?.vipType === 2 &&
          new Date().getTime() <=
            new Date(
              user.validateDate[0],
              user.validateDate[1] - 1,
              user.validateDate[2],
              user.validateDate[3],
              user.validateDate[4],
              user.validateDate[5],
            ).getTime() && (
            <Box
              mb={4}
              shadow="base"
              borderWidth="1px"
              alignSelf={{ base: 'center', lg: 'flex-start' }}
              borderColor={borderColor}
              borderRadius={'xl'}
            >
              <Box py={4} px={12}>
                <Text fontWeight="500" fontSize="2xl" color={'white'}>
                  包月延长5天
                </Text>
                <HStack justifyContent="center" color={'white'}>
                  <Text fontSize="4xl" fontWeight="900">
                    {exchangeRule.exchangePerHour * 24 * 5}
                  </Text>
                  <Text fontSize="2xl" color="cyan.200">
                    积分
                  </Text>
                </HStack>
              </Box>
              <VStack py={4} borderBottomRadius={'xl'}>
                <Box w="60%">
                  <Button
                    w="full"
                    bgGradient="linear(to-l, rgb(29, 147, 171), #ced514)"
                    _hover={{
                      bg: 'linear(to-l, #2d9164, #131f62)',
                    }}
                    onClick={() => {
                      exchangePoints({
                        exchangeType: ExchangeType.HOURS,
                        points: exchangeRule.exchangePerHour * 24 * 5,
                      })
                        .then((res) => {
                          toast({
                            title: res.message,
                            status: 'success',
                            duration: 1000,
                            isClosable: true,
                          });
                        })
                        .catch((err) => {
                          toast({
                            title: `积分兑换失败，${err.message}`,
                            status: 'error',
                            duration: 1000,
                            isClosable: true,
                          });
                        });
                    }}
                  >
                    立即兑换
                  </Button>
                </Box>
              </VStack>
            </Box>
          )}
      </Stack>
    </Box>
  );
}
