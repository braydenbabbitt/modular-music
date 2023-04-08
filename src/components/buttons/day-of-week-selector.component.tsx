import { ColorSwatch, Group, Text, useMantineTheme } from '@mantine/core';

const DAYS_OF_WEEK = [
  {
    label: 'Su',
    value: 1,
  },
  {
    label: 'M',
    value: 2,
  },
  {
    label: 'Tu',
    value: 3,
  },
  {
    label: 'W',
    value: 4,
  },
  {
    label: 'Th',
    value: 5,
  },
  {
    label: 'F',
    value: 6,
  },
  {
    label: 'Sa',
    value: 7,
  },
];

type DayOfWeekSelectorProps = {
  selection: number[];
  onChange: (toggledNumber: number) => void;
};

export const DayOfWeekSelector = ({ selection, onChange }: DayOfWeekSelectorProps) => {
  const mantineTheme = useMantineTheme();

  return (
    <Group align='center'>
      {DAYS_OF_WEEK.map((day) => (
        <ColorSwatch
          css={{ cursor: 'pointer', padding: mantineTheme.spacing.md }}
          key={day.value}
          color={
            selection.includes(day.value)
              ? mantineTheme.fn.themeColor('primary')
              : mantineTheme.fn.themeColor('neutral')
          }
          onClick={() => onChange(day.value)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange(day.value);
            }
          }}
        >
          <Text size='sm' weight='bold'>
            {day.label}
          </Text>
        </ColorSwatch>
      ))}
    </Group>
  );
};
