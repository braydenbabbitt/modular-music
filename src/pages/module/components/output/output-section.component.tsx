import { Title, useMantineTheme } from '@mantine/core';

export const OutputSection = () => {
  const mantineTheme = useMantineTheme();

  return (
    <section css={{ marginTop: mantineTheme.spacing.md }}>
      <Title order={3}>Output:</Title>
    </section>
  );
};
