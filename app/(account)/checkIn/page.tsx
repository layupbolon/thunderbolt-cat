'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Stack,
  HStack,
  Heading,
  Text,
  VStack,
  Button,
  useToast,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import { Header } from '../../components/header/Header';
import {
  checkIn,
  getCheckIn,
  getCheckInRule,
  getUserByAccount,
  receivePoints,
} from '../../aigc-tools-requests';
import Gou from '@/app/icons/gou.svg';
import NotGou from '@/app/icons/notgou.svg';
import { CheckInInfo, CheckInRule } from '@/app/aigc-typings';

interface CheckInItermProps {
  checkInInfo: CheckInInfo;
  checkInRule: CheckInRule;
}

const DaylyCheckIn: React.FC<{
  checked: boolean;
  title: string;
}> = (props) => (
  <VStack spacing={1}>
    <Text color="whiteAlpha.600">{props.title}</Text>
    {props.checked ? <Gou /> : <NotGou />}
  </VStack>
);

const WeeklyCheckIn: React.FC<CheckInItermProps> = (props) => (
  <HStack>
    <DaylyCheckIn checked={props.checkInInfo.monday} title="周一" />
    <DaylyCheckIn checked={props.checkInInfo.tuesday} title="周二" />
    <DaylyCheckIn checked={props.checkInInfo.wednesday} title="周三" />
    <DaylyCheckIn checked={props.checkInInfo.thursday} title="周四" />
    <DaylyCheckIn checked={props.checkInInfo.friday} title="周五" />
    <DaylyCheckIn checked={props.checkInInfo.saturday} title="周六" />
    <DaylyCheckIn checked={props.checkInInfo.sunday} title="周日" />
  </HStack>
);

const ConsecutiveSevenDayCheckIn: React.FC<CheckInItermProps> = (props) => {
  const toast = useToast();
  return (
    <HStack border="1px solid #dddddd" padding="1rem" borderRadius=".5rem" mb="1rem">
      <VStack>
        <Text color="white">连续签到7天，积分+{props.checkInRule.continueSeven}</Text>
        <WeeklyCheckIn {...props} />
      </VStack>

      <Button
        isDisabled={
          !props.checkInInfo.monday ||
          !props.checkInInfo.tuesday ||
          !props.checkInInfo.wednesday ||
          !props.checkInInfo.thursday ||
          !props.checkInInfo.friday ||
          !props.checkInInfo.saturday ||
          !props.checkInInfo.sunday
        }
        colorScheme="yellow"
        onClick={() => {
          receivePoints(0)
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
                title: err.message,
                status: 'error',
                duration: 1000,
                isClosable: true,
              });
            });
        }}
      >
        领积分
      </Button>
    </HStack>
  );
};

const SevenDayCheckIn: React.FC<CheckInItermProps> = (props) => {
  const toast = useToast();
  return (
    <HStack
      border="1px solid #dddddd"
      padding="1rem"
      borderRadius=".5rem"
      mb="1rem"
      justifyContent={'space-between'}
    >
      <Text color="white">累计签到7天，积分+{props.checkInRule.sevenDay}</Text>
      <Button
        isDisabled={
          !(
            (props.checkInInfo.sevenDay === 7)
            // &&
            // props.checkInInfo.fourteenDay === 7 &&
            // props.checkInInfo.twentyOne === 7 &&
            // props.checkInInfo.twentyEight === 7
          )
        }
        colorScheme="yellow"
        onClick={() => {
          receivePoints(1)
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
                title: err.message,
                status: 'error',
                duration: 1000,
                isClosable: true,
              });
            });
        }}
      >
        {props.checkInInfo.sevenDay < 7 && props.checkInInfo.fourteenDay >= 7
          ? '已领取'
          : `${props.checkInInfo.sevenDay}/7`}
      </Button>
    </HStack>
  );
};
const FourteenDayCheckIn: React.FC<CheckInItermProps> = (props) => {
  const toast = useToast();
  return (
    <HStack
      border="1px solid #dddddd"
      padding="1rem"
      borderRadius=".5rem"
      mb="1rem"
      justifyContent={'space-between'}
    >
      <Text color="white">累计签到14天，积分+{props.checkInRule.fourteenDay}</Text>
      <Button
        colorScheme="yellow"
        isDisabled={
          !(
            (props.checkInInfo.fourteenDay === 14)
            // &&
            // props.checkInInfo.twentyOne === 14 &&
            // props.checkInInfo.twentyEight === 14
          )
        }
        onClick={() => {
          receivePoints(2)
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
                title: err.message,
                status: 'error',
                duration: 1000,
                isClosable: true,
              });
            });
        }}
      >
        {props.checkInInfo.fourteenDay < 14 && props.checkInInfo.twentyOne >= 14
          ? '已领取'
          : `${props.checkInInfo.fourteenDay}/14`}
      </Button>
    </HStack>
  );
};
const TwentyOneCheckIn: React.FC<CheckInItermProps> = (props) => {
  const toast = useToast();
  return (
    <HStack
      border="1px solid #dddddd"
      padding="1rem"
      borderRadius=".5rem"
      mb="1rem"
      justifyContent={'space-between'}
    >
      <Text color="white">累计签到21天，积分+{props.checkInRule.twentyOneDay}</Text>
      <Button
        colorScheme="yellow"
        isDisabled={
          !(
            (props.checkInInfo.twentyOne === 21)
            // && props.checkInInfo.twentyEight === 21
          )
        }
        onClick={() => {
          receivePoints(3)
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
                title: err.message,
                status: 'error',
                duration: 1000,
                isClosable: true,
              });
            });
        }}
      >
        {props.checkInInfo.twentyOne < 21 && props.checkInInfo.twentyEight >= 21
          ? '已领取'
          : `${props.checkInInfo.twentyOne}/21`}
      </Button>
    </HStack>
  );
};
const TwentyEightCheckIn: React.FC<CheckInItermProps> = (props) => {
  const toast = useToast();
  return (
    <HStack
      border="1px solid #dddddd"
      padding="1rem"
      borderRadius=".5rem"
      mb="1rem"
      justifyContent={'space-between'}
    >
      <Text color="white">累计签到28天，积分+{props.checkInRule.twentyEightDay}</Text>
      <Button
        colorScheme="yellow"
        isDisabled={props.checkInInfo.twentyEight < 28}
        onClick={() => {
          receivePoints(4)
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
                title: err.message,
                status: 'error',
                duration: 1000,
                isClosable: true,
              });
            });
        }}
      >
        {props.checkInInfo.twentyEight}/28
      </Button>
    </HStack>
  );
};

