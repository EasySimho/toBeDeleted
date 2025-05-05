import React, { useState } from 'react';
import { File, X } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { format } from 'date-fns';

interface RenewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: 'azienda' | 'dipendente';
  currentTitle: string;
  onSuccess: () => void;
}

const RenewDocumentModal: React.FC<RenewDocumentModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentType,
  currentTitle,
  onSuccess
}) => {
  const [dataScadenza, setDataScadenza] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !dataScadenza) {
      setError('Seleziona un file e una data di scadenza');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentId', documentId);
      formData.append('documentType', documentType);
      formData.append('dataScadenza', dataScadenza);

      const response = await fetch('/api/uploadFile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Errore durante il caricamento del file');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Errore durante il rinnovo del documento');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="fixed inset-0 bg-transparent" onClick={onClose} />
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Rinnova Documento</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nuova data di scadenza"
            type="date"
            value={dataScadenza}
            onChange={(e) => setDataScadenza(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nuovo file (PDF o immagine)
            </label>
            <label className="cursor-pointer block">
              <div className="border border-gray-200 hover:border-gray-300 rounded-lg px-4 py-3 flex items-center bg-white transition-all duration-200">
                <File className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-500 flex-1 truncate">
                  {file ? file.name : 'Seleziona un file...'}
                </span>
              </div>
              <input
                type="file"
                className="hidden"
                accept="application/pdf,image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              isLoading={loading}
            >
              Rinnova
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenewDocumentModal;