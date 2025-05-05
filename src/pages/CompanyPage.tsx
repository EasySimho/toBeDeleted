import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, FileText, Plus, ArrowLeft, Loader2, Trash2, Search, MapPin, Hash } from 'lucide-react';
import Button from '../components/Button';
import Alert from '../components/Alert';
import Card from '../components/Card';
import DocumentItem from '../components/DocumentItem';
import EmployeeModal from '../components/EmployeeModal';
import ConfirmModal from '../components/ConfirmModal';
import { supabase } from '../lib/supabase';
import { addDays } from 'date-fns';

interface Company {
  id: string;
  nome: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
}

interface Employee {
  id: string;
  nome: string;
  cognome: string;
  documenti: {
    id: string;
    titolo: string;
    data_scadenza: string;
    fileId: string;
  }[];
  hasExpiringDocuments: boolean;
}

interface CompanyDocument {
  id: string;
  titolo: string;
  data_scadenza: string;  
  fileId: string;
}

const CompanyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'documents' | 'employees'>('documents');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // Filtra i dipendenti in base al termine di ricerca
  const filteredEmployees = employees.filter((employee) =>
    `${employee.nome} ${employee.cognome}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtra i documenti aziendali in base al termine di ricerca
  const filteredDocuments = documents.filter((doc) =>
    doc.titolo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch company details
        const { data: companyData, error: companyError } = await supabase
          .from('aziende')
          .select('*')
          .eq('id', id)
          .single();

        if (companyError) throw companyError;
        setCompany(companyData);

        // Fetch company documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documenti_azienda')
          .select('*, fileId')
          .eq('azienda_id', id);

        if (documentsError) throw documentsError;
        setDocuments(documentsData);

        // Fetch employees with their documents
        const { data: employeesData, error: employeesError } = await supabase
          .from('dipendenti')
          .select('*, documenti(*)')
          .eq('azienda_id', id);

        if (employeesError) throw employeesError;

        const today = new Date();
        const sevenDayFromNow = addDays(today, 7);

        // Load expiring employee documents
        const { data: employeeDocs, error: employeeDocsError } = await supabase
          .from('documenti')
          .select('dipendente_id')
          .in('dipendente_id', employeesData?.map(e => e.id) || [])
          .lte('data_scadenza', sevenDayFromNow.toISOString());

        if (employeeDocsError) throw employeeDocsError;

        // Create a set of employee IDs with expiring documents
        const expiringEmployeeIds = new Set(
          employeeDocs?.map(doc => doc.dipendente_id) || []
        );

        // Add hasExpiringDocuments flag to employees
        const employeesWithExpiringDocs = employeesData?.map(employee => ({
          ...employee,
          hasExpiringDocuments: expiringEmployeeIds.has(employee.id)
        })) || [];

        setEmployees(employeesWithExpiringDocs);

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Errore durante il caricamento dei dati';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, [id]);

  

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      setDeleteError('');
      setLoading(true);

      // Prima elimina tutti i documenti del dipendente
      const { error: deleteDocsError } = await supabase
        .from('documenti')
        .select('fileId')
        .eq('dipendente_id', employeeToDelete.id);
      
      if(deleteDocsError) throw deleteDocsError;
        .delete()
        .eq('dipendente_id', employeeToDelete.id);

      if (deleteDocsError) throw deleteDocsError;

      // Poi elimina il dipendente
      const { error: deleteEmployeeError } = await supabase
        .from('dipendenti')
        .delete()
        .eq('id', employeeToDelete.id);

      if (deleteEmployeeError) throw deleteEmployeeError;

      // Aggiorna la lista dei dipendenti
      setEmployees(employees.filter(e => e.id !== employeeToDelete.id));
      setEmployeeToDelete(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      setDeleteError('Errore durante l\'eliminazione del dipendente');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-800 animate-spin mb-4" />
        <p className="text-gray-600">Caricamento dati...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <Alert type="error" message="Azienda non trovata" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-blue-800 hover:text-blue-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-800 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">{company.nome}</h1>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina Azienda
          </Button>
        </div>

        {/* Dettagli Azienda */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-500">Indirizzo</h3>
            </div>
            <p className="mt-1 text-lg text-gray-900">{company.indirizzo || '-'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-500">Città</h3>
            </div>
            <p className="mt-1 text-lg text-gray-900">{company.citta || '-'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-500">CAP</h3>
            </div>
            <p className="mt-1 text-lg text-gray-900">{company.cap || '-'}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-500" />
              <h3 className="text-sm font-medium text-gray-500">Dipendenti</h3>
            </div>
            <p className="mt-1 text-lg text-gray-900">{employees.length}</p>
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Tabs */}
      <div className="bg-white shadow-sm rounded-xl overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-800 text-blue-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              <div className="flex items-center justify-center">
                <FileText className="h-5 w-5 mr-2" />
                Documenti Aziendali
              </div>
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'employees'
                  ? 'border-blue-800 text-blue-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('employees')}
            >
              <div className="flex items-center justify-center">
                <Users className="h-5 w-5 mr-2" />
                Dipendenti
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'documents' ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cerca documenti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <Button
                  onClick={() => navigate(`/company/${id}/documenti/nuovo`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Documento
                </Button>
              </div>

              <div className="grid gap-4">
                {filteredDocuments.map((doc) => (
                  <DocumentItem
                    key={doc.id}
                    id={doc.id}
                    titolo={doc.titolo}
                    dataScadenza={doc.data_scadenza}
                    fileId={doc.fileId}
                    tipo="azienda"
                    onUpdate={() => {
                      // Ricarica i documenti
                      const loadDocuments = async () => {
                        const { data, error } = await supabase
                          .from('documenti_azienda')
                          .select('*')
                          .eq('azienda_id', id);

                        if (!error && data) {
                          setDocuments(data);
                        }
                      };

                      loadDocuments();
                    }}
                  />
                ))}
                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nessun documento caricato
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cerca dipendenti..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={() => navigate(`/company/${id}/dipendenti/nuovo`)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuovo Dipendente
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((employee) => (
                  <Card 
                    key={employee.id} 
                    className={`p-6 ${
                      employee.hasExpiringDocuments 
                        ? 'border-2 border-red-500 bg-red-50 hover:bg-red-100' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className={`text-lg font-medium ${
                          employee.hasExpiringDocuments ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {employee.nome} {employee.cognome}
                        </h3>
                        {employee.hasExpiringDocuments && (
                          <div className="flex items-center mt-1">
                            <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                            <p className="text-sm font-semibold text-red-600">
                              Documenti in scadenza
                            </p>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          setEmployeeToDelete(employee);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className={`flex items-center text-sm ${
                        employee.hasExpiringDocuments ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{employee.documenti.length} documenti</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        variant={employee.hasExpiringDocuments ? "danger" : "secondary"}
                        fullWidth
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsEmployeeModalOpen(true);
                        }}
                      >
                        Gestisci Documenti
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conferma eliminazione</h3>
            <p className="text-gray-600 mb-6">
              Sei sicuro di voler eliminare questa azienda? Questa azione eliminerà anche tutti i dipendenti e i documenti associati.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Annulla
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteCompany}
              >
                Elimina
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      {selectedEmployee && (
        <EmployeeModal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          employee={{
            ...selectedEmployee,
            azienda: {
              id: company?.id || '',
              nome: company?.nome || ''
            }
          }}
          onUpdate={() => {
            // Ricarica i dati del dipendente
            const loadEmployeeData = async () => {
              const { data, error } = await supabase
                .from('dipendenti')
                .select('*, documenti(*)')
                .eq('id', selectedEmployee.id)
                .single();

              if (!error && data) {
                setSelectedEmployee(data);
                setEmployees(employees.map(emp => 
                  emp.id === data.id ? data : emp
                ));
              }
            };

            loadEmployeeData();
          }}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setEmployeeToDelete(null);
        }}
        onConfirm={handleDeleteEmployee}
        title="Elimina Dipendente"
        message={`Sei sicuro di voler eliminare il dipendente ${employeeToDelete?.nome} ${employeeToDelete?.cognome}? Questa azione non può essere annullata.`}
        confirmText="Elimina"
      />
    </div>
  );
};

export default CompanyPage;