export const getOrdinal = (num: number) => {
  const divTen = num % 10;
  const divHundred = num % 100;

  if (divTen === 1 && divHundred !== 11) return `${num}st`;
  else if (divTen === 2 && divHundred !== 12) return `${num}nd`;
  else if (divTen === 3 && divHundred !== 13) return `${num}rd`;
  return `${num}th`;
};
