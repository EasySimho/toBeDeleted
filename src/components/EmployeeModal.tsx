import React, { useState } from 'react';
import { X, Plus, Download } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Button from './Button';
import DocumentItem from './DocumentItem';
import DocumentForm from './DocumentForm';
import { supabase } from '../lib/supabase';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    nome: string;
    cognome: string;
    azienda: {
      id: string;
      nome: string;
    };
    documenti: {
      id: string;
      titolo: string;
      data_scadenza: string;
      file_path: string;
    }[];
  };
  onUpdate: () => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onUpdate
}) => {
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddDocument = async (document: {
    titolo: string;
    data_scadenza: string;
    file: File;
  }) => {
    try {
      setError('');

      // Upload file to storage
      const fileExt = document.file.name.split('.').pop();
      const sanitizedNomeAzienda = employee.azienda.nome.replace(/\s+/g, '_');
      const sanitizedNome = employee.nome.replace(/\s+/g, '_');
      const sanitizedCognome = employee.cognome.replace(/\s+/g, '_');
      const sanitizedTitolo = document.titolo.replace(/\s+/g, '_');
      const fileName = `${sanitizedNome}${sanitizedCognome}-${sanitizedTitolo}-${document.data_scadenza}.${fileExt}`;
      const filePath = `${sanitizedNomeAzienda}/dipendenti/${sanitizedNome}_${sanitizedCognome}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, document.file);

      if (uploadError) throw uploadError;

      // Add document record to database
      const { error: insertError } = await supabase
        .from('documenti')
        .insert({
          titolo: document.titolo,
          data_scadenza: document.data_scadenza,
          file_path: filePath,
          dipendente_id: employee.id
        });

      if (insertError) throw insertError;

      setShowAddDocument(false);
      onUpdate();
    } catch (err) {
      console.error('Error adding document:', err);
      setError('Errore durante il caricamento del documento');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {employee.nome} {employee.cognome}
              </h2>
              <p className="text-gray-600 mt-1">
                Azienda: {employee.azienda.nome}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Documenti */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Documenti</h3>
              <Button
                size="sm"
                onClick={() => setShowAddDocument(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Documento
              </Button>
            </div>

            {showAddDocument ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <DocumentForm
                  onSubmit={handleAddDocument}
                  onCancel={() => setShowAddDocument(false)}
                />
              </div>
            ) : (
              <div className="grid gap-4">
                {employee.documenti.map((doc) => (
                  <DocumentItem
                    key={doc.id}
                    id={doc.id}
                    titolo={doc.titolo}
                    dataScadenza={doc.data_scadenza}
                    filePath={doc.file_path}
                    tipo="dipendente"
                    onUpdate={onUpdate}
                  />
                ))}
                {employee.documenti.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nessun documento caricato
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;