import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Clock, RefreshCw, Calendar, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import DocumentItem from '../components/DocumentItem';
import { supabase } from '../lib/supabase';

interface Document {
  id: string;
  titolo: string;
  data_scadenza: string;
  file_path: string;
  tipo: 'azienda' | 'dipendente';
  azienda_id?: string;
  dipendente_id?: string;
  azienda_nome?: string;
  dipendente_nome?: string;
  dipendente_cognome?: string;
}

const DeadlinesPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const today = new Date();
      const thirtyDaysFromNow = addDays(today, 30);

      // Fetch company documents
      const { data: companyDocs, error: companyError } = await supabase
        .from('documenti_azienda')
        .select('id, titolo, data_scadenza, azienda_id')
        .lte('data_scadenza', thirtyDaysFromNow.toISOString())
        .order('data_scadenza');

      if (companyError) {
        console.error('Error loading company documents:', companyError);
        throw new Error(`Errore nel caricamento dei documenti aziendali: ${companyError.message}`);
      }

      // Fetch employee documents
      const { data: employeeDocs, error: employeeError } = await supabase
        .from('documenti')
        .select('id, titolo, data_scadenza, dipendente_id')
        .lte('data_scadenza', thirtyDaysFromNow.toISOString())
        .order('data_scadenza');

      if (employeeError) {
        console.error('Error loading employee documents:', employeeError);
        throw new Error(`Errore nel caricamento dei documenti dei dipendenti: ${employeeError.message}`);
      }

      // Get company names
      const companyIds = [...new Set([
        ...(companyDocs?.map(doc => doc.azienda_id) || []),
        ...(employeeDocs?.map(doc => doc.dipendente_id) || [])
      ])];

      const { data: companies, error: companiesError } = await supabase
        .from('aziende')
        .select('id, nome')
        .in('id', companyIds);

      if (companiesError) {
        console.error('Error loading companies:', companiesError);
        throw new Error(`Errore nel caricamento delle aziende: ${companiesError.message}`);
      }

      // Get employee names
      const employeeIds = employeeDocs?.map(doc => doc.dipendente_id) || [];
      const { data: employees, error: employeesError } = await supabase
        .from('dipendenti')
        .select('id, nome, cognome, azienda_id')
        .in('id', employeeIds);

      if (employeesError) {
        console.error('Error loading employees:', employeesError);
        throw new Error(`Errore nel caricamento dei dipendenti: ${employeesError.message}`);
      }

      // Create a map of company names
      const companyMap = new Map(companies?.map(company => [company.id, company.nome]) || []);

      // Create a map of employee data
      const employeeMap = new Map(
        employees?.map(employee => [
          employee.id,
          {
            nome: employee.nome,
            cognome: employee.cognome,
            azienda_id: employee.azienda_id
          }
        ]) || []
      );

      // Transform company documents
      const transformedCompanyDocs = companyDocs?.map(doc => ({
        id: doc.id,
        titolo: doc.titolo,
        data_scadenza: doc.data_scadenza,
        file_path: '',
        tipo: 'azienda' as const,
        azienda_id: doc.azienda_id,
        azienda_nome: companyMap.get(doc.azienda_id)
      })) || [];

      // Transform employee documents
      const transformedEmployeeDocs = employeeDocs?.map(doc => {
        const employee = employeeMap.get(doc.dipendente_id);
        return {
          id: doc.id,
          titolo: doc.titolo,
          data_scadenza: doc.data_scadenza,
          file_path: '',
          tipo: 'dipendente' as const,
          dipendente_id: doc.dipendente_id,
          dipendente_nome: employee?.nome,
          dipendente_cognome: employee?.cognome,
          azienda_id: employee?.azienda_id,
          azienda_nome: companyMap.get(employee?.azienda_id)
        };
      }) || [];

      setDocuments([...transformedCompanyDocs, ...transformedEmployeeDocs]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore durante il caricamento delle scadenze';
      setError(message);
      console.error('Error in loadDocuments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleNavigate = async (doc: Document) => {
    try {
      if (doc.dipendente_id) {
        navigate(`/company/${doc.azienda_id}`);
      } else {
        navigate(`/company/${doc.azienda_id}`);
      }
    } catch (err) {
      console.error('Error navigating to company:', err);
      setError('Errore durante la navigazione all\'azienda');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scadenze</h1>
            <p className="text-gray-600">Documenti in scadenza nei prossimi 7 giorni</p>
          </div>
        </div>
        <Button 
          onClick={loadDocuments}
          className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Aggiorna
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <Card className="bg-white border-gray-200 hover:border-gray-300 transition-colors duration-200">
          <Card.Body>
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Nessuna scadenza</h3>
              <p className="text-gray-500 mt-1">Non ci sono documenti in scadenza nei prossimi 30 giorni</p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map(doc => {
            const scadenza = parseISO(doc.data_scadenza);
            const isExpired = scadenza < new Date();
            const isExpiring = scadenza <= addDays(new Date(), 7);

            return (
              <Card 
                key={`${doc.tipo}-${doc.id}`}
                className={`
                  p-6 rounded-xl shadow-sm border transition-all duration-200
                  ${isExpired ? 'bg-red-50/80 border-red-200 hover:border-red-300' : 
                    isExpiring ? 'bg-amber-50/80 border-amber-200 hover:border-amber-300' : 
                    'bg-white border-gray-200 hover:border-gray-300'}
                `}
              >
                <Card.Body>
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-6">
                      <div className="flex-shrink-0">
                        {doc.tipo === 'azienda' ? (
                          <div className="h-12 w-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl">
                            <Clock className="h-8 w-8" />
                          </div>
                        ) : (
                          <div className="h-12 w-12 flex items-center justify-center bg-green-50 text-green-600 rounded-xl">
                            <Clock className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {doc.titolo}
                        </h3>
                        <p className="text-base text-gray-700">
                          {doc.dipendente_id ? (
                            <>Dipendente: {doc.dipendente_nome} {doc.dipendente_cognome}</>
                          ) : (
                            <>Azienda: {doc.azienda_nome}</>
                          )}
                        </p>
                        <p className={`
                          text-base font-semibold
                          ${isExpired ? 'text-red-600' : 
                            isExpiring ? 'text-amber-600' : 
                            'text-gray-600'}
                          transition-colors duration-200
                        `}>
                          Scadenza: {format(scadenza, 'd MMMM yyyy', { locale: it })}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <DocumentItem
                        id={doc.id}
                        titolo={doc.titolo}
                        dataScadenza={doc.data_scadenza}
                        filePath={doc.file_path}
                        tipo={doc.tipo}
                        onUpdate={loadDocuments}
                      />
                      <Button
                        size="sm"
                        className={`
                          ${isExpired ? 'bg-red-600 hover:bg-red-700' : 
                            isExpiring ? 'bg-amber-600 hover:bg-amber-700' : 
                            'bg-blue-600 hover:bg-blue-700'}
                          transition-colors duration-200
                        `}
                        onClick={() => handleNavigate(doc)}
                      >
                        Vai all'azienda
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeadlinesPage;