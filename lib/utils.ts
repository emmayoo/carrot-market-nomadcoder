export const formatToTimeAgo = (date: Date) => {
  const dayInMs = 1000 * 60 * 60 * 24;

  const time = date.getTime();
  const now = Date.now();
  const diff = Math.round((time - now) / dayInMs);

  return new Intl.RelativeTimeFormat("ko").format(diff, "days");
};

export const formatToWon = (price: number) => {
  return price.toLocaleString("ko-KR");
};
