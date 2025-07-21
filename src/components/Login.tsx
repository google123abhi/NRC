import React, { useState } from 'react';
import { Users, Guitar as Hospital, UserCheck, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LoginProps {
  onLogin: (role: 'anganwadi_worker' | 'supervisor' | 'hospital', userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useApp();
  const [selectedRole, setSelectedRole] = useState<'anganwadi_worker' | 'supervisor' | 'hospital'>('anganwadi_worker');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    employeeId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data for different roles
  const mockUsers = {
    anganwadi_worker: [
      { 
        username: 'priya.sharma', 
        password: 'worker123', 
        employeeId: 'EMP001', 
        name: 'Priya Sharma', 
        role: 'anganwadi_worker',
        anganwadiId: 'AWC001',
        assignedAreas: ['Sadar Bazaar', 'Civil Lines']
      },
      { 
        username: 'meera.devi', 
        password: 'worker123', 
        employeeId: 'EMP002', 
        name: 'Meera Devi', 
        role: 'anganwadi_worker',
        anganwadiId: 'AWC001',
        assignedAreas: ['Shastri Nagar']
      }
    ],
    supervisor: [
      { 
        username: 'supervisor1', 
        password: 'super123', 
        employeeId: 'SUP001', 
        name: 'Dr. Sunita Devi', 
        role: 'supervisor',
        department: 'NRC Management',
        jurisdiction: 'Meerut Block'
      },
      { 
        username: 'supervisor2', 
        password: 'super123', 
        employeeId: 'SUP002', 
        name: 'Dr. Rajesh Kumar', 
        role: 'supervisor',
        department: 'Community Health',
        jurisdiction: 'Meerut District'
      }
    ],
    hospital: [
      { 
        username: 'hospital1', 
        password: 'hosp123', 
        employeeId: 'HOSP001', 
        name: 'Dr. Amit Sharma', 
        role: 'hospital',
        department: 'Pediatrics',
        hospitalId: 'HOSP001'
      },
      { 
        username: 'hospital2', 
        password: 'hosp123', 
        employeeId: 'HOSP002', 
        name: 'Dr. Kavita Singh', 
        role: 'hospital',
        department: 'Gynecology',
        hospitalId: 'HOSP001'
      }
    ]
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const users = mockUsers[selectedRole];
    const user = users.find(u => 
      u.username === credentials.username && 
      u.password === credentials.password &&
      u.employeeId === credentials.employeeId
    );

    if (user) {
      onLogin(selectedRole, user);
    } else {
      alert('Invalid credentials. Please try again.');
    }

    setIsLoading(false);
  };

  const roleConfigs = {
    anganwadi_worker: {
      title: 'Anganwadi Worker Login',
      subtitle: 'Ground-level health worker for SAM children & pregnant women identification',
      icon: Users,
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      features: [
        'Patient Registration with Aadhaar',
        'Medical Record Management',
        'Visit Scheduling & Tracking',
        'Bed Availability & Requests',
        'AI Health Predictions',
        'Post-Hospitalization Tracking'
      ]
    },
    supervisor: {
      title: 'Department Supervisor Login',
      subtitle: 'Block/District level officer overseeing Anganwadi operations',
      icon: UserCheck,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      features: [
        'Dashboard Analytics & Trends',
        'Center & Worker Management',
        'Visit Ticketing System',
        'Survey Management',
        'Bed Coordination',
        'Admission/Discharge Tracking'
      ]
    },
    hospital: {
      title: 'Government Hospital Login',
      subtitle: 'NRC-equipped hospital for treatment & bed management',
      icon: Hospital,
      color: 'bg-red-600',
      hoverColor: 'hover:bg-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      features: [
        'Bed Availability Dashboard',
        'Patient Treatment Tracker',
        'Medical Report Upload',
        'Notification System',
        'AI Bed Demand Prediction',
        'Discharge Management'
      ]
    }
  };

  const currentConfig = roleConfigs[selectedRole];
  const Icon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('system.title')}</h1>
          <p className="text-xl text-gray-600">{t('system.subtitle')}</p>
          <p className="text-sm text-gray-500 mt-2">Bilingual System • द्विभाषी प्रणाली</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Role Selection */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Select Your Role
            </h2>
            <div className="space-y-4">
              {Object.entries(roleConfigs).map(([role, config]) => {
                const RoleIcon = config.icon;
                return (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role as any)}
                    className={`w-full p-4 rounded-lg border-2 transition-all ${
                      selectedRole === role
                        ? `${config.bgColor} ${config.borderColor} ${config.textColor}`
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <RoleIcon className="w-6 h-6 mt-1" />
                      <div className="text-left flex-1">
                        <div className="font-semibold text-lg">{config.title.replace(' Login', '')}</div>
                        <div className="text-sm opacity-90 mt-1">{config.subtitle}</div>
                        <div className="mt-3 grid grid-cols-1 gap-1">
                          {config.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="text-xs opacity-75 flex items-center">
                              <div className="w-1 h-1 bg-current rounded-full mr-2"></div>
                              {feature}
                            </div>
                          ))}
                          {config.features.length > 3 && (
                            <div className="text-xs opacity-60">+{config.features.length - 3} more features</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 ${currentConfig.color} rounded-full flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{currentConfig.title}</h3>
                <p className="text-sm text-gray-600">{currentConfig.subtitle}</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID • कर्मचारी आईडी
                </label>
                <input
                  type="text"
                  required
                  value={credentials.employeeId}
                  onChange={(e) => setCredentials({...credentials, employeeId: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your employee ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username • उपयोगकर्ता नाम
                </label>
                <input
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password • पासवर्ड
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${currentConfig.color} ${currentConfig.hoverColor} text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In • साइन इन करें</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Demo Credentials • डेमो क्रेडेंशियल:
              </h4>
              <div className="text-xs text-gray-600 space-y-2">
                {selectedRole === 'anganwadi_worker' && (
                  <>
                    <div className="bg-white p-2 rounded border">
                      <strong>Worker 1:</strong> EMP001 / priya.sharma / worker123
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong>Worker 2:</strong> EMP002 / meera.devi / worker123
                    </div>
                  </>
                )}
                {selectedRole === 'supervisor' && (
                  <>
                    <div className="bg-white p-2 rounded border">
                      <strong>Supervisor 1:</strong> SUP001 / supervisor1 / super123
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong>Supervisor 2:</strong> SUP002 / supervisor2 / super123
                    </div>
                  </>
                )}
                {selectedRole === 'hospital' && (
                  <>
                    <div className="bg-white p-2 rounded border">
                      <strong>Pediatrics:</strong> HOSP001 / hospital1 / hosp123
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong>Gynecology:</strong> HOSP002 / hospital2 / hosp123
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;