import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import Alert from '../components/Alert';
import DocumentForm from '../components/DocumentForm';

const AddCompanyDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nomeAzienda, setNomeAzienda] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the company name using the company ID
    const fetchCompanyName = async () => {
      try {
        const { data, error } = await supabase
          .from('aziende')
          .select('nome')
          .eq('id', id)
          .single();

        if (error) throw error;
        setNomeAzienda(data?.nome || null);
      } catch (err) {
        console.error('Errore nel recupero del nome azienda:', err);
        setError('Errore nel recupero del nome azienda');
      }
    };

    fetchCompanyName();
  }, [id]);

  const handleSubmit = async (documentData: {
    titolo: string;
    data_scadenza: string;
    fileId: string;
  }) => {
    setError('');
    if (!documentData.titolo || !documentData.data_scadenza || !documentData.fileId || !nomeAzienda) {
      setError('Errore durante la creazione del documento');
      return;
    }

    try {
      setLoading(true);
      
      // Add document record
      const { error: insertError } = await supabase
        .from('documenti_azienda')
        .insert({
          titolo: documentData.titolo,
          data_scadenza: documentData.data_scadenza,
          file_id: documentData.fileId,
          azienda_id: id
        });

      if (insertError) throw insertError;

      navigate(`/company/${id}`);
    } catch (err) {
      console.error('Error adding document:', err);
      setError('Errore durante l\'aggiunta del documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => navigate(`/company/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Nuovo Documento Aziendale</h1>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <Alert 
                type="error" 
                message={error} 
                className="mb-6"
              />
            )}

             <DocumentForm onSubmit={handleSubmit} onCancel={() => navigate(`/company/${id}`)} />
          
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyDocumentPage;