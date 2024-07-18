// get local MAC code as crypto key
import { mac } from 'address';
export const CRYPTO_STRING = mac(function (err, addr) {
  console.log(addr);
});

console.log(CRYPTO_STRING);