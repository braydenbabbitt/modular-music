import { HoverCard, MantineColor, useMantineTheme } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons';
import { ReactNode } from 'react';

type InfoHoverButtonProps = {
  children: ReactNode;
  size?: string | number;
  color?: MantineColor;
};

export const InfoHoverButton = ({ children, size = '100%', color }: InfoHoverButtonProps) => {
  const mantineTheme = useMantineTheme();

  return (
    <HoverCard position='top' width={350}>
      <HoverCard.Target>
        <span css={{ flexShrink: 1, height: size, width: size }}>
          <IconInfoCircle css={color ? { color: mantineTheme.fn.themeColor(color) } : undefined} size={size} />
        </span>
      </HoverCard.Target>
      <HoverCard.Dropdown>{children}</HoverCard.Dropdown>
    </HoverCard>
  );
};
