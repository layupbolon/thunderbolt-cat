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
  Image,
  useToast,
  Input,
  InputGroup,
  InputRightAddon,
  List,
  ListIcon,
  ListItem,
} from '@chakra-ui/react';
import { FaCheckCircle } from 'react-icons/fa';
import { Header } from '../../components/header/Header';
import {
  getInviteUrl,
  getPackageList,
  getPayUrl,
  getUserByAccount,
} from '../../aigc-tools-requests';
import { PackageInfo } from '@/app/aigc-typings';
import { PAY_PLAN_ID, USER_INFO_STORAGE_KEY } from '@/app/constant';
import { copyToClipboard } from '@/app/utils';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';

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

export default function Invite() {
  const [inviteUrl, setInviteUrl] = useState<string>();
  const [inviteQrCode, setInviteQrCode] = useState<string>();
  const toast = useToast();

  useEffect(() => {
    getUserByAccount()
      .then((res) => {
        getInviteUrl(res.result.account).then((res) => {
          setInviteUrl(res.result.inviteUrl);
          setInviteQrCode(res.result.qrCode);
        });
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  const gray = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box
      padding={'10rem 0'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      minH={'100%'}
      minW={'100%'}
    >
      <Header back />
      <VStack spacing={2} textAlign="center" mb="2rem">
        <Heading as="h1" fontSize="4xl">
          邀请好友
        </Heading>
        {/* <Text fontSize="lg" color={'gray.500'}>
          让霹雳猫陪伴您度过每个有趣、愉快的时刻，享受智能科技带来的无限可能！
        </Text> */}
      </VStack>
      {inviteUrl && (
        <Stack direction={'row'} justify={'center'} spacing={6}>
          <Stack spacing={0} align={'center'}>
            <VStack spacing={2} textAlign="center" mb="2rem">
              <Text fontSize="md" fontWeight="600">
                专属邀请链接：
              </Text>
              <InputGroup size="lg">
                <Input size="lg" value={inviteUrl} isReadOnly css={{ width: '20rem' }} />
                <InputRightAddon
                  onClick={() => {
                    copyToClipboard(inviteUrl);
                  }}
                >
                  <CopyIcon _hover={{ cursor: 'pointer' }} />
                </InputRightAddon>
              </InputGroup>
            </VStack>

            <VStack spacing={2} textAlign="center" style={{ marginBottom: '2rem' }}>
              <Text fontSize="md" fontWeight="600">
                专属邀请二维码：
              </Text>
              <Image src={`data:image/gif;base64,${inviteQrCode}`} alt="invite qrcode" />
            </VStack>

            <VStack spacing={2} mb="2rem">
              <Text fontSize="md" fontWeight="600">
                邀请规则：
              </Text>
              <List spacing={1}>
                <ListItem>
                  1. 次数用户每邀请一个新用户，且新用户开通 vip
                  （包月，或者购买次数包），将增加100次
                </ListItem>
                <ListItem>
                  2. 包月用户每邀请一个新用户，且新用户开通 vip
                  （包月，或者购买次数包），使用有效期将增加5天
                </ListItem>
              </List>
            </VStack>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
