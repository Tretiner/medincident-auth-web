"server only";

import { getAccessToken } from "./access-token-manager";

export async function getUserFromSession() {
  throw new Error("error all server")
  return getAccessToken();
}
export async function requireUserFromSession(){
  return await getUserFromSession()!
}