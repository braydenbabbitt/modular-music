import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors?: {
      primary: {
        main: string;
        dark?: string;
        light?: string;
        shades?: {
          0?: string;
          10?: string;
          20?: string;
          30?: string;
          40?: string;
          50?: string;
          60?: string;
          70?: string;
          80?: string;
          90?: string;
          95?: string;
          99?: string;
          100?: string;
        }
      }
      secondary?: {
        main: string;
        dark?: string;
        light?: string;
        shades?: {
          0?: string;
          10?: string;
          20?: string;
          30?: string;
          40?: string;
          50?: string;
          60?: string;
          70?: string;
          80?: string;
          90?: string;
          95?: string;
          99?: string;
          100?: string;
        }
      }
      tertiary?: {
        main: string;
        dark?: string;
        light?: string;
        shades?: {
          0?: string;
          10?: string;
          20?: string;
          30?: string;
          40?: string;
          50?: string;
          60?: string;
          70?: string;
          80?: string;
          90?: string;
          95?: string;
          99?: string;
          100?: string;
        }
      }
      danger?: {
        main: string;
        dark?: string;
        light?: string;
        shades?: {
          0?: string;
          10?: string;
          20?: string;
          30?: string;
          40?: string;
          50?: string;
          60?: string;
          70?: string;
          80?: string;
          90?: string;
          95?: string;
          99?: string;
          100?: string;
        }
      }
      neutrals?: {
        main?: string;
        dark?: string;
        light?: string;
        shades?: {
          0?: string;
          10?: string;
          20?: string;
          30?: string;
          40?: string;
          50?: string;
          60?: string;
          70?: string;
          80?: string;
          90?: string;
          95?: string;
          99?: string;
          100?: string;
        }
      }
    },
    fonts?: {
      [fontType: string]: {
        font?: string,
        color?: string,
        textShadow?: string,
        letterSpacing?: string,
        textDecoration?: string,
        transition?: string,
        '&.active'?: {
          font?: string,
          color?: string,
          textShadow?: string,
          textDecoration?: string,
        },
        '&:hover'?: {
          font?: string,
          color?: string,
          textShadow?: string,
          textDecoration?: string,
        },
        '&.active:hover'?: {
          font?: string,
          color?: string,
          textShadow?: string,
          textDecoration?: string,
        },
      };
    }
  }
}