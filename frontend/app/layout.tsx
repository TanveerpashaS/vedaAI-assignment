import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import StoreProvider from '@/components/providers/StoreProvider';

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description: 'Create AI-powered assessments for your students',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '12px',
              fontSize: '13px',
              padding: '10px 14px',
            },
          }}
        />
      </body>
    </html>
  );
}
