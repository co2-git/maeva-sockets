// @flow

const queue = [];

export default queue;

export const getQueue = () => queue;

export const pushQueue = (queueItem) => queue.push(queueItem);
