# NRC Management System - MongoDB Integration

## 🗄️ MongoDB Database Integration

### Current Data Storage
All data is now stored in **MongoDB** with Node.js backend, which provides:
- ✅ Persistent data storage
- ✅ Fast access and real-time updates
- ✅ Data survives page refresh and server restart
- ✅ Scalable NoSQL database

### MongoDB Database Integration

Complete MongoDB integration with Mongoose ODM for persistent data storage.

## 📊 MongoDB Collections

### Core Collections
- **users** - Authentication and user management
- **anganwadi_centers** - Anganwadi center information
- **workers** - Worker profiles and assignments
- **patients** - Patient registration and basic info
- **medical_records** - Complete medical history
- **beds** - Hospital bed management
- **bed_requests** - Bed allocation requests
- **visits** - Visit scheduling and tracking
- **notifications** - System notifications
- **hospitals** - Hospital information

### MongoDB Features
- ✅ **Document-based storage** with flexible schemas
- ✅ **ObjectId references** for relationships
- ✅ **Mongoose validation** for data integrity
- ✅ **JSON native support** for complex data structures
- ✅ **Audit trails** with created_at/updated_at
- ✅ **Indexing** for optimal performance

## 🔧 Setup Instructions

### Step 1: Install MongoDB

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Run installer and follow setup wizard
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
```

### Step 2: Start MongoDB Service

**Windows:**
```bash
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb/brew/mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 3: Install Dependencies & Start Server
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm run dev
```

### Step 4: Start Frontend
```bash
# In project root directory
npm install
npm run dev
```

## 🚀 Environment Configuration

### Server Environment (.env)
```bash
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nrc_management
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:5173
```

## 🔄 Data Flow

```
Frontend Form → Node.js API → MongoDB → Persistent Storage
```

### API Endpoints
```bash
GET/POST /api/patients
GET/POST /api/anganwadis  
GET/POST /api/workers
GET/POST /api/beds
GET/POST /api/notifications
GET/POST /api/visits
GET/POST /api/bed-requests
GET/POST /api/medical-records
```

## 🎯 Key Features

- ✅ **No data loss** - Everything persists in MongoDB
- ✅ **Real-time updates** - Data syncs across sessions
- ✅ **Proper relationships** - ObjectId references
- ✅ **Schema validation** - Mongoose ensures data integrity
- ✅ **Sample data included** - Ready for immediate testing
- ✅ **Error handling** - Comprehensive error management

## 🔍 Troubleshooting

### "Failed to fetch" Error
1. Ensure MongoDB is running
2. Check server is started (`npm run dev` in server directory)
3. Verify CORS settings in server.js
4. Check network connectivity

### MongoDB Connection Issues
1. Verify MongoDB service is running
2. Check MONGODB_URI in .env file
3. Ensure database permissions
4. Check firewall settings

Your data will now **permanently persist** in MongoDB and never vanish on refresh or restart!
```
```

### 3. Update AppContext
Replace the current in-memory storage with database calls:

```typescript
// Example: Replace mock data with database calls
const { patients, createPatient } = usePatients();
const { beds, updateBed } = useBeds();
const { notifications, createNotification } = useNotifications();
```

### 4. Database Service Usage
```typescript
import { useDatabase, usePatients } from './hooks/useDatabase';

function PatientComponent() {
  const { patients, createPatient, loading } = usePatients();
  
  const handleAddPatient = async (patientData) => {
    try {
      await createPatient(patientData);
      // Patient list automatically refreshes
    } catch (error) {
      console.error('Failed to add patient:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {patients.map(patient => (
        <div key={patient.id}>{patient.name}</div>
      ))}
    </div>
  );
}
```

## 📈 Migration Strategy

### Phase 1: Database Setup
1. Create database and run schema
2. Insert sample data
3. Test connections

### Phase 2: Gradual Migration
1. Start with patient data
2. Add medical records
3. Integrate bed management
4. Add notifications

### Phase 3: Full Integration
1. Replace all context data with database calls
2. Add real-time updates
3. Implement caching strategies
4. Add backup procedures

## 🔒 Security Features

- **Password hashing** with bcrypt
- **SQL injection protection** with parameterized queries
- **Role-based access control** at database level
- **Audit logging** for all operations
- **Data encryption** for sensitive fields

## 📊 Performance Optimizations

- **Database indexes** on frequently queried fields
- **Connection pooling** for efficient resource usage
- **Query optimization** with proper joins
- **Caching strategies** for frequently accessed data
- **Pagination** for large datasets

## 🔄 Real-time Updates

For real-time functionality, consider:
- **WebSocket connections** for live updates
- **Database triggers** for automatic notifications
- **Event-driven architecture** for system integration
- **Redis** for caching and pub/sub

## 📱 API Integration

The database services can be easily extended to work with REST APIs:

```typescript
// API service layer
class ApiService {
  async getPatients() {
    const response = await fetch('/api/patients');
    return response.json();
  }
  
  async createPatient(data) {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
```

## 🎯 Next Steps

1. **Choose your database** (PostgreSQL recommended)
2. **Set up the schema** using the provided SQL file
3. **Install database dependencies**
4. **Configure environment variables**
5. **Replace context calls** with database hooks
6. **Test the integration**
7. **Deploy with persistent storage**

The system is designed to be database-agnostic, so you can easily switch between different database systems based on your requirements.