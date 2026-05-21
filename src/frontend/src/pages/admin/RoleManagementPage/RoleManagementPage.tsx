import { useCallback, useEffect, useState } from 'react';
import { FaPlus, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { apiClient } from '../../../shared/api/axiosConfig';
import { AdvancedDataTable, Button, Input, Modal } from '../../../shared/ui';
import styles from '../UserManagementPage/UserManagementPage.module.css';

interface RoleDto extends Record<string, unknown> {
  id: string;
  name: string;
  description?: string | null;
}

export const RoleManagementPage = () => {
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [isUpsertOpen, setIsUpsertOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDto | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<RoleDto | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await apiClient.get<{ items: RoleDto[] }>('usermanagement/roles');
      setRoles(res.data.items || []);
    } catch {
      toast.error('Rol listesi alınamadı.');
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openCreate = () => {
    setEditingRole(null);
    setFormName('');
    setFormDesc('');
    setFormError(null);
    setIsUpsertOpen(true);
  };

  const openEdit = (role: RoleDto) => {
    setEditingRole(role);
    setFormName(role.name);
    setFormDesc(role.description ?? '');
    setFormError(null);
    setIsUpsertOpen(true);
  };

  const submitUpsert = async () => {
    const name = formName.trim();
    const description = formDesc.trim();
    if (!name) {
      setFormError('Rol adı zorunludur.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRole) {
        await apiClient.put(`usermanagement/roles/${editingRole.id}`, { name, description: description || null });
        toast.success('Rol güncellendi.');
      } else {
        await apiClient.post('usermanagement/roles', { name, description: description || null });
        toast.success('Rol oluşturuldu.');
      }
      setIsUpsertOpen(false);
      await fetchRoles();
    } catch {
      toast.error(editingRole ? 'Rol güncellenemedi.' : 'Rol oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  const openDelete = (role: RoleDto) => {
    setDeletingRole(role);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingRole) return;
    setIsSaving(true);
    try {
      await apiClient.delete(`usermanagement/roles/${deletingRole.id}`);
      toast.success('Rol silindi.');
      setIsDeleteOpen(false);
      setDeletingRole(null);
      await fetchRoles();
    } catch {
      toast.error('Rol silinemedi (role atanmış olabilir veya sistem rolüdür).');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <FaShieldAlt className={styles.mainIcon} />
          <div>
            <h1>Rol Yönetimi</h1>
            <p>Rolleri oluşturun, düzenleyin ve silin.</p>
          </div>
        </div>
        <Button variant="primary" onClick={openCreate} leftIcon={<FaPlus />}>
          Yeni Rol
        </Button>
      </div>

      <div className={styles.content}>
        <AdvancedDataTable<RoleDto>
          dataSource={roles}
          columns={[
            { field: 'id', title: 'ID', hidden: true },
            { field: 'name', title: 'Rol' },
            { field: 'description', title: 'Açıklama', template: (r) => r.description || '-' },
          ]}
          groupable={false}
          sortable={true}
          selectable={false}
          reorderable={false}
          resizable={true}
          pageable={{ pageSize: 10 }}
          toolbar={['search']}
          exportTitle="Rol_Listesi"
          onEdit={(row) => openEdit(row)}
          onDelete={(row) => openDelete(row)}
        />
      </div>

      <Modal
        isOpen={isUpsertOpen}
        onClose={() => setIsUpsertOpen(false)}
        title={editingRole ? 'Rol Düzenle' : 'Yeni Rol'}
        size="md"
        footer={
          <div style={{ display: 'flex', width: '100%', gap: 10 }}>
            <Button variant="ghost" onClick={() => setIsUpsertOpen(false)}>
              İptal
            </Button>
            <div style={{ flex: 1 }} />
            <Button variant="primary" onClick={submitUpsert} disabled={isSaving}>
              {isSaving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <Input
            label="Rol Adı"
            placeholder="Örn: FinanceAdmin"
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              setFormError(null);
            }}
            required
          />
          <Input
            label="Açıklama"
            placeholder="Opsiyonel"
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />
          {formError && (
            <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem' }}>
              {formError}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Rolü Sil"
        size="md"
        footer={
          <div style={{ display: 'flex', width: '100%', gap: 10 }}>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              İptal
            </Button>
            <div style={{ flex: 1 }} />
            <Button variant="danger" onClick={confirmDelete} disabled={isSaving}>
              {isSaving ? 'Siliniyor…' : 'Evet, Sil'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ opacity: 0.9 }}>
            <strong>{deletingRole?.name}</strong> rolü silinecek. Bu işlem geri alınamaz.
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.75 }}>
            Not: Sistem rolleri veya üzerinde kullanıcı olan roller silinemez.
          </div>
        </div>
      </Modal>
    </div>
  );
};

