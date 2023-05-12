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
  CheckIn,
  getCheckIn,
  getCheckInRule,
  getUserByAccount,
  receivePoints,
} from '../../aigc-tools-requests';
import Gou from '@/app/icons/gou.svg';
import NotGou from '@/app/icons/notgou.svg';
import { CheckInInfo, CheckInRule } from '@/app/aigc-typings';

interface OneDayCheckInProps {
  checked: boolean;
}

interface CheckInItermProps {
  checkInInfo: CheckInInfo;
  checkInRule: CheckInRule;
}

const MondayCheckIn: React.FC<OneDayCheckInProps> = (props) => (
  <VStack>
    <Text color="white">周一</Text>
    {props.checked ? <Gou /> : <NotGou />}
  </VStack>
);
const TuesdayCheckIn: React.FC<OneDayCheckInProps> = (props) => (
  <VStack>
    <Text color="white">周二</Text>
    {props.checked ? <Gou /> : <NotGou />}
  </VStack>
);
const WednesdayCheckIn: React.FC<OneDayCheckInProps> = (props) => (
  <VStack>
    <Text color="white">周三</Text>
    {props.checked ? <Gou /> : <NotGou />}
  </VStack>
);
const ThursdayCheckIn: React.FC<OneDayCheckInProps> = (props) => (
  <VStack>
    <Text color="white">周四</Text>
    {props.checked ? <Gou /> : <NotGou />}
  </VStack>
);
const FridayCheckIn: React.FC<OneDayCheckInProps> = (props) => (
  <VStack>
    <Text color="white">周五</Text>
    {props.checked ? <Gou /> : <NotGou />}
  </VStack>
);
const SaturdayCheckIn: React.FC<OneDayCheckInProps> = (props) => (
  <VStack>
    <Text color="white">周六</Text>
    {props.checked ? <Gou /> : <NotGou />}
  </VStack>
);
const SundayCheckIn: React.FC<OneDayCheckInProps> = (props) => (
  <VStack>
    <Text color="white">周日</Text>
    {props.checked ? <Gou /> : <NotGou />}
  </VStack>
);

