import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;

// Initialize the database
export const initDatabase = async (): Promise<Database> => {
  if (db) return db;

  try {
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });

    // Try to load existing database from localStorage
    const savedDb = localStorage.getItem('sqliteDb');
    
    if (savedDb) {
      const uint8Array = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(uint8Array);
      
      // Ensure tables exist (in case of migration)
      db.run(`
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          email TEXT NOT NULL,
          institution TEXT NOT NULL,
          occupation TEXT NOT NULL,
          created_at TEXT NOT NULL,
          call_datetime TEXT,
          call_notes TEXT,
          visit_datetime TEXT,
          visit_notes TEXT
        )
      `);
      
      // Add new columns if they don't exist (for existing databases)
      try {
        // Check if columns exist by trying to select them
        const checkColumns = db.exec('SELECT call_datetime, call_notes, visit_datetime, visit_notes FROM leads LIMIT 1');
      } catch (error) {
        // Columns don't exist, add them
        console.log('Migrating database: adding tracking columns...');
        try {
          db.run('ALTER TABLE leads ADD COLUMN call_datetime TEXT');
        } catch (e) { /* column might already exist */ }
        try {
          db.run('ALTER TABLE leads ADD COLUMN call_notes TEXT');
        } catch (e) { /* column might already exist */ }
        try {
          db.run('ALTER TABLE leads ADD COLUMN visit_datetime TEXT');
        } catch (e) { /* column might already exist */ }
        try {
          db.run('ALTER TABLE leads ADD COLUMN visit_notes TEXT');
        } catch (e) { /* column might already exist */ }
        saveDatabase();
        console.log('Database migration completed!');
      }
      
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
    } else {
      db = new SQL.Database();
      
      // Create the leads table
      db.run(`
        CREATE TABLE IF NOT EXISTS leads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          full_name TEXT NOT NULL,
          phone_number TEXT NOT NULL,
          email TEXT NOT NULL,
          institution TEXT NOT NULL,
          occupation TEXT NOT NULL,
          created_at TEXT NOT NULL,
          call_datetime TEXT,
          call_notes TEXT,
          visit_datetime TEXT,
          visit_notes TEXT
        )
      `);
      
      // Create the users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at TEXT NOT NULL
        )
      `);
    }
    
    // Ensure default admin user exists (check after loading/creating database)
    const checkAdmin = db.exec("SELECT COUNT(*) as count FROM users WHERE username = 'admin'");
    if (checkAdmin.length === 0 || checkAdmin[0].values[0][0] === 0) {
      db.run(
        "INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)",
        ['admin', 'admin', new Date().toISOString()]
      );
      saveDatabase();
    }

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Save database to localStorage
export const saveDatabase = () => {
  if (!db) return;
  
  try {
    const data = db.export();
    const buffer = Array.from(data);
    localStorage.setItem('sqliteDb', JSON.stringify(buffer));
  } catch (error) {
    console.error('Error saving database:', error);
  }
};

// Check if email or phone number already exists
export const checkDuplicate = async (email: string, phoneNumber: string): Promise<{ isDuplicate: boolean; field: 'email' | 'phone' | null }> => {
  const database = await initDatabase();
  
  try {
    // Check email
    const emailResult = database.exec(
      'SELECT COUNT(*) as count FROM leads WHERE email = ?',
      [email]
    );
    
    if (emailResult.length > 0 && emailResult[0].values[0][0] > 0) {
      return { isDuplicate: true, field: 'email' };
    }
    
    // Check phone number
    const phoneResult = database.exec(
      'SELECT COUNT(*) as count FROM leads WHERE phone_number = ?',
      [phoneNumber]
    );
    
    if (phoneResult.length > 0 && phoneResult[0].values[0][0] > 0) {
      return { isDuplicate: true, field: 'phone' };
    }
    
    return { isDuplicate: false, field: null };
  } catch (error) {
    console.error('Error checking duplicate:', error);
    return { isDuplicate: false, field: null };
  }
};

// Insert a new lead
export const insertLead = async (lead: {
  fullName: string;
  phoneNumber: string;
  email: string;
  institution: string;
  occupation: string;
}) => {
  const database = await initDatabase();
  
  try {
    database.run(
      `INSERT INTO leads (full_name, phone_number, email, institution, occupation, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        lead.fullName,
        lead.phoneNumber,
        lead.email,
        lead.institution,
        lead.occupation,
        new Date().toISOString()
      ]
    );
    
    saveDatabase();
    return true;
  } catch (error) {
    console.error('Error inserting lead:', error);
    throw error;
  }
};

// Get all leads
export const getAllLeads = async () => {
  const database = await initDatabase();
  
  try {
    const result = database.exec('SELECT * FROM leads ORDER BY created_at DESC');
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map((row) => {
      const lead: any = {};
      columns.forEach((col, index) => {
        lead[col] = row[index];
      });
      return lead;
    });
  } catch (error) {
    console.error('Error getting leads:', error);
    return [];
  }
};

