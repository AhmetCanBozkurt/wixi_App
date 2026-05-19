export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  profilePicture?: string | null;
  tenantSlug?: string;
  tenantName?: string;
}
