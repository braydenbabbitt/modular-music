import { forwardRef } from 'react';

const SOURCES: {
  icon: Record<ModularMusicLogoProps['theme'], string>;
  text: Record<ModularMusicLogoProps['theme'], string>;
} = {
  icon: {
    light: '/logo-black-green.svg',
    dark: '/logo-white-green.svg',
  },
  text: {
    light: '/modular-music-text-black.svg',
    dark: '/modular-music-text-white.svg',
  },
};

type ModularMusicLogoProps = {
  variant: 'full' | 'icon';
  theme: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
} & Omit<JSX.IntrinsicElements['figure'], 'ref'>;

type Sizes = {
  containerHeight: string;
  gap: string;
};

const getSizes = (size: ModularMusicLogoProps['size']): Sizes => {
  switch (size) {
    case 'small':
      return {
        containerHeight: '1.5rem',
        gap: '0.5rem',
      };
    case 'large':
      return {
        containerHeight: '4rem',
        gap: '1rem',
      };
    default:
      return {
        containerHeight: '2.5rem',
        gap: '0.75rem',
      };
  }
};

export const ModularMusicLogo = forwardRef<HTMLElement, ModularMusicLogoProps>(
  ({ variant, theme, size = 'medium', ...rest }, ref) => {
    const { containerHeight, gap } = getSizes(size);

    return (
      <figure
        ref={ref}
        css={{
          display: 'flex',
          alignItems: 'center',
          gap,
          width: 'fit-content',
          height: containerHeight,
          margin: 0,
        }}
        {...rest}
      >
        <img
          src={SOURCES.icon[theme]}
          css={{
            height: '100%',
          }}
        />
        {variant === 'full' && (
          <img
            src={SOURCES.text[theme]}
            css={{
              height: '80%',
            }}
          />
        )}
      </figure>
    );
  },
);

ModularMusicLogo.displayName = 'ModularMusicLogo';
