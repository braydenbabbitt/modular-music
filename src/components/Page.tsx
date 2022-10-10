import React from 'react';
import { createStyles } from '@mantine/core';
import { PropsWithChildren } from 'react';
import { Property } from 'csstype';

const useStyles = createStyles((theme) => ({
  pageWrapper: {
    flex: '1',
    padding: '15px',
  },
  contentWrapper: {
    maxWidth: '1440px',
    margin: '0 auto',
  },
}));

type PageProps = PropsWithChildren & {
  style?: React.CSSProperties;
  padding?: Property.Padding;
};

export const Page = ({ children, style, padding }: PageProps) => {
  const { classes } = useStyles();
  const customizableStyles: React.CSSProperties = {
    ...style,
    padding: padding ?? '15px',
  };

  return (
    <main className={classes.pageWrapper} style={customizableStyles}>
      <div className={classes.contentWrapper}>{children}</div>
    </main>
  );
};
