import type { Metadata } from 'next';
import PlatformApp from './platform-app';

export const metadata: Metadata = {
  title: 'IELTS Course',
  description: 'A clear step-by-step IELTS course in English, Kazakh, and Russian.',
};

export default function IeltsGuidePage() {
  return <PlatformApp />;
}
