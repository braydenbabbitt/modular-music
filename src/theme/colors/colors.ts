const primaryColors = [
  '#E9FCEF',
  '#D3F8E0',
  '#A7F1C0',
  '#69E895',
  '#38E072',
  '#1DBA53',
  '#1CB04F',
  '#15843B',
  '#0E5827',
  '#072C14',
] as MantineDeepPartial;

const neutralColors = [
  '#F1F2F4',
  '#E3E5E8',
  '#C7CCD1',
  '#ABB2BA',
  '#8F98A3',
  '#727E8D',
  '#5C6570',
  '#454C54',
  '#2E3338',
  '#17191C',
] as MantineDeepPartial;

const dangerColors = [
  '#FBEAED',
  '#F6D5DB',
  '#EEAAB6',
  '#E58092',
  '#DD556E',
  '#D42B49',
  '#AA223B',
  '#7F1A2C',
  '#55111D',
  '#2A090F',
] as MantineDeepPartial;

const primary = {
  90: primaryColors[9],
  80: primaryColors[8],
  70: primaryColors[7],
  60: primaryColors[6],
  50: primaryColors[5],
  40: primaryColors[4],
  30: primaryColors[3],
  20: primaryColors[2],
  10: primaryColors[1],
  5: primaryColors[0],
} as const;

const neutral = {
  90: neutralColors[9],
  80: neutralColors[8],
  70: neutralColors[7],
  60: neutralColors[6],
  50: neutralColors[5],
  40: neutralColors[4],
  30: neutralColors[3],
  20: neutralColors[2],
  10: neutralColors[1],
  5: neutralColors[0],
} as const;

const danger = {
  90: dangerColors[9],
  80: dangerColors[8],
  70: dangerColors[7],
  60: dangerColors[6],
  50: dangerColors[5],
  40: dangerColors[4],
  30: dangerColors[3],
  20: dangerColors[2],
  10: dangerColors[1],
  5: dangerColors[0],
} as const;

export const colors = {
  primary,
  neutral,
  danger,
  mantineDeepPartials: {
    primary: primaryColors,
    neutral: neutralColors,
    danger: dangerColors,
  },
};

type MantineDeepPartial = [
  (string | undefined)?,
  (string | undefined)?,
  (string | undefined)?,
  (string | undefined)?,
  (string | undefined)?,
  (string | undefined)?,
  (string | undefined)?,
  (string | undefined)?,
  (string | undefined)?,
  (string | undefined)?,
];
