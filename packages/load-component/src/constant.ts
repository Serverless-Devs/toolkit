import { getGlobalConfig } from "@serverless-devs/utils";

export const BASE_URL = getGlobalConfig('registry', 'https://api.devsapp.cn/v3');
export const PROVIDER = 'devsapp/';
