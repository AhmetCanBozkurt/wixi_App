export interface MenuPermissionDto {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  menuPath: string;
  menuText: string;
  menuCategory?: string;
  menuIcon?: string;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMenuPermissionDto {
  userId: number;
  menuPath: string;
  menuText: string;
  menuCategory?: string;
  menuIcon?: string;
  isVisible?: boolean;
  displayOrder?: number;
}

export interface UpdateMenuPermissionDto {
  menuText?: string;
  menuCategory?: string;
  menuIcon?: string;
  isVisible?: boolean;
  displayOrder?: number;
}

export interface MenuPermissionByUserDto {
  userId: number;
  userName?: string;
  userEmail?: string;
  menuItems: MenuPermissionDto[];
}

export interface BulkUpdateMenuPermissionsDto {
  userId: number;
  menuItems: MenuPermissionItemDto[];
}

export interface MenuPermissionItemDto {
  menuPath: string;
  menuText: string;
  menuCategory?: string;
  menuIcon?: string;
  isVisible?: boolean;
  displayOrder?: number;
}

