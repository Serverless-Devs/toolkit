import { getRootHome } from "@serverless-devs/utils";
import * as path from 'path';

export const secretsPath = path.join(getRootHome(), 'secrets.yaml');