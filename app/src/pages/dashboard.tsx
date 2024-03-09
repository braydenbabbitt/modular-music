import { SupabaseModules } from '@libs/supabase';
import { Code, Loader } from '@mantine/core';

const DashboardPage = () => {
  const modulesQuery = SupabaseModules.Queries.useUserModules();

  return (
    <>
      <h1>Dashboard</h1>
      {modulesQuery.isLoading ? (
        <Loader />
      ) : modulesQuery.data ? (
        <Code block css={{ width: 'max-content' }}>
          {JSON.stringify(modulesQuery.data, null, 2)}
        </Code>
      ) : null}
    </>
  );
};

export default DashboardPage;
