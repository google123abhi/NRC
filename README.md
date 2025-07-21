# NRC Management System - Database Integration

## 🗄️ Database Storage & Integration

### Current Data Storage
Currently, all data is stored in **React Context (in-memory)**, which means:
- ✅ Fast access and real-time updates
- ❌ Data resets on page refresh
- ❌ No persistence between sessions

### SQL Database Integration

I've created a complete SQL database schema and integration layer for persistent data storage.

## 📊 Database Schema

### Core Tables
- **users** - Authentication and user management
- **anganwadi_centers** - Anganwadi center information
- **workers** - Worker profiles and assignments
- **patients** - Patient registration and basic info
- **medical_records** - Complete medical history
- **medications** - Prescribed medications
- **beds** - Hospital bed management
- **bed_requests** - Bed allocation requests
- **visits** - Visit scheduling and tracking
- **missed_visit_tickets** - Automated ticketing system
- **treatment_trackers** - Hospital treatment tracking
- **survey_reports** - Nutrition surveys
- **ai_predictions** - AI health predictions
- **notifications** - System notifications

### Database Features
- ✅ **Complete relationships** between all entities
- ✅ **Foreign key constraints** for data integrity
- ✅ **Indexes** for optimal performance
- ✅ **JSONB fields** for flexible data storage
- ✅ **Audit trails** with created_at/updated_at
- ✅ **Soft deletes** with is_active flags

## 🔧 Integration Options

### Option 1: PostgreSQL (Recommended)
```bash
# Install PostgreSQL
npm install pg @types/pg

# Create database
createdb nrc_management

# Run schema
psql -d nrc_management -f database/schema.sql
```

### Option 2: MySQL
```bash
# Install MySQL
npm install mysql2

# Create database and run schema
mysql -u root -p < database/schema.sql
```

### Option 3: SQLite (Development)
```bash
# Install SQLite
npm install sqlite3

# Lightweight option for development
```

## 🚀 Implementation Steps

### 1. Set up Database
```bash
# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
REACT_APP_DB_HOST=localhost
REACT_APP_DB_PORT=5432
REACT_APP_DB_NAME=nrc_management
REACT_APP_DB_USER=your_username
REACT_APP_DB_PASSWORD=your_password
```

### 2. Install Dependencies
```bash
# For PostgreSQL
npm install pg @types/pg

# For connection pooling
npm install pg-pool

# For migrations (optional)
npm install knex
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