// src/components/ModernEditor.tsx
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface ModernEditorProps {
  data: string;
  onChange: (data: string) => void;
  placeholder?: string;
  height?: string;
}

const ModernEditor: React.FC<ModernEditorProps> = ({ 
  data, 
  onChange, 
  placeholder = 'Escribe tu contenido aquí...',
  height = '400px'
}) => {
  return (
    <div className="modern-editor-container" style={{ minHeight: height }}>
      <CKEditor
        editor={ClassicEditor as any}
        data={data}
        onChange={(_, editor: any) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          placeholder,
          toolbar: [
            'undo', 'redo',
            '|',
            'heading',
            '|',
            'bold', 'italic', 'underline',
            '|',
            'fontSize', 'fontColor', 'fontBackgroundColor',
            '|',
            'alignment',
            '|',
            'numberedList', 'bulletedList',
            '|',
            'outdent', 'indent',
            '|',
            'link', 'blockQuote', 'insertTable',
            '|',
            'imageInsert', 'mediaEmbed'
          ]
        }}
      />
      
      {/* Estilos inline para el editor */}
      <style>{`
        .modern-editor-container .ck-editor__editable {
          min-height: ${height};
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          line-height: 1.7;
          padding: 20px;
          border-color: #d6d3d1;
        }
        
        .modern-editor-container .ck-editor__editable:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        }
        
        .modern-editor-container .ck-toolbar {
          border-color: #fed7aa;
          background: linear-gradient(135deg, #fef7ed 0%, #fff7ed 100%);
        }
        
        .modern-editor-container .ck-button:hover {
          background: #f59e0b;
          color: white;
        }
        
        .modern-editor-container .ck-button.ck-on {
          background: #d97706;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default ModernEditor;