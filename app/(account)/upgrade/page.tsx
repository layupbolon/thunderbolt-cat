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
import { getPackageList, getPayUrl, getUserByToken } from '../../aigc-tools-requests';
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
    getPackageList().then((res) => {
      setPackages(res.result);
    });
    getUserByToken().then((res) => {
      window.localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(res.result));
    });
  }, []);

  const gray = useColorModeValue('gray.50', 'gray.800');

  const renderPackages = useMemo(() => {
    return packages.map((pkg) => (
      <PriceWrapper key={pkg.id}>
        <Box py={4} px={12}>
          <Text fontWeight="500" fontSize="2xl">
            {pkg.planName}
          </Text>
          <HStack justifyContent="center">
            <Text fontSize="3xl" fontWeight="600">
              ￥
            </Text>
            <Text fontSize="5xl" fontWeight="900">
              {pkg.price}
            </Text>
            <Text fontSize="3xl" color="gray.500">
              /{pkg.count > 0 ? `${pkg.count}次` : pkg.day > 0 ? `${pkg.day}天` : 0}
            </Text>
          </HStack>
        </Box>
        <VStack bg={gray} py={4} borderBottomRadius={'xl'}>
          <List spacing={3} textAlign="start" px={12}>
            <ListItem>
              <ListIcon as={FaCheckCircle} color="green.500" />
              {pkg.planDescription}
            </ListItem>
            {/* <ListItem>
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
              variant="outline"
              colorScheme="teal"
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
  }, [gray, packages, toast]);

  return (
    <Box
      padding={'10rem 0'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      minH={'100%'}
      minW={'100%'}
    >
      <Header back />
      <VStack spacing={2} textAlign="center">
        <Heading as="h1" fontSize="4xl">
          购买套餐
        </Heading>
        <Text fontSize="lg" color={'gray.500'}>
          让霹雳猫陪伴您度过每个有趣、愉快的时刻，享受智能科技带来的无限可能！
        </Text>
      </VStack>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        textAlign="center"
        justify="center"
        spacing={{ base: 4, lg: 10 }}
        py={10}
      >
        {/* <PriceWrapper>
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl">
              月度包
            </Text>
            <HStack justifyContent="center">
              <Text fontSize="3xl" fontWeight="600">
                $
              </Text>
              <Text fontSize="5xl" fontWeight="900">
                39
              </Text>
              <Text fontSize="3xl" color="gray.500">
                /month
              </Text>
            </HStack>
          </Box>
          <VStack
            bg={useColorModeValue('gray.50', 'gray.800')}
            py={4}
            borderBottomRadius={'xl'}
          >
            <List spacing={3} textAlign="start" px={12}>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                unlimited build minutes
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Lorem, ipsum dolor.
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                5TB Lorem, ipsum dolor.
              </ListItem>
            </List>
            <Box w="80%" pt={7}>
              <Button w="full" variant="outline" colorScheme="teal">
                立即购买
              </Button>
            </Box>
          </VStack>
        </PriceWrapper>

        <PriceWrapper>
          <Box position="relative">
            <Box
              position="absolute"
              top="-16px"
              left="50%"
              style={{ transform: 'translate(-50%)' }}
            >
              <Text
                textTransform="uppercase"
                bg={useColorModeValue('red.300', 'red.700')}
                px={3}
                py={1}
                color={useColorModeValue('gray.900', 'gray.300')}
                fontSize="sm"
                fontWeight="600"
                rounded="xl"
              >
                推荐
              </Text>
            </Box>
            <Box py={4} px={12}>
              <Text fontWeight="500" fontSize="2xl">
                Growth
              </Text>
              <HStack justifyContent="center">
                <Text fontSize="3xl" fontWeight="600">
                  $
                </Text>
                <Text fontSize="5xl" fontWeight="900">
                  149
                </Text>
                <Text fontSize="3xl" color="gray.500">
                  /month
                </Text>
              </HStack>
            </Box>
            <VStack
              bg={useColorModeValue('gray.50', 'gray.800')}
              py={4}
              borderBottomRadius={'xl'}
            >
              <List spacing={3} textAlign="start" px={12}>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  unlimited build minutes
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  Lorem, ipsum dolor.
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  5TB Lorem, ipsum dolor.
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  5TB Lorem, ipsum dolor.
                </ListItem>
                <ListItem>
                  <ListIcon as={FaCheckCircle} color="green.500" />
                  5TB Lorem, ipsum dolor.
                </ListItem>
              </List>
              <Box w="80%" pt={7}>
                <Button w="full" colorScheme="teal">
                  立即购买
                </Button>
              </Box>
            </VStack>
          </Box>
        </PriceWrapper>
        <PriceWrapper>
          <Box py={4} px={12}>
            <Text fontWeight="500" fontSize="2xl">
              Scale
            </Text>
            <HStack justifyContent="center">
              <Text fontSize="3xl" fontWeight="600">
                $
              </Text>
              <Text fontSize="5xl" fontWeight="900">
                349
              </Text>
              <Text fontSize="3xl" color="gray.500">
                /month
              </Text>
            </HStack>
          </Box>
          <VStack
            bg={useColorModeValue('gray.50', 'gray.800')}
            py={4}
            borderBottomRadius={'xl'}
          >
            <List spacing={3} textAlign="start" px={12}>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                unlimited build minutes
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                Lorem, ipsum dolor.
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheckCircle} color="green.500" />
                5TB Lorem, ipsum dolor.
              </ListItem>
            </List>
            <Box w="80%" pt={7}>
              <Button w="full" variant="outline" colorScheme="teal">
                立即购买
              </Button>
            </Box>
          </VStack>
        </PriceWrapper> */}
        {renderPackages}
      </Stack>
    </Box>
  );
}
