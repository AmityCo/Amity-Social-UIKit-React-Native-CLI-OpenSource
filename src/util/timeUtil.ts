export const msToString = (duration: number) => {
  const totalSeconds = duration / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
  return formattedTime;
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedHours =
    hours > 0 ? `${hours.toString().padStart(2, '0')}:` : '';
  const formattedMinutes = `${minutes.toString().padStart(2, '0')}:`;
  const formattedSeconds = secs.toString().padStart(2, '0');

  return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
};

export const formatTimeLeft = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  if (totalDays > 0) {
    return `${totalDays}d`;
  } else if (totalHours > 0) {
    return `${totalHours}h`;
  } else if (totalMinutes > 0) {
    return `${totalMinutes}m`;
  } else {
    return `1m`;
  }
};

export function limitDecimalsWithoutRounding(val: number, decimals: number) {
  let parts = val.toString().split('.');
  return parseFloat(parts[0] + '.' + parts[1].substring(0, decimals));
}

export const formatVoteCount = (count: number): string => {
  const ONE_MILLION = 1000000;
  const ONE_THOUSAND = 1000;

  if (count >= ONE_MILLION) {
    const millions = count / ONE_MILLION;
    return millions % 1 === 0
      ? `${millions}M`
      : `${limitDecimalsWithoutRounding(millions, 1)}M`;
  }
  if (count >= ONE_THOUSAND) {
    let thousands = count / ONE_THOUSAND;
    return thousands % 1 === 0
      ? `${thousands}K`
      : `${limitDecimalsWithoutRounding(thousands, 1)}K`;
  }
  return count.toString();
};
