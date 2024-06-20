export enum ROLES {
  ADMIN = 'ADMIN',
  PREMIUM = 'PREMIUM',
  FREE = 'FREE',
}

export interface User {
  id: number;
  email: string;
  password: string;
  username: string;
  viewed_classes: number[];
  role: ROLES;
}