export default function UpgradePackageList() {
  const [checkInInfo, setCheckInInfo] = useState<CheckInInfo>();
  const [checkInRule, setCheckInRule] = useState<CheckInRule>();
  const [loading, setLoading] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    getUserByAccount()
      .then((res) =>
        Promise.all([getCheckIn(res.result.account), getCheckInRule()])
          .then(([getCheckInResult, getCheckInRuleResult]) => {
            setCheckInInfo(getCheckInResult.result);
            setCheckInRule(
              getCheckInRuleResult.result[`vip${res.result.vipType as 0 | 1 | 2}`],
            );
          })
          .catch((err) => {
            toast({
              title: `获取签到信息失败，${err.message}`,
              status: 'error',
              duration: 1000,
              isClosable: true,
            });
          }),
      )
      .catch(() => {
        window.location.href = '/login';
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Box
      padding={'0 0 3rem'}
      display={'flex'}
      flexDirection={'column'}
      alignItems="center"
    >
      <Header back />
      <VStack spacing={2} textAlign="center" mt={'4rem'}>
        <Heading
          as="h1"
          fontSize="4xl"
          display={'flex'}
          flexDirection="column"
          alignItems={'center'}
        >
          累计签到可领取额外积分哦
          <Button
            size={'lg'}
            colorScheme={'teal'}
            w="8rem"
            mt="1.5rem"
            onClick={() => {
              checkIn()
                .then((res) => {
                  toast({
                    title: res.message,
                    status: 'success',
                    duration: 1000,
                    isClosable: true,
                  });
                  if (+res.code === 1) {
                    window.location.reload();
                  }
                })
                .catch((err) => {
                  toast({
                    title: `签到失败，${err.message}`,
                    status: 'error',
                    duration: 1000,
                    isClosable: true,
                  });
                });
            }}
          >
            签 到
          </Button>
        </Heading>
      </VStack>
      {loading ? (
        <Flex justifyContent={'center'} alignItems={'center'} padding={'3rem'}>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Flex>
      ) : checkInInfo && checkInRule ? (
        <Stack
          wrap={'wrap'}
          direction={{ base: 'column', md: 'row' }}
          spacing={{ base: 4, lg: 10 }}
          py={10}
        >
          <Box>
            <ConsecutiveSevenDayCheckIn
              checkInInfo={checkInInfo}
              checkInRule={checkInRule}
            />
            <SevenDayCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            <FourteenDayCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            <TwentyOneCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            <TwentyEightCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            {/* {checkInInfo.sevenDay > 0 && checkInInfo.sevenDay <= 7 && (
              <SevenDayCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            )}
            {checkInInfo.fourteenDay > 7 && checkInInfo.fourteenDay <= 14 && (
              <FourteenDayCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            )}
            {checkInInfo.twentyOne > 14 && checkInInfo.twentyOne <= 21 && (
              <TwentyOneCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            )}
            {checkInInfo.twentyEight > 21 && checkInInfo.twentyEight <= 28 && (
              <TwentyEightCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            )} */}
          </Box>
        </Stack>
      ) : null}
    </Box>
  );
}
