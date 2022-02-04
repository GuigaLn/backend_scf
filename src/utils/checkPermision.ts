/*
*   1 - PERMISSÃO TOAL
*   2 - PERMISSÃO PONTO
*   3 - PERMISSÃO SENHAS
*   4 - PERMISSÃO FUNCIONARIO
*/

export function checkPermision(necessaryPermission: number, userPermissions: Array<{ permisionid: number }>) {
  if (userPermissions.find((item) => item.permisionid === necessaryPermission)) {
    return true;
  } else if (userPermissions.find((item) => item.permisionid === 1)) {
    return true;
  }
  return false;
}
