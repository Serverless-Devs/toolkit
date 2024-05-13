import minimist from 'minimist';

const isDebugMode = (): boolean => {
  if (process.env.DEBUG === 'true') return true;
  const args = minimist(process.argv.slice(2));
  return args.debug ?? false;
};

export default isDebugMode;
