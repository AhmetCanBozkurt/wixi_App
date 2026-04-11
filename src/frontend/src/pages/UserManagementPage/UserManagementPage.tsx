import { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaSitemap, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { apiClient } from '../../shared/api/axiosConfig';
import { AdvancedDataTable, type Column } from '../../shared/ui/AdvancedDataTable/AdvancedDataTable';
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
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'İptal',
      confirmButtonText: 'Evet, Sil!',
      background: 'var(--bg-secondary)',
      color: 'var(--text-main)'
    });

    if (result.isConfirmed) {
      toast.error('Bu sadece bir gösterim. Silme endpointi Role mimarisinde eklenecektir.');
    }
  };

  const columns: Column<UserListDto>[] = [
    {
      key: 'firstName',
      header: 'Ad',
      sortable: true,
      filterable: true
    },
    {
      key: 'lastName',
      header: 'Soyad',
      sortable: true,
      filterable: true
    },
    {
      key: 'email',
      header: 'E-Posta Adresi',
      searchable: true,
      sortable: true
    },
    {
      key: 'isActive',
      header: 'Durum',
      render: (val) => (
        <span className={`${styles.statusBadge} ${val ? styles.active : ''}`}>
          {val ? 'Aktif' : 'Pasif'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'İşlemler',
      width: '120px',
      render: (_, row) => (
        <div className={styles.tableActions}>
          <button onClick={() => handleManageMenus(row)} className={styles.actionBtn} title="Menü Yetkilerini Düzenle">
            <FaSitemap />
          </button>
          <button onClick={() => handleDeleteUser(row)} className={styles.actionBtn} style={{ color: '#ef4444' }} title="Kullanıcıyı Sil">
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

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
        <AdvancedDataTable 
          columns={columns} 
          data={users} 
          pageSize={10}
          loading={loading}
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
