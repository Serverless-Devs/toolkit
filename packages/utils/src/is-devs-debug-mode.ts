const packagesList = [
  'serverless-devs:engine',
  'serverless-devs:parse-spec',
  'serverless-devs:load-component',
  'serverless-devs:load-appliation',
];

const isDevsDebugMode = (): boolean => {
  if (process.env.DEBUG && packagesList.includes(process.env.DEBUG)) {
    return true;
  }
  return false;
};
  
export default isDevsDebugMode;
  