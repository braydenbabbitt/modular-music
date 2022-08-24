export const getHashParams = (url: Location = window.location) => {
  return url.hash.substring(1).split('&').reduce((initial: { [key: string]: any; }, item) => {
    if (item) {
      let parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
}

export const removeHashFromUrl = (url: Location = window.location) => {
  return url.href.split('#')[0];
}