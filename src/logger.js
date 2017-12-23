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
    _from = 'SERVER';
  } else if (from === '?') {
    _from = 'CLIENT -new-';
  } else {
    _from = `CLIENT #${from}`;
  }
  console.log(
    _from,
    `${printHours(now)}:${printMinutes(now)}:${printSeconds(now)}`,
    message,
    JSON.stringify(debug, null, tab),
  );
};
