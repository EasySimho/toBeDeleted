import React from 'react';
import Card from './Card';
import DocumentItem from './DocumentItem';
import { User } from 'lucide-react';

interface Document {
  id: string;
  titolo: string;
  data_scadenza: string;
  file_path: string;
}

interface EmployeeCardProps {
  id: string;
  nome: string;
  cognome: string;
  documenti: Document[];
  onClick?: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  id,
  nome,
  cognome,
  documenti,
  onClick,
}) => {
  const hasWarningDocuments = documenti.some((doc) => {
    const today = new Date();
    const scadenza = new Date(doc.data_scadenza);
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + 7);

    return scadenza <= warningDate;
  });

  return (
    <Card
      className={`border ${
        hasWarningDocuments ? 'border-amber-300' : 'border-gray-200'
      } transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
      onClick={onClick}
    >
      <Card.Header className={`${hasWarningDocuments ? 'bg-amber-50' : 'bg-gradient-to-r from-blue-50 to-blue-100'}`}>
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {nome} {cognome}
            </h3>
            <p className="text-sm text-gray-600">
              {documenti.length}{' '}
              {documenti.length === 1 ? 'documento' : 'documenti'}
            </p>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="space-y-3 bg-white">
        {documenti.length > 0 ? (
          documenti.map((doc) => (
            <DocumentItem
              key={doc.id}
              id={doc.id}
              titolo={doc.titolo}
              dataScadenza={doc.data_scadenza}
              filePath={doc.file_path}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-4">
            Nessun documento presente
          </p>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmployeeCard;