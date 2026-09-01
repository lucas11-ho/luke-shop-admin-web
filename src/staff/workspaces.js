const FIXED_STAFF_ROLES=Object.freeze(['DRIVER','KITCHEN','CASHIER']);
const STAFF_ONLY_PERMISSIONS=new Set(['kitchen.read','kitchen.manage','cashier.read','cashier.manage']);

export const STAFF_WORKSPACES=Object.freeze([
  {key:'driver',route:'/driver',title:'Driver',description:'Assigned deliveries, customer messages, proof of delivery and COD collection.'},
  {key:'kitchen',route:'/kitchen',title:'Kitchen',description:'Food production queue from acceptance through ready-for-dispatch.'},
  {key:'cashier',route:'/cashier',title:'Cashier',description:'Payment queue and COD cash custody without final owner reconciliation.'},
]);

export function resolveStaffWorkspaces(user){
  const roles=new Set(user?.roles||[]),permissions=new Set(user?.permissions||[]),keys=[];
  if(roles.has('DRIVER'))keys.push('driver');
  if(roles.has('KITCHEN')||permissions.has('kitchen.read')||permissions.has('kitchen.manage'))keys.push('kitchen');
  if(roles.has('CASHIER')||permissions.has('cashier.read')||permissions.has('cashier.manage'))keys.push('cashier');
  return STAFF_WORKSPACES.filter(workspace=>keys.includes(workspace.key));
}

export function isStaffOnlyUser(user){
  const roles=user?.roles||[],permissions=user?.permissions||[];
  if(!roles.length||roles.includes('OWNER'))return false;
  if(!roles.every(role=>FIXED_STAFF_ROLES.includes(role)))return false;
  if(!resolveStaffWorkspaces(user).length)return false;
  return permissions.every(permission=>STAFF_ONLY_PERMISSIONS.has(permission));
}
