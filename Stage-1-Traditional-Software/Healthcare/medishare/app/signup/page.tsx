import { Suspense } from 'react';
import { AuthForm } from '@/components/auth-form';

export const metadata = { title: 'Sign up — MedShare' };

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
