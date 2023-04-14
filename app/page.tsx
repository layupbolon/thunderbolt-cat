import { Analytics } from '@vercel/analytics/react';
import { Landing } from './components/landing';

export default function App() {
  return (
    <>
      <Landing />
      <Analytics />
    </>
  );
}
