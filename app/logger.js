import colors from 'colors';

const printHours = date => {
  let hours = date.getHours();
  if (hours < 10) {
    return `0${hours}`;
  }
  return hours.toString();
};

const printMinutes = date => {
  let minutes = date.getMinutes();
  if (minutes < 10) {
    return `0${minutes}`;
  }
  return minutes.toString();
};

const printSeconds = date => {
  let seconds = date.getSeconds();
  if (seconds < 10) {
    return `0${seconds}`;
  }
  return seconds.toString();
};

export const log = (message, from, debug, tab = 0) => {
  const now = new Date();
  let _from;
  if (from === 'server') {
    _from = colors.magenta('SERVER');
  } else if (from === '?') {
    _from = colors.cyan('CLIENT -new-');
  } else {
    _from = colors.cyan(`CLIENT #${from}`);
  }
  console.log(
    _from,
    colors.grey(printHours(now)) +
      colors.grey(':') +
      colors.grey(printMinutes(now)) +
      colors.grey(':') +
      printSeconds(now),
    colors.bold(message),
    colors.italic(JSON.stringify(debug, null, tab))
  );
};
