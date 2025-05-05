import React, { useState } from 'react';
import { format, parseISO, isAfter, addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { File, AlertTriangle, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { deleteFile } from '../lib/utils';
import Button from './Button';
import RenewDocumentModal from './RenewDocumentModal';

interface DocumentItemProps {
  id: string;
  titolo: string;
  dataScadenza: string; 
  fileId: string;
  tipo?: 'azienda' | 'dipendente';
  onUpdate?: () => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
  id,
  titolo,
  dataScadenza,
  fileId,
  tipo = 'dipendente',
  onUpdate
}) => {
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  
  const scadenzaDate = parseISO(dataScadenza);
  const today = new Date();
  const warningDate = addDays(today, 7);
  
  const isExpiring = isAfter(warningDate, scadenzaDate) && isAfter(scadenzaDate, today);
  const isExpired = isAfter(today, scadenzaDate);
  const shouldShowWarning = isExpiring || isExpired;
  
  const formattedDate = format(scadenzaDate, 'd MMMM yyyy', { locale: it });

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/downloadFile?fileId=${fileId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileId;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error downloading file:', err);
      setDownloadError('Errore durante il download del file');
    }
  };
  
  return (
    <>
      <div className={`
        border rounded-xl p-6 transition-all duration-200
        ${shouldShowWarning ? 'bg-red-50/80 border-red-200 shadow-red-100/50 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}
        hover:shadow-lg hover:scale-[1.01] transform
      `}>
        {/* Dettagli del documento */}
        <div className="flex items-start space-x-4">
          {/* Icona */}
          <div className={`
            p-3 rounded-xl
            ${shouldShowWarning ? 'bg-red-100/80' : 'bg-blue-50'}
            transition-colors duration-200
          `}>
            <File className={`
              h-6 w-6
              ${shouldShowWarning ? 'text-red-600' : 'text-blue-600'}
              transition-colors duration-200
            `} />
          </div>

          {/* Informazioni */}
          <div className="flex-1 min-w-0">
            <h4 className={`
              font-semibold text-lg truncate
              ${shouldShowWarning ? 'text-red-800' : 'text-gray-900'}
              transition-colors duration-200
            `}>
              {titolo}
            </h4>
            <p className={`
              text-sm mt-1
              ${shouldShowWarning ? 'text-red-600' : 'text-gray-600'}
              transition-colors duration-200
            `}>
              Scadenza: {formattedDate}
            </p>
            {downloadError && (
              <p className="text-sm text-red-600 mt-2">{downloadError}</p>
            )}
          </div>

          {/* Stato (Scaduto/In scadenza) */}
          {shouldShowWarning && (
            <div className={`
              flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${shouldShowWarning ? 'bg-red-100/80 text-red-800' : 'bg-amber-100 text-amber-800'}
              transition-colors duration-200
            `}>
              <AlertTriangle className="h-4 w-4 mr-1.5" />
              <span>{isExpired ? 'Scaduto' : 'In scadenza'}</span>
            </div>
          )}
        </div>

        {/* Linea divisoria */}
        <hr className={`
          my-4
          ${shouldShowWarning ? 'border-red-200' : 'border-gray-200'}
          transition-colors duration-200
        `} />

        {/* Pulsanti */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            className={`
              ${shouldShowWarning ? 'hover:bg-red-50 hover:text-red-700' : ''}
              transition-colors duration-200
            `}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Scarica
          </Button>
          <Button
            size="sm"
            onClick={() => setIsRenewModalOpen(true)}
            variant="danger"
            onClick={async () => {
              await deleteFile(fileId);
              if (onUpdate) {
                onUpdate();
              }
            }}
          >
            Elimina
          </Button>
          <Button
            className={`
              ${shouldShowWarning ? 'bg-red-600 hover:bg-red-700' : ''}
              transition-colors duration-200
            `}
          >
            Rinnova
          </Button>
        </div>
      </div>

      <RenewDocumentModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        documentId={id}
        documentType={tipo}
        currentTitle={titolo}
        onSuccess={() => {
          if (onUpdate) onUpdate();
        }}
      />
    </>
  );
};

export default DocumentItem;