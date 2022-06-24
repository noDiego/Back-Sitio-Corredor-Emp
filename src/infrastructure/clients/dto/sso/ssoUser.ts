export interface SsoUserCreation {
  enabled: boolean;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified?: boolean;
  attributes?: any;
}

export interface SsoError {
  errorMessage: string;
}

export interface SsoUser {
  id: string;
  createdTimestamp: number;
  username: string;
  enabled: boolean;
  totp: boolean;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  email: string;
  disableableCredentialTypes: any[];
  requiredActions: any[];
  notBefore: number;
  access: SsoUserAccess;
}

export interface SsoUserAccess {
  manageGroupMembership: boolean;
  view: boolean;
  mapRoles: boolean;
  impersonate: boolean;
  manage: boolean;
}

export interface SsoUserSearch {
  username?: string;
  email?: string;
}
