import * as SQLite from "expo-sqlite";

// ─── Constants ─────────────────────────────────────────────
const DATABASE_NAME = "hike.db";
const TABLE_HIKES = "hikes";

// ─── Hike App Service ─────────────────────────────────────
export class HikeAppService {
  private static db: SQLite.SQLiteDatabase | null = null;

  /** Ensure DB connection is ready (auto-initialize if needed) */
  static async ensureDbReady() {
    if (!this.db) {
      console.log("HikeAppService: Database not initialized, initializing...");
      await this.init();
    }
    console.log("HikeAppService: Database ready");
  }

  /** Initialize database and create required tables (with retries) */
  static async init(): Promise<void> {
    const retries = 5;
    const delay = 500; // ms between retries
    let db: SQLite.SQLiteDatabase | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (!db) {
          db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
            useNewConnection: true,
          });
        }

        await db.runAsync("BEGIN TRANSACTION");

        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS ${TABLE_HIKES} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT DEFAULT '',
            location TEXT DEFAULT '',
            date INTEGER NOT NULL,
            length_value REAL NOT NULL DEFAULT 0,
            length_unit TEXT NOT NULL DEFAULT 'km',
            description TEXT DEFAULT '',
            difficulty TEXT NOT NULL DEFAULT 'Medium',
            parking INTEGER NOT NULL DEFAULT 0
          );
        `);

        await db.runAsync("COMMIT");
        console.log("HikeAppService: Tables created successfully.");
        this.db = db;
        return; // ✅ success
      } catch (error) {
        if (db) await db.runAsync("ROLLBACK");
        console.error(
          `HikeAppService.init() failed (attempt ${attempt}):`,
          error
        );

        if (attempt < retries) {
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
        } else {
          throw new Error(
            "HikeAppService: Database initialization failed after multiple retries."
          );
        }
      }
    }
  }

  /** Close the database connection */
  static async close(): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.closeAsync();
      console.log("HikeAppService: Database closed.");
    } catch (err) {
      console.error("HikeAppService.close() failed:", err);
    } finally {
      this.db = null;
    }
  }

  /** Utility getter for DB access */
  static getDb(): SQLite.SQLiteDatabase {
    if (!this.db)
      throw new Error(
        "Database not initialized. Call HikeAppService.init() first."
      );
    return this.db;
  }
}
