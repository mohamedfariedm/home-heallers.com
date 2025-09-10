'use client';
import SettingsForm from '@/components/SettingsForm';
import Spinner from '@/components/ui/spinner';
import { useSettings, useUpdateSettings } from '@/framework/site-settings';
import { Settings } from '@/types/settings';

export default function SettingsPage() {
  const { data, isLoading } = useSettings();
    const { mutate: update, isPending } = useUpdateSettings();
  
  console.log(data?.data[0].setting);
const handleSave = async (settings: Settings) => {
  console.log('Saving settings:', settings);
  update(
    { setting: settings }
  );
};


  return (
    <>
      {isLoading ? (
        <div className="m-auto">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <SettingsForm  onSave={handleSave} initialSettings={data?.data[0].setting} />
        </>
      )}
    </>
  );
}
