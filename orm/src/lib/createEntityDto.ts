function updateEntityDtoWithFalse(obj: Record<string, any>): Record<string, any> {
  const updatedObj: Record<string, any> = {};

  for (const key in obj) {
    if (obj[key] === false) {
      updatedObj[key] = false;
    } else {
      updatedObj[key] = obj[key] || null;
    }
  }

  return updatedObj;
}
