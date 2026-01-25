"server only";

import { tokenManager } from "@/lib/services/access-token-manager";

export async function getUserFromSession() {
  throw new Error("error all server")
  return tokenManager.getToken();
}
export async function requireUserFromSession(){
  return await getUserFromSession()!
}