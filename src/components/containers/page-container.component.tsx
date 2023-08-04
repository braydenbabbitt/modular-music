import { ReactNode } from 'react';
import { Container, Paper } from '@mantine/core';
import { theme } from '../../theme';

type PageProps = {
  children: ReactNode;
  dontAdjustForHeader?: boolean;
};

export const PageContainer = ({ children, dontAdjustForHeader }: PageProps) => {
  return (
    <Paper
      css={{
        height: dontAdjustForHeader ? '100vh' : undefined,
        minHeight: `calc(100vh - ${theme.sizes.headerHeight}px)`,
        borderRadius: 0,
        padding: theme.sizes.pagePadding,
        zIndex: 0,
      }}
    >
      <Container css={{ height: '100%' }} size={theme.sizes.innerMaxWidth} px={0}>
        {children}
      </Container>
    </Paper>
  );
};
