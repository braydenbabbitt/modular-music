import { MantineThemeOverride } from "@mantine/core";

const THEME = {
  colors: {
    primary: {
      main: '#1DBA53',
      dark: '#0E5827',
      light: '#69E895',
      shades: {
        10: '#072C14',
        20: '#0E5827',
        30: '#15843B',
        40: '#1CB04F',
        50: '#1DBA53',
        60: '#38E072',
        70: '#69E895',
        80: '#A7F1C0',
        90: '#D3F8E0',
        95: '#E9FCEF',
        99: '#FBFEFC'
      }
    },
    secondary: {
      main: '#3887C7',
      dark: '#163650',
      light: '#88B7DD',
      shades: {
        10: '#0B1B28',
        20: '#163650',
        30: '#225177',
        40: '#2D6C9F',
        50: '#3887C7',
        60: '#609FD2',
        70: '#88B7DD',
        80: '#AFCFE9',
        90: '#D7E7F4',
        95: '#EBF3F9',
        99: '#FBFDFE'
      }
    },
    danger: {
      main: '#D42B49',
      dark: '#55111D',
      light: '#E58092',
      shades: {
        10: '#2A090F',
        20: '#55111D',
        30: '#7F1A2C',
        40: '#AA223B',
        50: '#D42B49',
        60: '#DD556E',
        70: '#E58092',
        80: '#EEAAB6',
        90: '#F6D5DB',
        95: '#FBEAED',
        99: '#FEFBFB'
      }
    },
    neutrals: {
      shades: {
        0: '#000000',
        10: '#17191C',
        20: '#2E3338',
        30: '#454C54',
        40: '#5C6570',
        50: '#727E8D',
        60: '#8F98A3',
        70: '#ABB2BA',
        80: '#C7CCD1',
        90: '#E3E5E8',
        95: '#F1F2F4',
        99: '#FCFCFD',
        100: '#FFFFFF',
      }
    },
  },
  fonts: {
    navLink: {
      font: 'bold 1.75em league-spartan',
      color: '#17191C',
      letterSpacing: '1.25px',
      textDecoration: 'none',
      transition: 'color 0.15s',
      '&.active': {
        color: '#1DBA53'
      },
      '&:hover': {
        color: '#1DBA53',
      },
    },
    userName: {
      font: 'bold 1.6em league-spartan',
      color: '#17191C',
      letterSpacing: '0.75px',
      margin: '0',
      textDecoration: 'none',
    },
    userDropdownList: {
      font: 'normal 1.25em league-spartan',
      color: '#17191C',
      letterSpacing: '0.5px',

    }
  }
};

const MANTINE_THEME: MantineThemeOverride = {
  colors: {
    primary: ['#072C14', '#0E5827', '#15843B', '#1CB04F', '#1DBA53', '#38E072', '#69E895', '#A7F1C0', '#D3F8E0', '#E9FCEF'],
    secondary: ['#0B1B28', '#163650', '#225177', '#2D6C9F', '#3887C7', '#609FD2', '#88B7DD', '#AFCFE9', '#D7E7F4', '#EBF3F9'],
    danger: ['#2A090F', '#55111D', '#7F1A2C', '#AA223B', '#D42B49', '#DD556E', '#E58092', '#EEAAB6', '#F6D5DB', '#FBEAED'],
    neutrals: ['#17191C', '#2E3338', '#454C54', '#5C6570', '#727E8D', '#8F98A3', '#ABB2BA', '#C7CCD1', '#E3E5E8', '#F1F2F4'],
  },
  primaryColor: 'primary',
  primaryShade: { light: 4, dark: 7 },
  fontFamily: 'inter',
};

export const getTheme = () => {
  return MANTINE_THEME;
};
