export const reduceUrlParams = (params: Record<string, any>) => {
  const keysArr = Object.keys(params);

  if (keysArr.length === 0) {
    return '';
  }

  return keysArr.reduce((str, key, index) => {
    const value = params[key];

    if (Array.isArray(value)) {
      if (index > 0) {
        return str + '&' + value.map((item) => encodeURIComponent(item)).join(',');
      } else {
        return str + value.map((item) => encodeURIComponent(item)).join(',');
      }
    } else {
      if (index > 0) {
        return str + `&${key}=${encodeURIComponent(value)}`;
      } else {
        return str + `${key}=${encodeURIComponent(value)}`;
      }
    }
  }, '?');
};
