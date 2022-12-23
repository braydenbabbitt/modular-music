export const jsonParseWithType = <T = any>(json: string) => {
  if (json) {
    return JSON.parse(json) as T;
  }
  return undefined;
};
