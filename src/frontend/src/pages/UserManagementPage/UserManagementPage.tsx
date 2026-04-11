import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaSitemap } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
import { Badge } from '../../shared/ui/Badge/Badge';
import { UserMenuBuilder } from './UserMenuBuilder';
import styles from './UserManagementPage.module.css';

interface UserListDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export const UserManagementPage = () => {
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dnd Modal State
  const [activeUser, setActiveUser] = useState<UserListDto | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<UserListDto[]>('usermanagement/users');
      setUsers(res.data);
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

  const handleDeleteUser = async (user: UserListDto) => {
    const result = await Swal.fire({
      title: 'Kullanıcıyı Sil?',
      text: `${user.firstName} ${user.lastName} sistemden silinecektir.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-danger)',
      cancelButtonText: 'İptal',
      confirmButtonText: 'Evet, Sil!',
      background: 'var(--surface)',
      color: 'var(--text-main)'
    });

    if (result.isConfirmed) {
      toast.error('Bu sadece bir gösterim. Silme endpointi Role mimarisinde eklenecektir.');
    }
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
      </div>

      <div className={styles.content}>
        <AdvancedDataTable<UserListDto>
          dataSource={users}
          columns={[
            { field: 'id', title: 'ID', width: 80, hidden: true },
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
            }
          ]}
          groupable={true}
          sortable={true}
          selectable={true}
          reorderable={true}
          resizable={true}
          pageable={{ pageSize: 10 }}
          toolbar={['search', 'excel', 'pdf']}
          onEdit={handleManageMenus}
        />
      </div>

      {activeUser && (
        <UserMenuBuilder 
          userId={activeUser.id}
          userName={`${activeUser.firstName} ${activeUser.lastName}`}
          onClose={() => setActiveUser(null)}
        />
      )}
    </div>
  );
};
