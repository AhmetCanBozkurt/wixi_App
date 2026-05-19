import React, { useEffect, useState } from 'react';
import { Select } from '../../shared/ui';
import { apiClient } from '../../shared/api/axiosConfig';

interface TenantSelectorProps {
  onTenantChange: (slug: string) => void;
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({ onTenantChange }) => {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);
  const [selected, setSelected] = useState<string | number>(localStorage.getItem('wixi-active-tenant') || '');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        interface TenantItem { name: string; slug: string; }
        interface TenantsResponse { items?: TenantItem[] | { items?: TenantItem[] } }
        const res = await apiClient.get<TenantsResponse>('admin/tenants');
        const rawItems = res.data.items;
        const data: TenantItem[] = Array.isArray(rawItems)
          ? rawItems
          : ((rawItems as { items?: TenantItem[] })?.items ?? []);

        const dropdownOptions = data.map((t) => ({
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
