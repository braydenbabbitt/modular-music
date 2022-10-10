import React from 'react';
import { ColorSchemeToggle } from '../components/ColorSchemeToggle';
import { Page } from '../components/Page';

export const Settings = () => {
  return (
    <Page>
      <h1>Settings</h1>
      <ColorSchemeToggle />
    </Page>
  );
};
