export interface EncryptOptions {
  key: string;
  whiteList: {
    method: string;
    pathname: string;
  }[];
}
