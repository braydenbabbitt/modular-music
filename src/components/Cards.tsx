import React from 'react';
import { createStyles, Paper } from '@mantine/core';
import { Link } from 'react-router-dom';

type ProgramCardProps = {
  name: string;
  route: string;
};

const useStyles = createStyles((theme) => ({
  wrapper: {
    backgroundColor: theme.fn.rgba(theme.colors.neutrals[theme.fn.primaryShade()], 0.25),
    padding: 15,
    // flexGrow: 1,
    width: '100%',
    transition: 'all 0.15s',
    ':hover': {
      // width: '100%',
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.fn.lighten(theme.colors.neutrals[theme.fn.primaryShade()], 0.1)
          : theme.fn.darken(theme.colors.neutrals[theme.fn.primaryShade()], 0.1),
    },
  },
}));

export const ProgramCard = ({ name, route }: ProgramCardProps) => {
  const { classes } = useStyles();

  return (
    <Paper className={classes.wrapper} shadow='sm' radius='md' component={Link} to={route}>
      {name}
    </Paper>
  );
};
