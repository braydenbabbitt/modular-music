export const sliceArray = <T>(arr: T[], maxSliceLength: number): T[][] => {
  const slicesCount = arr.length / maxSliceLength;
  const slices: T[][] = [];
  for (let i = 0; i < slicesCount; i++) {
    if (arr.length - i * maxSliceLength < maxSliceLength) {
      slices.push(arr.slice(i * maxSliceLength));
    } else {
      slices.push(arr.slice(i * maxSliceLength, i * maxSliceLength + maxSliceLength));
    }
  }
  return slices;
};
