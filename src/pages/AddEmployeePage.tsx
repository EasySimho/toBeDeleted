import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import { supabase } from '../lib/supabase';

const AddEmployeePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nome || !cognome) {
      setError('Tutti i campi sono obbligatori');
      return;
    }

    try {
      setLoading(true);

      const { error: insertError } = await supabase
        .from('dipendenti')
        .insert({
          nome,
          cognome,
          azienda_id: id
        });

      if (insertError) throw insertError;

      navigate(`/company/${id}`);
    } catch (err) {
      console.error('Error adding employee:', err);
      setError('Errore durante l\'aggiunta del dipendente');
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
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Nuovo Dipendente</h1>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Inserisci il nome"
                  required
                />
                
                <Input
                  label="Cognome"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  placeholder="Inserisci il cognome"
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

export default AddEmployeePage;