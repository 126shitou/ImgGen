import { Metadata } from 'next';
import GalleryPage from '@/components/gallery/gallery-page';

 export const metadata: Metadata = {
  title: 'Image Gallery - ImageGen Portal',
  description: 'Browse AI-generated images created by our community',
};

export default function Gallery() {
  return <GalleryPage />;
}