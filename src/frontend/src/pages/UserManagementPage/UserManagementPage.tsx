import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, Badge, Button } from '../../shared/ui';
import { UserEditorModal } from './UserEditorModal';
import styles from './UserManagementPage.module.css';

interface UserListDto extends Record<string, unknown> {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  profilePicture?: string | null;
  createdAt?: string;
  createdByUser?: string;
  updatedAt?: string;
  updatedByUser?: string;
}

export const UserManagementPage = () => {
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [_loading, setLoading] = useState(true);
  
  // Dnd Modal State
  // Modal State
  const [activeUser, setActiveUser] = useState<UserListDto | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ items: UserListDto[] }>('usermanagement/users');
      const data = res.data.items || [];
      setUsers(data);
      return data;
    } catch {
      toast.error('Kullanıcı listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleManageMenus = (user: UserListDto) => {
    setActiveUser(user);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <FaUsers className={styles.mainIcon} />
          <div>
            <h1>Kullanıcı Yönetimi</h1>
            <p>Sistem kullanıcılarını görüntüleyin ve kişiye özel menü erişimlerini (sürükle-bırak) yapılandırın.</p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setIsAddingNew(true)} leftIcon={<FaPlus />}>
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      <div className={styles.content}>
        <AdvancedDataTable<UserListDto>
          dataSource={users}
          columns={[
            { field: 'id', title: 'ID', width: 80, hidden: true },
            {
               field: 'profilePicture',
               title: '',
               width: 60,
               template: (row) => (
                 <div className={styles.tableAvatar}>
                   {row.profilePicture ? (
                     <img src={`data:image/jpeg;base64,${row.profilePicture}`} alt="Avatar" />
                   ) : (
                     <div className={styles.tableAvatarFallback}>
                       {row.firstName[0]}{row.lastName[0]}
                     </div>
                   )}
                 </div>
               )
            },
            { 
              field: 'firstName', 
              title: 'Ad',
              template: (row) => <strong>{row.firstName}</strong>
            },
            { field: 'lastName', title: 'Soyad' },
            { field: 'email', title: 'E-Posta Adresi' },
            { 
              field: 'isActive', 
              title: 'Durum',
              width: 120,
              template: (row) => (
                <Badge 
                  variant={row.isActive ? 'success' : 'danger'} 
                  showDot 
                  size="sm"
                >
                  {row.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
              )
            },
            { field: 'createdAt', title: 'Oluşturma', hidden: true, template: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '-' },
            { field: 'createdByUser', title: 'Oluşturan', hidden: true },
            { field: 'updatedAt', title: 'Güncelleme', hidden: true, template: (row) => row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '-' },
            { field: 'updatedByUser', title: 'Güncelleyen', hidden: true }
          ]}
          groupable={true}
          sortable={true}
          selectable={true}
          reorderable={true}
          resizable={true}
          pageable={{ pageSize: 10 }}
          toolbar={['search', 'excel', 'pdf']}
          exportTitle="Kullanici_Listesi"
          onEdit={handleManageMenus}
        />
      </div>

      {(activeUser || isAddingNew) && (
        <UserEditorModal 
          userId={activeUser?.id || null}
          userName={activeUser ? `${activeUser.firstName} ${activeUser.lastName}` : 'Yeni Kullanıcı'}
          onClose={() => {
            setActiveUser(null);
            setIsAddingNew(false);
          }}
          onSave={fetchUsers}
        />
      )}
    </div>
  );
};
