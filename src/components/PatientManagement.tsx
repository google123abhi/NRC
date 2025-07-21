import React, { useState } from 'react';
import { Plus, Search, Edit, Eye, Phone, MapPin, Calendar, User, Baby, Heart } from 'lucide-react';
import { useApp, Patient } from '../context/AppContext';

const PatientManagement: React.FC = () => {
  const { patients, addPatient, updatePatient, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'child' | 'pregnant'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'malnourished' | 'severely_malnourished'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.contactNumber.includes(searchTerm);
    const matchesType = filterType === 'all' || patient.type === filterType;
    const matchesStatus = filterStatus === 'all' || patient.nutritionStatus === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'malnourished': return 'bg-yellow-100 text-yellow-800';
      case 'severely_malnourished': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowEditForm(true);
  };

  const PatientForm = ({ isEdit = false }: { isEdit?: boolean }) => {
    const initialData = isEdit && editingPatient ? {
      name: editingPatient.name,
      age: editingPatient.age.toString(),
      type: editingPatient.type,
      pregnancyWeek: editingPatient.pregnancyWeek?.toString() || '',
      contactNumber: editingPatient.contactNumber,
      address: editingPatient.address,
      weight: editingPatient.weight.toString(),
      height: editingPatient.height.toString(),
      medicalHistory: editingPatient.medicalHistory.join(', '),
      nutritionStatus: editingPatient.nutritionStatus,
      nextVisit: editingPatient.nextVisit,
    } : {
      name: '',
      age: '',
      type: 'child' as 'child' | 'pregnant',
      pregnancyWeek: '',
      contactNumber: '',
      address: '',
      weight: '',
      height: '',
      medicalHistory: '',
      nutritionStatus: 'normal' as 'normal' | 'malnourished' | 'severely_malnourished',
      nextVisit: '',
    };

    const [formData, setFormData] = useState(initialData);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const patientData = {
        ...formData,
        age: parseInt(formData.age),
        pregnancyWeek: formData.pregnancyWeek ? parseInt(formData.pregnancyWeek) : undefined,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        medicalHistory: formData.medicalHistory.split(',').map(h => h.trim()).filter(h => h),
        admissionDate: isEdit && editingPatient ? editingPatient.admissionDate : new Date().toISOString().split('T')[0],
        registrationNumber: isEdit && editingPatient ? editingPatient.registrationNumber : `NRC${Date.now()}`,
        emergencyContact: formData.contactNumber,
      };

      if (isEdit && editingPatient) {
        updatePatient(editingPatient.id, patientData);
        setShowEditForm(false);
        setEditingPatient(null);
      } else {
        addPatient(patientData);
        setShowAddForm(false);
      }

      setFormData(initialData);
    };

    const closeForm = () => {
      if (isEdit) {
        setShowEditForm(false);
        setEditingPatient(null);
      } else {
        setShowAddForm(false);
      }
      setFormData(initialData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? t('patient.edit') : t('patient.add')}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.name')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.age')}</label>
                <input
                  type="number"
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.type')}</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as 'child' | 'pregnant'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="child">{t('patient.child')}</option>
                  <option value="pregnant">{t('patient.pregnant')}</option>
                </select>
              </div>
              {formData.type === 'pregnant' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.pregnancyWeek')}</label>
                  <input
                    type="number"
                    value={formData.pregnancyWeek}
                    onChange={(e) => setFormData({...formData, pregnancyWeek: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.contact')}</label>
                <input
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.weight')} (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.height')} (cm)</label>
                <input
                  type="number"
                  required
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.nutritionStatus')}</label>
                <select
                  value={formData.nutritionStatus}
                  onChange={(e) => setFormData({...formData, nutritionStatus: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="normal">{t('patient.normal')}</option>
                  <option value="malnourished">{t('patient.malnourished')}</option>
                  <option value="severely_malnourished">{t('patient.severelyMalnourished')}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.address')}</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.medicalHistory')} ({t('common.commaSeparated')})</label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('patient.nextVisit')}</label>
              <input
                type="date"
                required
                value={formData.nextVisit}
                onChange={(e) => setFormData({...formData, nextVisit: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isEdit ? t('common.update') : t('patient.add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const PatientDetailsModal = ({ patient }: { patient: Patient }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
            <button
              onClick={() => setSelectedPatient(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">{t('patient.basicInfo')}</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm">{t('common.age')}: {patient.age} {t('common.years')}</span>
                </div>
                <div className="flex items-center">
                  {patient.type === 'child' ? (
                    <Baby className="w-4 h-4 text-gray-500 mr-2" />
                  ) : (
                    <Heart className="w-4 h-4 text-gray-500 mr-2" />
                  )}
                  <span className="text-sm">
                    {t('patient.type')}: {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')}
                    {patient.pregnancyWeek && ` (${patient.pregnancyWeek} ${t('patient.weeks')})`}
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm">{patient.contactNumber}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm">{patient.address}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">{t('patient.healthInfo')}</h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">{t('patient.nutritionStatus')}:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(patient.nutritionStatus)}`}>
                    {t(`patient.${patient.nutritionStatus}`)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{t('common.weight')}:</span> {patient.weight} kg
                </div>
                <div className="text-sm">
                  <span className="font-medium">{t('common.height')}:</span> {patient.height} cm
                </div>
                {patient.bloodPressure && (
                  <div className="text-sm">
                    <span className="font-medium">{t('patient.bloodPressure')}:</span> {patient.bloodPressure}
                  </div>
                )}
                {patient.hemoglobin && (
                  <div className="text-sm">
                    <span className="font-medium">{t('patient.hemoglobin')}:</span> {patient.hemoglobin} g/dL
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">{t('patient.medicalHistory')}</h4>
            <div className="flex flex-wrap gap-2">
              {patient.medicalHistory.map((history, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  {history}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">{t('patient.visitInfo')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">{t('patient.admissionDate')}:</span>
                <p className="text-sm text-gray-600">{new Date(patient.admissionDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium">{t('patient.nextVisit')}:</span>
                <p className="text-sm text-gray-600">{new Date(patient.nextVisit).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{t('nav.patients')}</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('patient.add')}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('patient.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{t('patient.allTypes')}</option>
            <option value="child">{t('patient.children')}</option>
            <option value="pregnant">{t('patient.pregnantWomen')}</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{t('patient.allStatuses')}</option>
            <option value="normal">{t('patient.normal')}</option>
            <option value="malnourished">{t('patient.malnourished')}</option>
            <option value="severely_malnourished">{t('patient.severelyMalnourished')}</option>
          </select>
        </div>
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('patient.patient')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('patient.type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('patient.nutritionStatus')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('patient.nextVisit')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">{patient.age} {t('common.yearsOld')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {patient.type === 'child' ? (
                        <Baby className="w-4 h-4 text-blue-500 mr-2" />
                      ) : (
                        <Heart className="w-4 h-4 text-pink-500 mr-2" />
                      )}
                      <span className="text-sm text-gray-900">
                        {patient.type === 'child' ? t('patient.child') : t('patient.pregnant')}
                        {patient.pregnancyWeek && ` (${patient.pregnancyWeek}w)`}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.nutritionStatus)}`}>
                      {t(`patient.${patient.nutritionStatus}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(patient.nextVisit).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title={t('common.view')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title={t('common.edit')}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showAddForm && <PatientForm />}
      {showEditForm && <PatientForm isEdit={true} />}
      {selectedPatient && <PatientDetailsModal patient={selectedPatient} />}
    </div>
  );
};

export default PatientManagement;