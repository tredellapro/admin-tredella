'use client';

import { useState } from 'react';
import PageHeading from 'components/console/PageHeading';
import Tabs from 'components/ui/Tabs';
import ProfileTab from 'components/settings/ProfileTab';
import SecurityTab from 'components/settings/SecurityTab';

export default function SettingsPage() {
  const [tab, setTab] = useState('PROFILE');

  return (
    <>
      <PageHeading
        title="Settings"
        trail={[{ label: 'Settings' }, { label: 'Settings' }]}
      />

      <div className="pb-5">
        <Tabs
          label="Settings sections"
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'PROFILE', label: 'Profile Management' },
            { value: 'ACCOUNT', label: 'Account Management' }
          ]}
        />
      </div>

      {tab === 'PROFILE' ? <ProfileTab /> : <SecurityTab />}
    </>
  );
}
