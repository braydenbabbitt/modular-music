import React from 'react';
import { ProgramCard } from '../components/Cards';
import { Page } from '../components/Page';

export const ProgramsPage = () => {
  return (
    <Page>
      <h1>My Programs</h1>
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 10 }}>
        {[
          {
            name: 'Program 1',
            route: '/programs/program-1',
          },
          {
            name: 'Program 2',
            route: '/programs/program-2',
          },
          {
            name: 'Program 3',
            route: '/programs/program-3',
          },
          {
            name: 'Program 4',
            route: '/programs/program-4',
          },
        ].map((item) => {
          return <ProgramCard key={JSON.stringify(item)} name={item.name} route={item.route} />;
        })}
      </div>
    </Page>
  );
};
