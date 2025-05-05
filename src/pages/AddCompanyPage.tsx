import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import { supabase } from '../lib/supabase';

const AddCompanyPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [indirizzo, setIndirizzo] = useState('');
  const [citta, setCitta] = useState('');
  const [cap, setCap] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome || !indirizzo || !citta || !cap) {
      setError('Tutti i campi sono obbligatori');
      return;
    }

    try {
      setLoading(true);

      const { data, error: insertError } = await supabase
        .from('aziende')
        .insert({
          nome,
          indirizzo,
          citta,
          cap
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate(`/company/${data.id}`);
    } catch (err) {
      console.error('Error adding company:', err);
      setError('Errore durante l\'aggiunta dell\'azienda');
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
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Nuova Azienda</h1>
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
                label="Nome Azienda"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Inserisci il nome dell'azienda"
                required
              />

              <Input
                label="Indirizzo"
                value={indirizzo}
                onChange={(e) => setIndirizzo(e.target.value)}
                placeholder="Inserisci l'indirizzo"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Città"
                  value={citta}
                  onChange={(e) => setCitta(e.target.value)}
                  placeholder="Inserisci la città"
                  required
                />

                <Input
                  label="CAP"
                  value={cap}
                  onChange={(e) => setCap(e.target.value)}
                  placeholder="Inserisci il CAP"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/')}
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

export default AddCompanyPage;