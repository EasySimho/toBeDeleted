import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import { supabase } from '../lib/supabase';

const AddCompanyDocumentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [titolo, setTitolo] = useState('');
  const [dataScadenza, setDataScadenza] = useState('');
  const [file, setFile] = useState<File | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!titolo || !dataScadenza || !file || !nomeAzienda) {
      setError('Tutti i campi sono obbligatori');
      return;
    }

    try {
      setLoading(true);

      // Upload file
      const fileExt = file.name.split('.').pop();
      const fileName = `${titolo.replace(/\s+/g, '_')}_${dataScadenza}.${fileExt}`;
      const filePath = `/${nomeAzienda.replace(/\s+/g, '_')}/documenti/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Add document record
      const { error: insertError } = await supabase
        .from('documenti_azienda')
        .insert({
          titolo,
          data_scadenza: dataScadenza,
          file_path: filePath,
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

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/company/${id}`)}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  isLoading={loading}
                >
                  Salva
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyDocumentPage;