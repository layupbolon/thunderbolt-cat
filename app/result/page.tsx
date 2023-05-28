'use client';

import { CheckCircleIcon } from '@chakra-ui/icons';
import { Box, Center, Heading, Spinner, Text } from '@chakra-ui/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { payNotify } from '../aigc-tools-requests';
import { PAY_PLAN_ID, USER_INFO_STORAGE_KEY } from '../constant';

export default function PayResult() {
  const [success, setSuccess] = useState<boolean>(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  console.log('trade_no: ', searchParams.get('trade_no'));
  console.log('out_trade_no: ', searchParams.get('out_trade_no'));

  useEffect(() => {
    const trade_no = searchParams.get('trade_no');
    const out_trade_no = searchParams.get('out_trade_no');
    const plan_id = window.localStorage.getItem(PAY_PLAN_ID);
    const account = JSON.parse(
      window.localStorage.getItem(USER_INFO_STORAGE_KEY) ?? '{}',
    )?.account;
    if (!trade_no || !out_trade_no || !plan_id || !account) {
      return;
    }
    // payNotify({
    //   trade_no,
    //   out_trade_no,
    //   plan_id,
    //   account,
    // }).then((res) => {
    //   setSuccess(true);
    //   setTimeout(() => {
    //     router.replace('/');
    //   }, 3000);
    // });

    setTimeout(() => {
      router.replace('/');
    }, 3000);
  }, [router, searchParams]);

  return (
    <Center>
      <Box textAlign="center" py={10} px={6}>
        {success ? (
          <>
            <CheckCircleIcon boxSize={'50px'} color={'green.500'} />
            <Heading as="h2" size="xl" mt={6} mb={2} color="white">
              充值成功，将自动跳转...
            </Heading>
          </>
        ) : (
          <>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
            <Heading as="h2" size="xl" mt={6} mb={2} color="white">
              正在检查充值结果...
            </Heading>
            <Text color={'gray.500'}>请勿关闭此页面，否则可能导致充值失败</Text>
          </>
        )}
      </Box>
    </Center>
  );
}
