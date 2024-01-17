import { usePageTitle } from '@libs/routing';
import { Title } from '@mantine/core';

const HomePage = () => {
  usePageTitle('Home');

  return <Title>Home here</Title>;
};

export default HomePage;
