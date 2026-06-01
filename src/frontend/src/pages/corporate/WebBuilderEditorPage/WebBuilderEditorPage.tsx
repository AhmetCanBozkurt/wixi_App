import { useParams } from 'react-router-dom';
import { EditorProvider } from '../../../features/ThemeBuilder/context/EditorContext';
import { WebBuilderEditor } from '../../../features/WebBuilder/WebBuilderEditor';

export default function WebBuilderEditorPage() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();

  // Platform admin olarak belirli bir tenant için açılıyorsa
  // localStorage'ı güncelle ki API interceptor'ı doğru X-Tenant-Slug göndersin
  if (tenantSlug) {
    localStorage.setItem('wixi-active-tenant', tenantSlug);
  }

  return (
    <EditorProvider>
      <WebBuilderEditor />
    </EditorProvider>
  );
}