const SevenDayCheckIn: React.FC<CheckInItermProps> = (props) => {
  const toast = useToast();
  return (
    <HStack border="1px solid #dddddd" padding="1rem" borderRadius=".5rem" mb="1rem">
      <MondayCheckIn
        checked={
          props.checkInInfo.sevenDay === 1 ||
          (props.checkInInfo.sevenDay === 0 && props.checkInInfo.monday)
        }
      />
      <TuesdayCheckIn
        checked={
          props.checkInInfo.sevenDay === 1 ||
          (props.checkInInfo.sevenDay === 0 && props.checkInInfo.tuesday)
        }
      />
      <WednesdayCheckIn
        checked={
          props.checkInInfo.sevenDay === 1 ||
          (props.checkInInfo.sevenDay === 0 && props.checkInInfo.wednesday)
        }
      />
      <ThursdayCheckIn
        checked={
          props.checkInInfo.sevenDay === 1 ||
          (props.checkInInfo.sevenDay === 0 && props.checkInInfo.thursday)
        }
      />
      <FridayCheckIn
        checked={
          props.checkInInfo.sevenDay === 1 ||
          (props.checkInInfo.sevenDay === 0 && props.checkInInfo.friday)
        }
      />
      <SaturdayCheckIn
        checked={
          props.checkInInfo.sevenDay === 1 ||
          (props.checkInInfo.sevenDay === 0 && props.checkInInfo.saturday)
        }
      />
      <SundayCheckIn
        checked={
          props.checkInInfo.sevenDay === 1 ||
          (props.checkInInfo.sevenDay === 0 && props.checkInInfo.sunday)
        }
      />
      <Text color="white">
        累计签到
        <span
          style={{ color: 'rgb(29, 147, 171)', fontWeight: 'bold', fontSize: '1.5rem' }}
        >
          7
        </span>
        天
      </Text>
      <Button
        isDisabled={!props.checkInInfo.sevenDay}
        colorScheme="yellow"
        onClick={() => {
          receivePoints('SEVEN_DAY')
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
        积分+{props.checkInRule.sevenDay}
      </Button>
    </HStack>
  );
};
const FourteenDayCheckIn: React.FC<CheckInItermProps> = (props) => {
  const toast = useToast();
  return (
    <HStack border="1px solid #dddddd" padding="1rem" borderRadius=".5rem" mb="1rem">
      <MondayCheckIn
        checked={
          props.checkInInfo.fourteenDay === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 0 &&
            props.checkInInfo.monday)
        }
      />
      <TuesdayCheckIn
        checked={
          props.checkInInfo.fourteenDay === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 0 &&
            props.checkInInfo.tuesday)
        }
      />
      <WednesdayCheckIn
        checked={
          props.checkInInfo.fourteenDay === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 0 &&
            props.checkInInfo.wednesday)
        }
      />
      <ThursdayCheckIn
        checked={
          props.checkInInfo.fourteenDay === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 0 &&
            props.checkInInfo.thursday)
        }
      />
      <FridayCheckIn
        checked={
          props.checkInInfo.fourteenDay === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 0 &&
            props.checkInInfo.friday)
        }
      />
      <SaturdayCheckIn
        checked={
          props.checkInInfo.fourteenDay === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 0 &&
            props.checkInInfo.saturday)
        }
      />
      <SundayCheckIn
        checked={
          props.checkInInfo.fourteenDay === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 0 &&
            props.checkInInfo.sunday)
        }
      />
      <Text color="white">
        累计签到
        <span
          style={{ color: 'rgb(29, 147, 171)', fontWeight: 'bold', fontSize: '1.5rem' }}
        >
          14
        </span>
        天
      </Text>
      <Button
        colorScheme="yellow"
        isDisabled={
          !(props.checkInInfo.sevenDay === 1 && props.checkInInfo.fourteenDay === 1)
        }
        onClick={() => {
          receivePoints('FOUR_TEEN_DAY')
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
        积分+{props.checkInRule.fourteenDay}
      </Button>
    </HStack>
  );
};
const TwentyOneCheckIn: React.FC<CheckInItermProps> = (props) => {
  const toast = useToast();
  return (
    <HStack border="1px solid #dddddd" padding="1rem" borderRadius=".5rem" mb="1rem">
      <MondayCheckIn
        checked={
          props.checkInInfo.twentyOne === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 0 &&
            props.checkInInfo.monday)
        }
      />
      <TuesdayCheckIn
        checked={
          props.checkInInfo.twentyOne === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 0 &&
            props.checkInInfo.tuesday)
        }
      />
      <WednesdayCheckIn
        checked={
          props.checkInInfo.twentyOne === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 0 &&
            props.checkInInfo.wednesday)
        }
      />
      <ThursdayCheckIn
        checked={
          props.checkInInfo.twentyOne === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 0 &&
            props.checkInInfo.thursday)
        }
      />
      <FridayCheckIn
        checked={
          props.checkInInfo.twentyOne === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 0 &&
            props.checkInInfo.friday)
        }
      />
      <SaturdayCheckIn
        checked={
          props.checkInInfo.twentyOne === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 0 &&
            props.checkInInfo.saturday)
        }
      />
      <SundayCheckIn
        checked={
          props.checkInInfo.twentyOne === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 0 &&
            props.checkInInfo.sunday)
        }
      />
      <Text color="white">
        累计签到
        <span
          style={{ color: 'rgb(29, 147, 171)', fontWeight: 'bold', fontSize: '1.5rem' }}
        >
          21
        </span>
        天
      </Text>
      <Button
        colorScheme="yellow"
        isDisabled={
          !(
            props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 1
          )
        }
        onClick={() => {
          receivePoints('TWENTY_ONE')
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
        积分+{props.checkInRule.twentyOneDay}
      </Button>
    </HStack>
  );
};
const TwentyEightCheckIn: React.FC<CheckInItermProps> = (props) => {
  const toast = useToast();
  return (
    <HStack border="1px solid #dddddd" padding="1rem" borderRadius=".5rem" mb="1rem">
      <MondayCheckIn
        checked={
          props.checkInInfo.twentyEight === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 1 &&
            props.checkInInfo.twentyEight === 0 &&
            props.checkInInfo.monday)
        }
      />
      <TuesdayCheckIn
        checked={
          props.checkInInfo.twentyEight === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 1 &&
            props.checkInInfo.twentyEight === 0 &&
            props.checkInInfo.tuesday)
        }
      />
      <WednesdayCheckIn
        checked={
          props.checkInInfo.twentyEight === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 1 &&
            props.checkInInfo.twentyEight === 0 &&
            props.checkInInfo.wednesday)
        }
      />
      <ThursdayCheckIn
        checked={
          props.checkInInfo.twentyEight === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 1 &&
            props.checkInInfo.twentyEight === 0 &&
            props.checkInInfo.thursday)
        }
      />
      <FridayCheckIn
        checked={
          props.checkInInfo.twentyEight === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 1 &&
            props.checkInInfo.twentyEight === 0 &&
            props.checkInInfo.friday)
        }
      />
      <SaturdayCheckIn
        checked={
          props.checkInInfo.twentyEight === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 1 &&
            props.checkInInfo.twentyEight === 0 &&
            props.checkInInfo.saturday)
        }
      />
      <SundayCheckIn
        checked={
          props.checkInInfo.twentyEight === 1 ||
          (props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 1 &&
            props.checkInInfo.twentyEight === 0 &&
            props.checkInInfo.sunday)
        }
      />
      <Text color="white">
        累计签到
        <span
          style={{ color: 'rgb(29, 147, 171)', fontWeight: 'bold', fontSize: '1.5rem' }}
        >
          28
        </span>
        天
      </Text>
      <Button
        colorScheme="yellow"
        isDisabled={
          !(
            props.checkInInfo.sevenDay === 1 &&
            props.checkInInfo.fourteenDay === 1 &&
            props.checkInInfo.twentyOne === 1 &&
            props.checkInInfo.twentyEight === 1
          )
        }
        onClick={() => {
          receivePoints('TWENTY_EIGHT')
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
        积分+{props.checkInRule.twentyEightDay}
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
          连续签到可领取额外积分哦
          <Button
            size={'lg'}
            colorScheme={'teal'}
            w="8rem"
            mt="1.5rem"
            onClick={() => {
              CheckIn()
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
            <SevenDayCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            <FourteenDayCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            <TwentyOneCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
            <TwentyEightCheckIn checkInInfo={checkInInfo} checkInRule={checkInRule} />
          </Box>
        </Stack>
      ) : null}
    </Box>
  );
}
