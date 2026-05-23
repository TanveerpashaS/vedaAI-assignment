import AppLayout from '@/components/layout/AppLayout';

export default function SettingsPage() {
  return (
    <AppLayout topbarTitle="Settings" showBack>
      <div className="p-6 flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Settings</h2>
          <p className="text-gray-500">Coming soon</p>
        </div>
      </div>
    </AppLayout>
  );
}
