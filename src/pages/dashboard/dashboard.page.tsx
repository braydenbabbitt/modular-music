import React, { useState } from 'react';
import { Paper } from '@mantine/core';
import { Program, ProgramsBlock } from './components/programs-block.component';

export const DashboardPage = () => {
  const [programs, setPrograms] = useState<Program[]>([
    { id: '1', name: 'Program 1' },
    { id: '2', name: 'Program 2' },
  ]);

  const removeProgram = (id: string) => {
    setPrograms((prev) => {
      return prev.filter((program) => program.id !== id);
    });
  };

  return (
    <ProgramsBlock
      addProgram={() => {
        setPrograms((prev) => {
          const date = Date.now().toString();
          return [
            ...prev,
            {
              id: date,
              name: `Program ${date}`,
            },
          ];
        });
      }}
      removeProgram={removeProgram}
      programs={programs}
    />
  );
};
