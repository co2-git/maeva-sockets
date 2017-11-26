// @flow

const sanitize = (candidate: Object) => {
  const sanitized = {};
  for (const field in candidate) {
    const value = candidate[field];
    if (value instanceof Date) {
      sanitized[field] = {$Date: value.toString()};
    } else {
      sanitized[field] = JSON.stringify(value);
    }
  }
  return sanitized;
};

export default sanitize;
