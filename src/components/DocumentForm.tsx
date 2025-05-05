import React, { useState, ChangeEvent } from 'react';
import { X } from 'lucide-react';
import Button from './Button';
import Input from './Input';

interface DocumentFormProps {
  onSubmit: (document: {
    titolo: string;
    data_scadenza: string; 
    file: File;
  }) => void;
  onCancel: () => void;
}

const DocumentForm: React.FC<DocumentFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [titolo, setTitolo] = useState('');
  const [dataScadenza, setDataScadenza] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!titolo || !dataScadenza || !file ) {
      setError('Tutti i campi sono obbligatori');
      return;
    }
    setIsLoading(true)
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/uploadFile', {
        method: 'POST',
        body: formData,
      });
      const { fileId } = await response.json();
  
      onSubmit({
        titolo,
        data_scadenza: dataScadenza,
        file: { ...file, id:fileId}
      });
    } catch (err) {
      setError('Errore durante il caricamento del file.');
    }

    setIsLoading(false)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Nuovo Documento</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Input
        label="Titolo"
        value={titolo}
        onChange={(e) => setTitolo(e.target.value)}
        placeholder="Inserisci il titolo del documento"
        required
      />

      <Input
        label="Data di scadenza"
        type="date"
        value={dataScadenza}
        onChange={(e) => setDataScadenza(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          File
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Annulla
        </Button>
        <Button type="submit" disabled={isLoading}>
          Salva
        </Button>
      </div>
    </form>
  );
};

export default DocumentForm;