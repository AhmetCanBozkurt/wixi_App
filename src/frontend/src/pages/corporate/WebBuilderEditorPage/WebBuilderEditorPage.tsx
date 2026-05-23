import { EditorProvider } from '../../../features/ThemeBuilder/context/EditorContext';
import { WebBuilderEditor } from '../../../features/WebBuilder/WebBuilderEditor';

export default function WebBuilderEditorPage() {
  return (
    <EditorProvider>
      <WebBuilderEditor />
    </EditorProvider>
  );
}
