import { useEffect } from 'react';

export const usePageTitle = (title: string, append = true) => {
  useEffect(() => {
    const currentTitle = document.title;
    const currentTitleParts = currentTitle.split(' | ');
    document.title = append
      ? currentTitleParts
          .filter((part) => part !== title)
          .concat(title)
          .join(' | ')
      : title;
  }, [title, append]);
};
