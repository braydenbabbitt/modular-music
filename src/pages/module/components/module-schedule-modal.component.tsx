import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Group,
  Modal,
  NumberInput,
  Radio,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { DatePicker, TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { DayOfWeekSelector } from '../../../components/buttons/day-of-week-selector.component';
import { InfoHoverButton } from '../../../components/buttons/info-hover-button.component';
import {
  deleteModuleSchedule,
  FetchedModuleSchedule,
  ModuleRepetitionInterval,
  ModuleRepetitionIntervalValues,
  ModuleScheduleRepetition,
  saveModuleSchedule,
} from '../../../services/supabase/modules/modules.api';
import { DAYS_OF_WEEK } from '../../../utils/constants';
import { getOrdinal } from '../../../utils/ordinal-numbers';
import { DayOfWeek, MonthOfYear, WeekOfMonth, findDayOfWeekOfMonth } from '../../../utils/date-utils';
import { useAuth } from '../../../services/auth/auth.provider';

type ModuleScheduleModalProps = {
  open: boolean;
  moduleId: string;
  initSchedule?: FetchedModuleSchedule;
  onClose: () => void;
};

type ScheduleFormType = {
  nextRun?: dayjs.Dayjs;
  repeats: boolean;
  monthlyRepeat: 'dayOfMonth' | 'dayOfWeekOfMonth';
  endSelection?: 'never' | 'endDate' | 'timesToRepeat';
  endDate?: dayjs.Dayjs;
  timesToRepeat: number;
} & Omit<ModuleScheduleRepetition, 'dayOfMonth' | 'dayOfWeekOfMonth'>;

export const ModuleScheduleModal = ({ open, moduleId, initSchedule, onClose }: ModuleScheduleModalProps) => {
  const { supabaseClient } = useAuth();
  const { values, setValues, reset, getInputProps } = useForm<ScheduleFormType>({
    initialValues: {
      nextRun: initSchedule ? dayjs(initSchedule.next_run) : undefined,
      repeats: initSchedule ? !!initSchedule.repetition_config : false,
      quantity: initSchedule ? initSchedule.repetition_config?.quantity ?? 1 : 1,
      interval: initSchedule ? initSchedule.repetition_config?.interval ?? 'days' : 'days',
      daysOfWeek: initSchedule ? initSchedule.repetition_config?.daysOfWeek ?? [] : [],
      monthlyRepeat: initSchedule
        ? initSchedule.repetition_config?.dayOfMonth
          ? 'dayOfMonth'
          : initSchedule.repetition_config?.dayOfWeekOfMonth
          ? 'dayOfWeekOfMonth'
          : 'dayOfMonth'
        : 'dayOfMonth',
      endSelection: initSchedule
        ? initSchedule.end_date
          ? 'endDate'
          : initSchedule.times_to_repeat
          ? 'timesToRepeat'
          : 'never'
        : 'never',
      endDate: initSchedule && initSchedule.end_date ? dayjs(initSchedule.end_date) : undefined,
      timesToRepeat: initSchedule ? initSchedule.times_to_repeat ?? 1 : 1,
    },
  });

  useEffect(() => {
    if (initSchedule) {
      setValues({
        nextRun: initSchedule ? dayjs(initSchedule.next_run) : undefined,
        repeats: initSchedule ? !!initSchedule.repetition_config : false,
        quantity: initSchedule ? initSchedule.repetition_config?.quantity ?? 1 : 1,
        interval: initSchedule ? initSchedule.repetition_config?.interval ?? 'days' : 'days',
        daysOfWeek: initSchedule ? initSchedule.repetition_config?.daysOfWeek ?? [] : [],
        monthlyRepeat: initSchedule
          ? initSchedule.repetition_config?.dayOfMonth
            ? 'dayOfMonth'
            : initSchedule.repetition_config?.dayOfWeekOfMonth
            ? 'dayOfWeekOfMonth'
            : 'dayOfMonth'
          : 'dayOfMonth',
        endSelection: initSchedule
          ? initSchedule.end_date
            ? 'endDate'
            : initSchedule.times_to_repeat
            ? 'timesToRepeat'
            : 'never'
          : 'never',
        endDate: initSchedule && initSchedule.end_date ? dayjs(initSchedule.end_date) : undefined,
        timesToRepeat: initSchedule ? initSchedule.times_to_repeat ?? 1 : 1,
      });
    } else {
      reset();
    }
  }, [initSchedule]);

  const handleClose = () => {
    onClose();
    reset();
  };

  const dayOrYearRepeatIsValid = values.repeats && (values.interval === 'days' || values.interval === 'years');
  const weekRepeatIsValid =
    values.repeats && values.interval === 'weeks' && values.daysOfWeek !== undefined && values.daysOfWeek?.length > 0;
  const monthRepeatIsValid = values.repeats && values.interval === 'months' && values.monthlyRepeat;
  const repeatIsValid = dayOrYearRepeatIsValid || weekRepeatIsValid || monthRepeatIsValid;
  const endDateIsValid = values.endSelection === 'endDate' && values.endDate;
  const timesToRepeatIsValid = values.endSelection === 'timesToRepeat' && values.timesToRepeat;
  const endingsAreValid = endDateIsValid || timesToRepeatIsValid;
  const formIsValid =
    values.nextRun && (repeatIsValid || !values.repeats) && (endingsAreValid || values.endSelection === 'never');

  return (
    <Modal centered opened={open} onClose={handleClose} title={<Title order={4}>Set Schedule</Title>}>
      <Stack>
        <Stack spacing='xs'>
          <Text size='sm' my={0}>
            Next run:
          </Text>
          <Group noWrap align='start'>
            <DatePicker
              value={values.nextRun?.toDate()}
              onChange={(value) =>
                setValues((prev) => {
                  const newDate =
                    value === null
                      ? undefined
                      : dayjs(value)
                          .set('hour', prev.nextRun?.hour() ?? 12)
                          .set('minute', prev.nextRun?.minute() ?? 0);
                  if (newDate && newDate.toDate() < new Date()) {
                    const currentDate = dayjs(new Date());
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
              error={values.nextRun && values.nextRun.toDate() < new Date() ? 'Cannot be in the past' : undefined}
              placeholder='Enter a time'
            />
          </Group>
        </Stack>
        <Collapse in={!!values.nextRun}>
          <Checkbox
            label='Repeats'
            checked={values.repeats}
            onChange={(event) => setValues({ repeats: event.currentTarget.checked })}
            disabled={!values.nextRun}
          />
        </Collapse>
        <Collapse in={values.repeats}>
          <Stack>
            <Divider />
            <Group noWrap>
              <Text size='sm'>Repeat every</Text>
              <NumberInput
                styles={{ input: { width: 75 } }}
                min={1}
                max={9999}
                value={getInputProps('quantity').value}
                onChange={(val) => setValues({ quantity: val })}
              />
              <Select
                data={ModuleRepetitionIntervalValues.map((interval) => interval)}
                styles={{ wrapper: { width: 150 } }}
                value={getInputProps('interval').value}
                onChange={(value) =>
                  setValues({ interval: (value ?? undefined) as ModuleRepetitionInterval | undefined })
                }
              />
            </Group>
            <Collapse in={values.interval === 'weeks' || values.interval === 'months'}>
              <Stack spacing='xs'>
                <Text size='sm'>Repeat on</Text>
                <Collapse in={values.interval === 'weeks'}>
                  <DayOfWeekSelector
                    selection={values.daysOfWeek ?? []}
                    onChange={(value) =>
                      setValues({
                        daysOfWeek: values.daysOfWeek?.includes(value)
                          ? values.daysOfWeek.filter((num) => num !== value)
                          : values.daysOfWeek
                          ? [...values.daysOfWeek, value]
                          : [value],
                      })
                    }
                  />
                </Collapse>
                <Collapse in={values.interval === 'months'}>
                  <Group noWrap>
                    <Select
                      data={
                        values.nextRun
                          ? [
                              {
                                value: 'dayOfMonth',
                                label: `the ${getOrdinal(values.nextRun?.date())} day`,
                              },
                              {
                                value: 'dayOfWeekOfMonth',
                                label: `the ${getOrdinal(Math.floor((values.nextRun!.date() - 1) / 7) + 1)} ${
                                  DAYS_OF_WEEK[values.nextRun!.day()]
                                }`,
                              },
                            ]
                          : []
                      }
                      value={getInputProps('monthlyRepeat').value}
                      onChange={(value: 'dayOfMonth' | 'dayOfWeekOfMonth') => {
                        if (values.nextRun)
                          findDayOfWeekOfMonth(
                            values.nextRun.day() as DayOfWeek,
                            Math.floor((values.nextRun.date() - 1) / 7) as WeekOfMonth,
                            (values.nextRun.month() + (1 % 12)) as MonthOfYear,
                            values.nextRun.year() + (values.nextRun.month() === 11 ? 1 : 0),
                          );
                        setValues({ monthlyRepeat: value });
                      }}
                    />
                    {values.monthlyRepeat === 'dayOfMonth' && values.nextRun && values.nextRun.date() > 28 && (
                      <InfoHoverButton size={25}>
                        <Text size='sm'>
                          {"If this day doesn't exist in the month, the last day of the month will be used instead."}
                        </Text>
                        <br />
                        <Text size='sm'>
                          {
                            'For example, repeats on day 31 will run on the 30th of months without a 31st day, and the 28th in February.'
                          }
                        </Text>
                      </InfoHoverButton>
                    )}
                    {values.monthlyRepeat === 'dayOfWeekOfMonth' &&
                      values.nextRun &&
                      Math.floor((values.nextRun.date() - 1) / 7) + 1 > 4 && (
                        <InfoHoverButton size={25}>
                          <Text size='sm'>{`If the month doesn't have 5 ${
                            DAYS_OF_WEEK[values.nextRun.day() + 1]
                          }s, then the last ${
                            DAYS_OF_WEEK[values.nextRun.day() + 1]
                          } of the month will be used.`}</Text>
                        </InfoHoverButton>
                      )}
                  </Group>
                </Collapse>
              </Stack>
            </Collapse>
            <Divider />
            <Stack>
              <Text>Ends</Text>
              <Radio.Group
                value={getInputProps('endSelection').value}
                onChange={(value) => setValues({ endSelection: value as 'never' | 'endDate' | 'timesToRepeat' })}
                orientation='vertical'
              >
                <Radio value='never' label='Never' />
                <Group position='apart' noWrap>
                  <Radio value='endDate' label='On date' />
                  <DatePicker
                    value={
                      getInputProps('endDate').value === undefined || getInputProps('endDate').value === null
                        ? undefined
                        : (getInputProps('endDate').value as dayjs.Dayjs).toDate()
                    }
                    onChange={(value) => {
                      if (value) {
                        setValues({ endSelection: 'endDate' });
                      }
                      setValues({ endDate: value ? dayjs(value) : undefined });
                    }}
                    minDate={values.nextRun?.add(1, 'day').toDate()}
                    placeholder='Select an end date'
                  />
                </Group>
                <Group noWrap position='apart'>
                  <Radio value='timesToRepeat' label='Number of repetitions' />
                  <NumberInput
                    value={getInputProps('timesToRepeat').value}
                    min={1}
                    max={9999}
                    styles={{ input: { width: 100 } }}
                    onChange={(value) => setValues({ timesToRepeat: value, endSelection: 'timesToRepeat' })}
                    onClick={() => setValues({ endSelection: 'timesToRepeat' })}
                  />
                </Group>
              </Radio.Group>
            </Stack>
          </Stack>
        </Collapse>
        <Group position='right'>
          {initSchedule && (
            <Button
              variant='outline'
              color='danger'
              onClick={() => {
                deleteModuleSchedule({ supabaseClient, moduleId });
                handleClose();
              }}
            >
              Delete Schedule
            </Button>
          )}
          <Button
            disabled={!formIsValid}
            onClick={async () => {
              if (values.nextRun) {
                const repetition: ModuleScheduleRepetition | null = values.repeats
                  ? {
                      quantity: values.quantity,
                      interval: values.interval,
                      daysOfWeek: values.interval === 'weeks' ? values.daysOfWeek : undefined,
                      dayOfMonth:
                        values.interval === 'months' && values.monthlyRepeat === 'dayOfMonth'
                          ? values.nextRun.date()
                          : undefined,
                      dayOfWeekOfMonth:
                        values.interval === 'months' && values.monthlyRepeat === 'dayOfWeekOfMonth'
                          ? {
                              day: values.nextRun.day(),
                              week: Math.floor((values.nextRun.date() - 1) / 7) + 1,
                            }
                          : undefined,
                    }
                  : null;
                await saveModuleSchedule({
                  supabaseClient,
                  moduleId,
                  next_run: values.nextRun.toDate(),
                  repetition,
                  endDate: values.endSelection === 'endDate' && values.endDate ? values.endDate.toDate() : null,
                  timesToRepeat:
                    values.endSelection === 'timesToRepeat' && values.timesToRepeat ? values.timesToRepeat : null,
                });
              }
              handleClose();
            }}
          >
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
