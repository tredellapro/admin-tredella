'use client';

import { useState } from 'react';
import PageHeading from 'components/console/PageHeading';
import Tabs from 'components/ui/Tabs';
import ProfileTab from 'components/settings/ProfileTab';
import SecurityTab from 'components/settings/SecurityTab';
import TeamAccessTab from 'components/settings/TeamAccessTab';
import { useAccess } from 'components/console/AccessContext';

export default function SettingsPage() {
  const { view } = useAccess();
  const [tab, setTab] = useState('PROFILE');

  /* The team tab only exists for someone who can see it — an editor has no
     business knowing the screen is there. */
  const tabs = [
    { value: 'PROFILE', label: 'Profile Management' },
    { value: 'ACCOUNT', label: 'Account Management' },
    ...(view('team') ? [{ value: 'TEAM', label: 'Team Access' }] : [])
  ];

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
          tabs={tabs}
        />
      </div>

      {tab === 'PROFILE' && <ProfileTab />}
      {tab === 'ACCOUNT' && <SecurityTab />}
      {tab === 'TEAM' && view('team') && <TeamAccessTab />}
    </>
  );
}
