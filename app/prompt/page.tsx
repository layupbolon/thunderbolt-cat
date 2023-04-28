'use client';

import { VStack, Heading, Box, Text } from '@chakra-ui/react';
import { Header } from '../components/header/Header';
import { Prompts } from '../components/prompts/PromptsList';

export default function PromptPage() {
  return (
    <Box padding={'6rem 0 3rem'} display={'flex'} flexDirection={'column'}>
      <Header back />
      <VStack spacing={2} textAlign="center">
        <Heading as="h1" fontSize="4xl">
          快捷指令
        </Heading>
        <Text fontSize="lg" color={'gray.500'}>
          让生产力加倍的快捷指令
        </Text>
      </VStack>
      <Prompts />
    </Box>
  );
}
