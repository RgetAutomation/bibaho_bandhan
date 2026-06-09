import { Role } from "../types/roles.js";

export function addIdPrefix(id: string, role: Role) {
  if (role === Role.ADMIN) {
    return `BBBAD${id}`;
  } else if (role === Role.MODERATOR) {
    return `BBBMD${id}`;
  } else {
    return `BBBGH${id}`;
  }
}
