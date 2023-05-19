'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Stack,
  HStack,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  Button,
  useToast,
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { Header } from '../../components/header/Header';
import {
  getPackageList,
  getPayUrl,
  getPointsExchangeRule,
  getUserByAccount,
} from '../../aigc-tools-requests';
import { PackageInfo } from '@/app/aigc-typings';
import { PAY_PLAN_ID, USER_INFO_STORAGE_KEY } from '@/app/constant';

function PriceWrapper({ children }: { children: ReactNode }) {
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: 'center', lg: 'flex-start' }}
      borderColor={useColorModeValue('gray.200', 'gray.500')}
      borderRadius={'xl'}
    >
      {children}
    </Box>
  );
}

export default function UpgradePackageList() {
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const toast = useToast();

  useEffect(() => {
    getPointsExchangeRule().then((res) => {
      console.log('res: ', res);
      // setPackages(res.result);
    });
    getUserByAccount()
      .then((res) => {
        window.localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(res.result));
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  const renderPackages = useMemo(() => {
    return packages.map((pkg) => (
      <PriceWrapper key={pkg.id}>
        <Box py={4} px={12}>
          <Text fontWeight="500" fontSize="2xl" color={'white'}>
            {pkg.planName}
          </Text>
          <HStack justifyContent="center" color={'white'}>
            <Text fontSize="2xl" fontWeight="600">
              ￥
            </Text>
            <Text fontSize="4xl" fontWeight="900">
              {pkg.price}
            </Text>
            <Text fontSize="2xl" color="cyan.200">
              /
              {pkg.type === 1 || pkg.type === 3
                ? `${pkg.count}次`
                : pkg.type === 2
                ? `${pkg.day}天`
                : 0}
            </Text>
          </HStack>
        </Box>
        <VStack py={4} borderBottomRadius={'xl'}>
          <List spacing={3} textAlign="start" px={12}>
            {pkg.planDescription.split(',').map((desc) => (
              <ListItem key={desc}>
                <ListIcon as={FaCheckCircle} color="green.500" />
                <Text color="white" display={'inline'}>
                  {desc}
                </Text>
              </ListItem>
            ))}
            {/* 
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              Lorem, ipsum dolor.
            </ListItem>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              5TB Lorem, ipsum dolor.
            </ListItem> */}
          </List>
          <Box w="80%" pt={7}>
            <Button
              w="full"
              bgGradient="linear(to-l, rgb(29, 147, 171), #ced514)"
              _hover={{
                bg: 'linear(to-l, #2d9164, #131f62)',
              }}
              onClick={() => {
                getPayUrl(pkg)
                  .then((res) => {
                    if (res && res.result) {
                      window.localStorage.setItem(PAY_PLAN_ID, pkg.id + '');
                      window.open(res.result);
                    }
                  })
                  .catch((err) => {
                    toast({
                      title: `获取支付链接失败，${err.message}`,
                      status: 'error',
                      duration: 1000,
                      isClosable: true,
                    });
                  });
              }}
            >
              立即购买
            </Button>
          </Box>
        </VStack>
      </PriceWrapper>
    ));
  }, [packages, toast]);

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
        {renderPackages}
      </Stack>
    </Box>
  );
}
