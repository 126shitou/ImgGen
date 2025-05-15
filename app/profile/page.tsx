import { Metadata } from 'next';
import ProfilePage from '@/components/profile/profile-page';

export const metadata: Metadata = {
  title: 'Your Profile - ImageGen Portal',
  description: 'Manage your account and view your generated images',
};

export default function Profile() {
  return <ProfilePage />;
}