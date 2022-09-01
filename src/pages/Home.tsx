import { Button, useMantineColorScheme } from "@mantine/core";

export const Home = () => {
  const { toggleColorScheme } = useMantineColorScheme();

  return (
    <>
      <h1>Home</h1>
      <Button variant='filled' onClick={() => toggleColorScheme()}>Toggle Theme</Button>
    </>
  );
};