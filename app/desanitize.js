// @flow
import reduce from 'lodash/reduce';

const desanitize = (candidate: Object) => reduce(
  candidate,
  (desanitized, value, field) => {
    if (typeof value === 'string') {
      desanitized[field] = JSON.parse(value);
    } else if (value.$Date) {
      desanitized[field] = new Date(value.$Date);
    }
    return desanitized;
  },
  {},
);

export default desanitize;
