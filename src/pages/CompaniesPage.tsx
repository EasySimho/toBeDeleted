import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { supabase } from '../lib/supabase';
import { addDays } from 'date-fns';

interface Company {
  id: string;
  nome: string;
  hasExpiringDocuments: boolean;
  hasExpiringEmployeeDocuments: boolean;
}

const CompaniesPage: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const sevenDaysFromNow = addDays(today, 7);

        // Fetch companies
        const { data: companiesData, error: companiesError } = await supabase
          .from('aziende')
          .select('*')
          .order('nome');

        if (companiesError) throw companiesError;

        // Fetch expiring company documents
        const { data: companyDocs, error: companyDocsError } = await supabase
          .from('documenti_azienda')
          .select('azienda_id')
          .lte('data_scadenza', sevenDaysFromNow.toISOString());

        if (companyDocsError) throw companyDocsError;

        // Fetch expiring employee documents
        const { data: employeeDocs, error: employeeDocsError } = await supabase
          .from('documenti')
          .select('dipendenti(azienda_id)')
          .lte('data_scadenza', sevenDaysFromNow.toISOString());

        if (employeeDocsError) throw employeeDocsError;

        // Create a set of company IDs with expiring documents
        const expiringCompanyIds = new Set(
          companyDocs?.map(doc => doc.azienda_id) || []
        );

        // Create a set of company IDs with expiring employee documents
        const expiringEmployeeCompanyIds = new Set(
          employeeDocs?.map(doc => doc.dipendenti?.azienda_id).filter(Boolean) || []
        );

        // Add hasExpiringDocuments flag to companies
        const companiesWithExpiringDocs = companiesData?.map(company => ({
          ...company,
          hasExpiringDocuments: expiringCompanyIds.has(company.id),
          hasExpiringEmployeeDocuments: expiringEmployeeCompanyIds.has(company.id)
        })) || [];

        setCompanies(companiesWithExpiringDocs);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Errore durante il caricamento delle aziende';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aziende</h1>
            <p className="text-gray-600">Gestisci le aziende clienti</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/company/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuova Azienda
        </Button>
      </div>

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <Card>
          <Card.Body>
            <div className="text-center py-8">
              <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Nessuna azienda</h3>
              <p className="text-gray-500 mt-1">Clicca su "Nuova Azienda" per iniziare</p>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card 
              key={company.id} 
              className={`hover:shadow-lg transition-shadow ${
                (company.hasExpiringDocuments || company.hasExpiringEmployeeDocuments) 
                  ? 'border-red-200 hover:border-red-300' 
                  : ''
              }`}
            >
              <Card.Body>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      (company.hasExpiringDocuments || company.hasExpiringEmployeeDocuments)
                        ? 'text-red-600'
                        : 'text-gray-900'
                    }`}>
                      {company.nome}
                    </h3>
                    {(company.hasExpiringDocuments || company.hasExpiringEmployeeDocuments) && (
                      <div className="mt-1">
                        {company.hasExpiringDocuments && (
                          <p className="text-sm text-red-500">
                            Documenti aziendali in scadenza
                          </p>
                        )}
                        {company.hasExpiringEmployeeDocuments && (
                          <p className="text-sm text-red-500">
                            Documenti dipendenti in scadenza
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/company/${company.id}`)}
                  >
                    Dettagli
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage; 