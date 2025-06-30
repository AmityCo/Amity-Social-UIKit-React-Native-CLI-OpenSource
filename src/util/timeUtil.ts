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
