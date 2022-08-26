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
      font: 'bold 1.2em league-spartan',
      color: '#17191C',
      letterSpacing: '0.5px',

    }
  }
}

export const getTheme = () => {
  return THEME;
}
