export const confirmIfEmpty = (value: string, fieldName: string): boolean => {
  if (!value) {
    const confirmResult = window.confirm(
      `${fieldName}が入力されていません、続行しますか？`,
    );
    return confirmResult;
  }
  return true;
};
