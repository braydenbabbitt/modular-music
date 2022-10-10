import React from 'react';
import { ActionIcon, Group, useMantineTheme } from '@mantine/core';
import { IconChevronDown, IconRotate, IconX } from '@tabler/icons';
import { useState } from 'react';
import { useBrightness } from '../hooks/useBrightness';
import { ColorSchemeToggle } from './ColorSchemeToggle';

type DevToolsProps = {
  toggleDevMode: () => void;
};

export const DevTools = ({ toggleDevMode }: DevToolsProps) => {
  const theme = useMantineTheme();
  const [collapsed, setCollapsed] = useState(true);
  const containerStyles: React.CSSProperties = {
    position: 'absolute',
    width: '100%',
    bottom: 0,
    padding: 10,
    backgroundColor: theme.fn.rgba(theme.colors.neutrals[theme.fn.primaryShade()], 0.25),
    display: 'flex',
    flexDirection: 'column',
    gap: collapsed ? 0 : 15,
    transition: 'gap 0.3s',
  };
  const toolsContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 15,
    flexShrink: 1,
    opacity: collapsed ? '0' : '1',
    height: collapsed ? '0px' : 'auto',
    overflow: collapsed ? 'hidden' : 'auto',
    transition: 'height 0.3s, opacity 0.3s',
  };
  const headerSectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    flexShrink: 1,
  };

  const [brightness, setBrightness] = useBrightness();

  return (
    <div style={containerStyles}>
      <span style={headerSectionStyles}>
        <h3 style={{ margin: 0 }}>DevTools</h3>
        <Group>
          <ActionIcon onClick={() => setCollapsed((prev) => !prev)}>
            <IconChevronDown
              color='black'
              style={{ rotate: collapsed ? '180deg' : '0deg', transition: 'rotate 0.15s' }}
            />
          </ActionIcon>
          <ActionIcon onClick={toggleDevMode}>
            <IconX color='black' />
          </ActionIcon>
        </Group>
      </span>
      {/* {!collapsed && */}
      <span style={toolsContainerStyles}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <p style={{ margin: 0 }}>Brightness:</p>
          <ColorSchemeToggle />
        </span>
      </span>
      {/* } */}
    </div>
  );
};
