import * as SQLite from "expo-sqlite";
import { getCurrentEpoch } from "../utils/utils";

let db: SQLite.SQLiteDatabase | null = null;

const DATABASE_NAME = "app.db";
const TABLE_HIKES = "hikes";

// Column names
const COL_ID = "id";
const COL_NAME = "name";
const COL_IMAGE = "image";
const COL_LOCATION = "location";
const COL_DATE = "date";
const COL_LENGTH_VALUE = "length_value";
const COL_LENGTH_UNIT = "length_unit";
const COL_DESCRIPTION = "description";
const COL_DIFFICULTY = "difficulty";
const COL_PARKING = "parking";

export type Hike = {
  id: number;
  name: string;
  image: string;
  location: string;
  date: number; // epoch
  length_value: number;
  length_unit: string; // e.g., "km" or "miles"
  description: string;
  difficulty: string; // e.g., "Easy" | "Medium" | "Hard"
  parking: boolean;
};

function ensureDbReady() {
  if (!db)
    throw new Error("Database not initialized. Call HikeService.init() first.");
}

export const HikeService = {
  /** Initialize the database and ensure the table exists */
  async init(): Promise<void> {
    if (db) return;
    try {
      db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        useNewConnection: true,
      });
      await db!.execAsync(`
        CREATE TABLE IF NOT EXISTS ${TABLE_HIKES} (
          ${COL_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${COL_NAME} TEXT NOT NULL,
          ${COL_IMAGE} TEXT DEFAULT '',
          ${COL_LOCATION} TEXT DEFAULT '',
          ${COL_DATE} INTEGER NOT NULL,
          ${COL_LENGTH_VALUE} REAL NOT NULL DEFAULT 0,
          ${COL_LENGTH_UNIT} TEXT NOT NULL DEFAULT 'km',
          ${COL_DESCRIPTION} TEXT DEFAULT '',
          ${COL_DIFFICULTY} TEXT NOT NULL DEFAULT 'Medium',
          ${COL_PARKING} INTEGER NOT NULL DEFAULT 0
        );
      `);
      console.log("HikeService initialized successfully.");
    } catch (err) {
      console.error("HikeService.init() failed:", err);
    }
  },

  /** Close the database connection */
  async close(): Promise<void> {
    if (!db) return;
    try {
      await db!.closeAsync();
      console.log("HikeService: DB closed");
    } catch (err) {
      console.error("HikeService.close() failed:", err);
    } finally {
      db = null; // ✅ safer and consistent
    }
  },

  /** Get hike by ID */
  async getById(id: number): Promise<Hike | null> {
    ensureDbReady();
    try {
      const hike = await db!.getFirstAsync<Hike>(
        `SELECT * FROM ${TABLE_HIKES} WHERE ${COL_ID} = ?`,
        id
      );
      if (!hike) return null;
      return { ...hike, parking: !!hike.parking };
    } catch (err) {
      console.error(`HikeService.getById() failed for ID ${id}:`, err);
      return null;
    }
  },

  /** Get all hikes */
  async getAll(): Promise<Hike[]> {
    ensureDbReady();
    try {
      const rows = await db!.getAllAsync<Hike>(
        `SELECT * FROM ${TABLE_HIKES} ORDER BY ${COL_DATE} DESC`
      );
      return rows.map((r: Hike) => ({ ...r, parking: !!r.parking }));
    } catch (err) {
      console.error("HikeService.getAll() failed:", err);
      return [];
    }
  },

  /** Add a new hike */
  async add(hike: Omit<Hike, "id">): Promise<number> {
    ensureDbReady();
    try {
      const result = await db!.runAsync(
        `INSERT INTO ${TABLE_HIKES} 
         (${COL_NAME}, ${COL_IMAGE}, ${COL_LOCATION}, ${COL_DATE}, 
          ${COL_LENGTH_VALUE}, ${COL_LENGTH_UNIT}, ${COL_DESCRIPTION}, 
          ${COL_DIFFICULTY}, ${COL_PARKING})
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        hike.name,
        hike.image ?? "",
        hike.location ?? "",
        hike.date || getCurrentEpoch(),
        hike.length_value ?? 0,
        hike.length_unit ?? "km",
        hike.description ?? "",
        hike.difficulty ?? "Medium",
        hike.parking ? 1 : 0
      );
      return result.lastInsertRowId!;
    } catch (err) {
      console.error("HikeService.add() failed:", err);
      return -1;
    }
  },

  /** Update an existing hike */
  async update(hike: Hike): Promise<boolean> {
    ensureDbReady();
    try {
      await db!.runAsync(
        `UPDATE ${TABLE_HIKES}
         SET ${COL_NAME} = ?, ${COL_IMAGE} = ?, ${COL_LOCATION} = ?, 
             ${COL_DATE} = ?, ${COL_LENGTH_VALUE} = ?, ${COL_LENGTH_UNIT} = ?, 
             ${COL_DESCRIPTION} = ?, ${COL_DIFFICULTY} = ?, ${COL_PARKING} = ?
         WHERE ${COL_ID} = ?`,
        hike.name,
        hike.image,
        hike.location,
        hike.date,
        hike.length_value,
        hike.length_unit,
        hike.description,
        hike.difficulty,
        hike.parking ? 1 : 0,
        hike.id
      );
      return true;
    } catch (err) {
      console.error("HikeService.update() failed:", err);
      return false;
    }
  },

  /** Delete a hike by ID */
  async delete(id: number): Promise<boolean> {
    ensureDbReady();
    try {
      await db!.runAsync(`DELETE FROM ${TABLE_HIKES} WHERE ${COL_ID} = ?`, id);
      return true;
    } catch (err) {
      console.error(`HikeService.delete() failed for ID ${id}:`, err);
      return false;
    }
  },
};
