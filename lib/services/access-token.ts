import { tokenManager } from "./access-token-manager";

export function getAccessToken() {
  return tokenManager.getToken();
}
