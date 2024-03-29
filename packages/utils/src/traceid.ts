const traceid = (): string => {
  if (process.env.serverless_devs_traceid) {
    return process.env.serverless_devs_traceid;
  }
  const date = new Date();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  const hours = `0${date.getHours()}`.slice(-2);
  const minutes = `0${date.getMinutes()}`.slice(-2);
  const seconds = `0${date.getSeconds()}`.slice(-2);
  return `${month}${day}${hours}${minutes}${seconds}`;
};

export default traceid;
