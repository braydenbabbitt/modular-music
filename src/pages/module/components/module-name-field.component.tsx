import { ActionIcon, Button, Group, Loader, TextInput, Title, useMantineTheme } from '@mantine/core';
import { IconPencil } from '@tabler/icons';
import { useState } from 'react';

type ModuleNameFieldProps = {
  onSave: (newName: string) => Promise<void>;
  initialName?: string;
  disabled?: boolean;
};

export const ModuleNameField = ({ onSave, initialName, disabled }: ModuleNameFieldProps) => {
  const mantineTheme = useMantineTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [moduleName, setModuleName] = useState(initialName);

  const handleSave = async () => {
    setIsSaving(true);
    if (moduleName) await onSave(moduleName);
    setIsEditing(false);
    setIsSaving(false);
  };

  return isEditing ? (
    <Group>
      <TextInput
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleSave();
        }}
        autoFocus
        value={moduleName}
        onChange={(e) => setModuleName(e.target.value)}
        rightSection={isSaving ? <Loader size='xs' /> : undefined}
      />
      <Button
        disabled={moduleName === initialName || moduleName === undefined || moduleName.length === 0}
        onClick={handleSave}
      >
        Save
      </Button>
      <Button
        onClick={() => {
          setIsEditing(false);
          setModuleName(initialName);
        }}
        variant='outline'
        color='neutral'
      >
        Cancel
      </Button>
    </Group>
  ) : (
    <Group>
      <Title order={2} color={moduleName ? undefined : mantineTheme.fn.lighten('neutral', 0.4)}>
        {moduleName || 'Unnamed Module'}
      </Title>
      {!disabled && (
        <ActionIcon onClick={() => setIsEditing(true)}>
          <IconPencil />
        </ActionIcon>
      )}
    </Group>
  );
};
