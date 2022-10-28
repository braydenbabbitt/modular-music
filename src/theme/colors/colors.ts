import { ColorScheme } from '@mantine/core';
const primary = {
  90: '#072C14',
  80: '#0E5827',
  70: '#15843B',
  60: '#1CB04F',
  50: '#1DBA53',
  40: '#38E072',
  30: '#69E895',
  20: '#A7F1C0',
  10: '#D3F8E0',
  5: '#E9FCEF',
} as const;

const neutral = {
  90: '#17191C',
  80: '#2E3338',
  70: '#454C54',
  60: '#5C6570',
  50: '#727E8D',
  40: '#8F98A3',
  30: '#ABB2BA',
  20: '#C7CCD1',
  10: '#E3E5E8',
  5: '#F1F2F4',
} as const;

const danger = {
  90: '#2A090F',
  80: '#55111D',
  70: '#7F1A2C',
  60: '#AA223B',
  50: '#D42B49',
  40: '#DD556E',
  30: '#E58092',
  20: '#EEAAB6',
  10: '#F6D5DB',
  5: '#FBEAED',
} as const;

const shades = {
  dark: {
    default: 50,
    light: 30,
    dark: 70,
  },
  light: {
    default: 50,
    light: 70,
    dark: 30,
  },
};

type getShadeProps = {
  colorScheme: ColorScheme;
  color: 'primary' | 'neutral' | 'danger';
};

// const getShade = ({ colorScheme, color }: getShadeProps) => {
//   return colors[color][shades[colorScheme].default];
// };

export const colors = {
  primary,
  neutral,
  danger,
  // getShade,
  primary90: primary[90],
  primary80: primary[80],
  primary70: primary[70],
  primary60: primary[60],
  primary50: primary[50],
  primary40: primary[40],
  primary30: primary[30],
  primary20: primary[20],
  primary10: primary[10],
  primary5: primary[5],
  neutral90: neutral[90],
  neutral80: neutral[80],
  neutral70: neutral[70],
  neutral60: neutral[60],
  neutral50: neutral[50],
  neutral40: neutral[40],
  neutral30: neutral[30],
  neutral20: neutral[20],
  neutral10: neutral[10],
  neutral5: neutral[5],
  danger90: danger[90],
  danger80: danger[80],
  danger70: danger[70],
  danger60: danger[60],
  danger50: danger[50],
  danger40: danger[40],
  danger30: danger[30],
  danger20: danger[20],
  danger10: danger[10],
  danger5: danger[5],
};
const MANTINE_THEME = {
  colors: {
    primary: [
      '#072C14',
      '#0E5827',
      '#15843B',
      '#1CB04F',
      '#1DBA53',
      '#38E072',
      '#69E895',
      '#A7F1C0',
      '#D3F8E0',
      '#E9FCEF',
    ],
    secondary: [
      '#0B1B28',
      '#163650',
      '#225177',
      '#2D6C9F',
      '#3887C7',
      '#609FD2',
      '#88B7DD',
      '#AFCFE9',
      '#D7E7F4',
      '#EBF3F9',
    ],
    danger: [
      '#2A090F',
      '#55111D',
      '#7F1A2C',
      '#AA223B',
      '#D42B49',
      '#DD556E',
      '#E58092',
      '#EEAAB6',
      '#F6D5DB',
      '#FBEAED',
    ],
    neutrals: [
      '#17191C',
      '#2E3338',
      '#454C54',
      '#5C6570',
      '#727E8D',
      '#8F98A3',
      '#ABB2BA',
      '#C7CCD1',
      '#E3E5E8',
      '#F1F2F4',
    ],
  },
  primaryColor: 'primary',
  primaryShade: { light: 5, dark: 3 },
  fontFamily: 'inter',
};
