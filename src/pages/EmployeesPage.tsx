import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const EmployeesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dipendenti</h1>
            <p className="text-gray-600">Gestisci i dipendenti</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/employees/new')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Dipendente
        </Button>
      </div>

      <Card>
        <Card.Body>
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-gray-50 rounded-full mb-4">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nessun dipendente</h3>
            <p className="text-gray-500 mt-1">Clicca su "Nuovo Dipendente" per iniziare</p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EmployeesPage; 