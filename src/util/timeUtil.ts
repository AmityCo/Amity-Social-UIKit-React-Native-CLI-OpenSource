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
