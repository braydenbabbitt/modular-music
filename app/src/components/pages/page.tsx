import { ElementType, ReactNode } from 'react';

type PageProps<C extends ElementType> = {
  as?: C;
  children: ReactNode;
};

export const Page = <C extends ElementType>({ as, children }: PageProps<C>) => {
  const Component = as || 'main';
  return (
    <Component
      css={{
        overflowY: 'auto',
      }}
    >
      {children}
    </Component>
  );
};