// Export database as downloadable file
export const exportDatabase = async () => {
  const database = await initDatabase();
  
  try {
    const data = database.export();
    const blob = new Blob([data], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.db`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting database:', error);
  }
};

// Export leads to CSV
export const exportLeadsToCSV = async () => {
  try {
    const leads = await getAllLeads();
    
    if (leads.length === 0) {
      alert('No leads to export');
      return;
    }
    
    // CSV headers
    const headers = ['ID', 'Full Name', 'Phone Number', 'Email', 'Institution', 'Occupation', 'Created At', 'Call Date/Time', 'Call Notes', 'Visit Date/Time', 'Visit Notes'];
    
    // CSV rows
    const rows = leads.map((lead: any) => [
      lead.id,
      lead.full_name,
      lead.phone_number,
      lead.email,
      lead.institution,
      lead.occupation,
      lead.created_at,
      lead.call_datetime || '',
      lead.call_notes || '',
      lead.visit_datetime || '',
      lead.visit_notes || ''
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

// Update a lead
export const updateLead = async (id: number, lead: {
  fullName: string;
  phoneNumber: string;
  email: string;
  institution: string;
  occupation: string;
}): Promise<{ success: boolean; message: string }> => {
  const database = await initDatabase();
  
  try {
    database.run(
      `UPDATE leads SET full_name = ?, phone_number = ?, email = ?, institution = ?, occupation = ? WHERE id = ?`,
      [lead.fullName, lead.phoneNumber, lead.email, lead.institution, lead.occupation, id]
    );
    
    saveDatabase();
    return { success: true, message: 'Lead updated successfully' };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { success: false, message: 'Error updating lead' };
  }
};

// Update lead tracking (call/visit)
export const updateLeadTracking = async (id: number, tracking: {
  callDatetime?: string | null;
  callNotes?: string | null;
  visitDatetime?: string | null;
  visitNotes?: string | null;
}): Promise<{ success: boolean; message: string }> => {
  const database = await initDatabase();
  
  try {
    console.log('Updating lead tracking:', { id, tracking });
    
    database.run(
      `UPDATE leads SET call_datetime = ?, call_notes = ?, visit_datetime = ?, visit_notes = ? WHERE id = ?`,
      [
        tracking.callDatetime || null,
        tracking.callNotes || null,
        tracking.visitDatetime || null,
        tracking.visitNotes || null,
        id
      ]
    );
    
    saveDatabase();
    console.log('Lead tracking updated successfully');
    return { success: true, message: 'Lead tracking updated successfully' };
  } catch (error) {
    console.error('Error updating lead tracking:', error);
    console.error('Error details:', error);
    return { success: false, message: `Error updating lead tracking: ${error}` };
  }
};

// Clear all data (for testing)
export const clearDatabase = async () => {
  const database = await initDatabase();
  
  try {
    database.run('DELETE FROM leads');
    saveDatabase();
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

// ============ USER AUTHENTICATION ============

// Authenticate user
export const authenticateUser = async (username: string, password: string): Promise<boolean> => {
  const database = await initDatabase();
  
  try {
    const result = database.exec(
      'SELECT COUNT(*) as count FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    
    console.log('Authentication attempt:', { username, password });
    console.log('Query result:', result);
    
    if (result.length > 0 && result[0].values[0][0] > 0) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return false;
  }
};

// Get all users
export const getAllUsers = async () => {
  const database = await initDatabase();
  
  try {
    const result = database.exec('SELECT id, username, created_at FROM users ORDER BY created_at DESC');
    
    if (result.length === 0) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map((row) => {
      const user: any = {};
      columns.forEach((col, index) => {
        user[col] = row[index];
      });
      return user;
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Add new user
export const addUser = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
  const database = await initDatabase();
  
  try {
    // Check if username already exists
    const checkResult = database.exec(
      'SELECT COUNT(*) as count FROM users WHERE username = ?',
      [username]
    );
    
    if (checkResult.length > 0 && checkResult[0].values[0][0] > 0) {
      return { success: false, message: 'Username already exists' };
    }
    
    database.run(
      'INSERT INTO users (username, password, created_at) VALUES (?, ?, ?)',
      [username, password, new Date().toISOString()]
    );
    
    saveDatabase();
    return { success: true, message: 'User added successfully' };
  } catch (error) {
    console.error('Error adding user:', error);
    return { success: false, message: 'Error adding user' };
  }
};

// Delete user
export const deleteUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  const database = await initDatabase();
  
  try {
    // Prevent deleting the last admin user
    const adminCheck = database.exec(
      'SELECT COUNT(*) as count FROM users WHERE username = ?',
      ['admin']
    );
    
    const userCheck = database.exec(
      'SELECT username FROM users WHERE id = ?',
      [id]
    );
    
    if (userCheck.length > 0 && userCheck[0].values[0][0] === 'admin' && adminCheck[0].values[0][0] <= 1) {
      return { success: false, message: 'Cannot delete the last admin user' };
    }
    
    database.run('DELETE FROM users WHERE id = ?', [id]);
    saveDatabase();
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, message: 'Error deleting user' };
  }
};

// Update user password
export const updateUserPassword = async (id: number, newPassword: string): Promise<{ success: boolean; message: string }> => {
  const database = await initDatabase();
  
  try {
    database.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPassword, id]
    );
    
    saveDatabase();
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, message: 'Error updating password' };
  }
};

// Reset database (clear localStorage) - for debugging
export const resetDatabase = () => {
  localStorage.removeItem('sqliteDb');
  db = null;
  console.log('Database reset. Please refresh the page.');
};
