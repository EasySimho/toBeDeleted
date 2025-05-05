import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { File, Plus, Trash2 } from 'lucide-react';

interface CompanyDocumentFormProps {
  onDocumentAdd: (document: {
    id: string;
    titolo: string;
    data_scadenza: string;
    file_path: string;
    file: File;
  }) => void;
  onDocumentRemove: (index: number) => void;
  documents: Array<{
    id: string;
    titolo: string;
    data_scadenza: string;
    file_path: string;
    file: File;
  }>;
}

const CompanyDocumentForm: React.FC<CompanyDocumentFormProps> = ({
  onDocumentAdd,
  onDocumentRemove,
  documents
}) => {
  const [titolo, setTitolo] = useState('');
  const [dataScadenza, setDataScadenza] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleAdd = () => {
    if (titolo && dataScadenza && file) {
      const newDocument = {
        id: crypto.randomUUID(),
        titolo,
        data_scadenza: dataScadenza,
        file_path: file.name,
        file,
      };
      onDocumentAdd(newDocument);
      setTitolo('');
      setDataScadenza('');
      setFile(null);
      setError('');
    } else {
      setError('Tutti i campi sono obbligatori');
    }
  };

  return (
    <div className="mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Documenti Aziendali</h3>
        <p className="text-sm text-gray-500">Aggiungi i documenti dell'azienda</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4 border-b border-gray-200 pb-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Titolo documento"
            placeholder="Es. Visura camerale"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            fullWidth
          />
          
          <Input
            label="Data di scadenza"
            type="date"
            value={dataScadenza}
            onChange={(e) => setDataScadenza(e.target.value)}
            fullWidth
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File (PDF o immagine)
          </label>
          <div className="flex items-center">
            <label className="cursor-pointer flex-1">
              <div className="border border-gray-300 rounded-md px-3 py-2 flex items-center bg-white">
                <File className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-gray-500 flex-1 truncate">
                  {file ? file.name : 'Seleziona un file...'}
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="application/pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <Button
              type="button"
              className="ml-3"
              onClick={handleAdd}
            >
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi
            </Button>
          </div>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Documenti aggiunti</h4>
          {documents.map((doc, index) => (
            <div 
              key={doc.id} 
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
            >
              <div className="flex items-center">
                <File className="h-5 w-5 text-blue-800 mr-2" />
                <div>
                  <p className="text-sm font-medium">{doc.titolo}</p>
                  <p className="text-xs text-gray-500">Scadenza: {new Date(doc.data_scadenza).toLocaleDateString('it-IT')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDocumentRemove(index)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyDocumentForm;