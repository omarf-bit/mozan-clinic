// Debug utilities for development
import { resetDatabase, getAllUsers, initDatabase } from './database';

// Expose debug functions to window object in development
if (import.meta.env.DEV) {
  (window as any).debugDB = {
    reset: () => {
      resetDatabase();
      console.log('✅ Database reset! Refresh the page to reinitialize.');
    },
    listUsers: async () => {
      try {
        const users = await getAllUsers();
        console.table(users);
        return users;
      } catch (error) {
        console.error('Error listing users:', error);
      }
    },
    checkDB: async () => {
      try {
        const db = await initDatabase();
        const result = db.exec('SELECT * FROM users');
        console.log('Users table:', result);
        return result;
      } catch (error) {
        console.error('Error checking database:', error);
      }
    }
  };
  
  console.log(`
🔧 Debug utilities available:
- debugDB.reset() - Reset the database
- debugDB.listUsers() - List all users
- debugDB.checkDB() - Check database contents
  `);
}
