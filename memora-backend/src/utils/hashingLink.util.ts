import {randomBytes} from  "node:crypto"

export function hash(len:number){
   return randomBytes(len).toString("hex");

}

//explanation
//  randomBytes(len) creates len random bytes.
// - .toString("hex") turns each byte into 2 URL-safe characters (0-9, a-f).