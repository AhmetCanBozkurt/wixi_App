export interface ClientNoteDto {
  id: number;
  clientId: number;
  createdByUserId: number;
  createdByUserName: string;
  createdByUserEmail: string;
  content: string;
  isPinned: boolean;
  isVisibleToClient: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateClientNoteDto {
  clientId: number;
  content: string;
  isPinned?: boolean;
  isVisibleToClient?: boolean;
}

export interface UpdateClientNoteDto {
  content?: string;
  isPinned?: boolean;
  isVisibleToClient?: boolean;
}

