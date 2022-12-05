import { ReactNode } from 'react';
import { Container, Paper } from '@mantine/core';
import { theme } from '../../theme';

type PageProps = {
  children: ReactNode;
};

export const PageContainer = ({ children }: PageProps) => {
  return (
    <Paper
      css={{
        minHeight: `calc(100vh - ${theme.sizes.headerHeight}px)`,
        borderRadius: 0,
        padding: theme.sizes.pagePadding,
        zIndex: 0,
      }}
    >
      <Container size={theme.sizes.innerMaxWidth} px={0}>
        {children}
      </Container>
    </Paper>
  );
};
