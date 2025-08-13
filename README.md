# NRC Management System - MySQL Integration

## 🗄️ MySQL Database Integration

### Current Data Storage
All data is now stored in **MySQL** with Node.js backend, which provides:
- ✅ Persistent data storage with ACID compliance
- ✅ Fast access and real-time updates
- ✅ Data survives page refresh and server restart
- ✅ Scalable relational database with proper relationships

## 📊 MySQL Database Schema

### Core Tables
- **users** - Authentication and user management with admin panel
- **anganwadi_centers** - Anganwadi center information
- **workers** - Worker profiles and assignments
- **patients** - Patient registration and basic info
- **medical_records** - Complete medical history
- **beds** - Hospital bed management
- **bed_requests** - Bed allocation requests
- **visits** - Visit scheduling and tracking
- **notifications** - System notifications
- **hospitals** - Hospital information

### MySQL Features
- ✅ **ACID compliance** for data integrity
- ✅ **Foreign key constraints** for relationships
- ✅ **JSON field support** for complex data structures
- ✅ **Indexing** for optimal performance
- ✅ **Audit trails** with created_at/updated_at
- ✅ **Admin panel** for user management

## 🔧 Setup Instructions

### Step 1: Install MySQL

**Windows:**
1. Download MySQL Community Server from: https://dev.mysql.com/downloads/mysql/
2. Run installer and follow setup wizard
3. Remember the root password you set during installation

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Step 2: Create Database and Schema

**Option 1: Using MySQL Command Line**
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE nrc_management;

# Exit MySQL shell
exit

# Import schema
mysql -u root -p nrc_management < server/database/mysql-schema.sql
```

**Option 2: Using MySQL Workbench**
1. Open MySQL Workbench
2. Connect to your local MySQL server
3. Create new schema: `nrc_management`
4. Open and execute: `server/database/mysql-schema.sql`

### Step 3: Configure Environment
```bash
# Update server/.env file with your MySQL credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nrc_management
```

### Step 4: Install Dependencies & Start Server
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Start the server
npm run dev
```

### Step 5: Start Frontend
```bash
# In project root directory
npm install
npm run dev
```

## 🔄 Data Flow

```
Frontend Form → Node.js API → MySQL Database → Persistent Storage
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
GET/POST /api/auth/users (Admin only)
```

## 👑 Admin Panel Features

### User Management
- ✅ **Create new users** with role assignment
- ✅ **Edit user details** and permissions
- ✅ **Deactivate users** (soft delete)
- ✅ **Password management** with bcrypt hashing
- ✅ **Role-based access control**

### Default Admin Credentials
```
Employee ID: ADMIN001
Username: admin
Password: admin123
```

### Default User Credentials
```
Anganwadi Worker: EMP001 / priya.sharma / worker123
Supervisor: SUP001 / supervisor1 / super123
Hospital Staff: HOSP001 / hospital1 / hosp123
```

## 🎯 Key Features

- ✅ **No data loss** - Everything persists in MySQL
- ✅ **Real-time updates** - Data syncs across sessions
- ✅ **Proper relationships** - Foreign key constraints
- ✅ **Admin panel** - Complete user management
- ✅ **Sample data included** - Ready for immediate testing
- ✅ **Error handling** - Comprehensive error management

## 🔍 Troubleshooting

### "Failed to fetch" Error
1. Ensure MySQL is running: `sudo systemctl status mysql`
2. Check server is started: `npm run dev` in server directory
3. Verify database credentials in server/.env
4. Check network connectivity

### MySQL Connection Issues
1. Verify MySQL service is running
2. Check DB credentials in .env file
3. Ensure database `nrc_management` exists
4. Check firewall settings
5. Verify MySQL is listening on port 3306

### Admin Panel Access
1. Login with admin credentials: ADMIN001 / admin / admin123
2. Admin panel automatically loads for admin users
3. Create new users and distribute credentials
4. Manage user roles and permissions

Your data will now **permanently persist** in MySQL and never vanish on refresh or restart!