import { Metadata } from 'next';
import GeneratorPage from '@/components/generate/generator-page';


export const metadata: Metadata = {
  title: 'Generate Images - ImageGen Portal',
  description: 'Create custom AI-generated images with our powerful tool',
};

export default function Generate() {
  return <GeneratorPage />;
}