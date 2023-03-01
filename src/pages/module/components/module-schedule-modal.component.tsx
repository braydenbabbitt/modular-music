import { Checkbox, Collapse, Divider, Group, Modal, Stack, Text, Title } from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import { useState } from 'react';

type ModuleScheduleModalProps = {
  open: boolean;
  onClose: () => void;
};

type ScheduleFormType = {
  nextRun?: dayjs.Dayjs;
  repeats: boolean;
};

export const ModuleScheduleModal = ({ open, onClose }: ModuleScheduleModalProps) => {
  const { values, setValues, setFieldValue, reset } = useForm<ScheduleFormType>({
    initialValues: {
      nextRun: undefined,
      repeats: false,
    },
  });

  // const [nextRunTimestamp, setNextRunTimestamp] = useState<dayjs.Dayjs>();
  const [repeats, setRepeats] = useState(false);

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Modal centered opened={open} onClose={handleClose} title={<Title order={4}>Set Schedule</Title>}>
      <Stack>
        <Stack spacing='xs'>
          <Text size='sm' my={0}>
            Next Run:
          </Text>
          <Group noWrap>
            <DatePicker
              value={values.nextRun?.toDate()}
              onChange={(value) =>
                setValues((prev) => {
                  const newDate = dayjs(value)
                    .set('hour', prev.nextRun?.hour() ?? 12)
                    .set('minute', prev.nextRun?.minute() ?? 0);
                  if (newDate.toDate() < new Date()) {
                    const currentDate = dayjs(new Date());
                    const result = {
                      nextRun: newDate.set('hour', currentDate.add(1, 'hour').hour()).set('minute', 0),
                    };
                    return {
                      nextRun: newDate.set('hour', currentDate.add(1, 'hour').hour()).set('minute', 0),
                    };
                  }
                  return { ...prev, nextRun: newDate };
                })
              }
              minDate={new Date()}
              firstDayOfWeek='sunday'
              placeholder='Select a date'
            />
            <TimeInput
              value={values.nextRun?.toDate()}
              css={{ flexGrow: 1 }}
              onChange={(value) =>
                setValues((prev) => {
                  const tomorrowDate = dayjs(new Date());
                  return {
                    nextRun: dayjs(value)
                      .set('month', prev.nextRun?.month() ?? tomorrowDate.month())
                      .set('day', prev.nextRun?.day() ?? tomorrowDate.day())
                      .set('year', prev.nextRun?.year() ?? tomorrowDate.year()),
                  };
                })
              }
              format='12'
              error={values.nextRun && values.nextRun.toDate() < new Date() ? 'Time must be in the future' : undefined}
              placeholder='Enter a time'
            />
          </Group>
        </Stack>
        <Divider />
        <Stack>
          <Checkbox
            label='Repeats'
            checked={values.repeats}
            onChange={(event) => setFieldValue('repeats', event.currentTarget.checked)}
          />
          <Collapse in={values.repeats}>
            <Group>Test</Group>
          </Collapse>
        </Stack>
      </Stack>
    </Modal>
  );
};
