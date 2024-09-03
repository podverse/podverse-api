export const getBooleanOrNull = (value: boolean | null): boolean | null => {
  if (value === true) {
    return true;
  } else if (value === false) {
    return false;
  }

  return null;
};
