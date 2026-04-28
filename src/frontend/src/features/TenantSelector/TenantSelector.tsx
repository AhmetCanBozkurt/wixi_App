import React, { useEffect, useState } from 'react';
import { Select } from '../../shared/ui';
import { apiClient } from '../../shared/api/axiosConfig';
import { toast } from 'react-hot-toast';

interface TenantSelectorProps {
  onTenantChange: (slug: string) => void;
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({ onTenantChange }) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [selected, setSelected] = useState<string | number>(localStorage.getItem('wixi-active-tenant') || '');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await apiClient.get<{ items: any[] }>('admin/tenants');
        const data = (res.data as any).items?.items || (res.data as any).items || [];
        
        const dropdownOptions = data.map((t: any) => ({
          label: `${t.name} (${t.slug})`,
          value: t.slug
        }));
        
        // Add a default option
        dropdownOptions.unshift({ label: 'Lütfen Mağaza Seçin', value: '' });
        
        setOptions(dropdownOptions);
      } catch (error) {
        console.error("Mağazalar alınamadı", error);
      }
    };
    fetchTenants();
  }, []);

  const handleChange = (val: string | number) => {
    const stringVal = String(val);
    setSelected(stringVal);
    localStorage.setItem('wixi-active-tenant', stringVal);
    onTenantChange(stringVal);
  };

  return (
    <div style={{ minWidth: '250px' }}>
      <Select 
        value={selected}
        onChange={handleChange}
        options={options}
      />
    </div>
  );
};
