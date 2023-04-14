'use client';

/* eslint-disable @next/next/no-page-custom-font */
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, DarkMode } from '@chakra-ui/react';
import './styles/globals.scss';
import './styles/markdown.scss';
import './styles/highlight.scss';

// export const metadata = {
//   title: "聊天熊猫",
//   description:
//     "聊天熊猫,ChatGPT国内版,AI中文智能对话,ChatGPT免登录,ChatGPT免注册,与Ai对话",
//   keywords:
//     "聊天熊猫,ChatGPT,人工智能ChatGPT,聊天机器人ChatGPT,ChatGPT免费,ChatGPT在线体验,ChatGPT官网,ChatGPT登录,ChatGPT注册,ChatGPT地址,AI Chat",
//   appleWebApp: {
//     title: "聊天熊猫",
//     statusBarStyle: "black-translucent",
//   },
//   themeColor: "#fafafa",
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
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
            <DarkMode>{children}</DarkMode>
          </ChakraProvider>
        </CacheProvider>
      </body>
    </html>
  );
}
