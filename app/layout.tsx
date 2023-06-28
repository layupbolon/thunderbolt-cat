'use client';

/* eslint-disable @next/next/no-page-custom-font */
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, DarkMode } from '@chakra-ui/react';
import './styles/globals.scss';
import './styles/markdown.scss';
import './styles/highlight.scss';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="description"
          content="霹雳猫, AI中文智能对话, AI绘画, 与AI对话"
        ></meta>
        <meta name="keywords" content="霹雳猫 人工智能 聊天机器人 AI Chat 绘画"></meta>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <title>霹雳猫</title>
        <meta name="theme-color" content="#151515" media="(prefers-color-scheme: dark)" />
        <link rel="manifest" href="/site.webmanifest"></link>
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        ></link>
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>
        <CacheProvider>
          <ChakraProvider>
            {/* <DarkMode>{children}</DarkMode> */}
            {children}
          </ChakraProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
