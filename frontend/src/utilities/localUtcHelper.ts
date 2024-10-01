export const utcStringTolocalDateTimeString = (
  utcString: string | null = null
): string => {
  if (
    utcString != null &&
    typeof utcString === 'string' &&
    utcString.length !== 0
  ) {
    const utcDate = new Date(utcString);
    const offsetDate = new Date(
      utcDate.getTime() - utcDate.getTimezoneOffset() * 60000
    );
    return offsetDate.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
  }

  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localNow.toISOString().slice(0, 16);
};

export const localDatetimeStringToUtcString = (
  localDateString: string
): string => {

  return new Date(localDateString).toISOString();
};
