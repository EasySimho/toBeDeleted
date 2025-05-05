import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Download, Trash } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import Alert from '../components/Alert';

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<{
    id: string;
    titolo: string;
    data_scadenza: string;
    file_id: string;
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('documenti')
          .select('id, titolo, data_scadenza, file_id');

        if (error) throw error;
        setDocuments(data || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDelete = async (fileId: string, documentId: string) => {
    try {
      await fetch(`/api/deleteFile?fileId=${fileId}`, {
        method: 'DELETE',
      });
      setDocuments(documents.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  const handleDownload = (fileId: string) => {
    const url = `/api/downloadFile?fileId=${fileId}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert type="error" message={error} className="mb-4" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documenti</h1>
            <p className="text-gray-600">Gestisci i documenti</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/documents/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Documento
        </Button>
      </div>

      {loading ? (
        <Card>
          <Card.Body>
            <div className="text-center py-8">Loading...</div>
          </Card.Body>
        </Card>
      ) : documents.length > 0 ? (
        documents.map((document) => (
          <Card key={document.id}>
            <Card.Body>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {document.titolo}
                  </h3>
                  <p className="text-gray-500">
                    Scadenza: {document.data_scadenza}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => handleDownload(document.file_id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(document.file_id, document.id)} variant="destructive">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Card><Card.Body><div className="text-center py-8"><div className="inline-flex p-4 bg-gray-50 rounded-full mb-4"><FileText className="h-12 w-12 text-gray-400" /></div><h3 className="text-lg font-medium text-gray-900">Nessun documento</h3><p className="text-gray-500 mt-1">Clicca su "Nuovo Documento" per iniziare</p></div></Card.Body></Card>
      )}
    </div>
  );
};

export default DocumentsPage; 