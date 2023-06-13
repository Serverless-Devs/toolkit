export type ICredentials = {
  [key: string]: string;
} | {
  __provider?: string;
  __default?: 'true' | 'false';
}
