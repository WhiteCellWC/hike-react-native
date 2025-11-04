import * as SQLite from "expo-sqlite";
import { getCurrentEpoch } from "../utils/utils";
import { Hike } from "@/types/types";

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

// export type Hike = {
//   id: number;
//   name: string;
//   image: string;
//   location: string;
//   date: number; // epoch
//   length_value: number;
//   length_unit: string; // e.g., "km" or "miles"
//   description: string;
//   difficulty: string; // e.g., "Easy" | "Medium" | "Hard"
//   parking: boolean;
// };

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
    try {
      console.log("🟦 HikeService.getById() called, id: " + id);

      // ✅ Ensure initialization completes before continuing
      await this.init();
      await ensureDbReady();
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
  async getFiltered(filters: {
    search?: string;
    minLength?: string;
    maxLength?: string;
    date?: number;
    unit?: string;
  }): Promise<Hike[]> {
    console.log("🟦 [HikeService] getFiltered() called");
    console.log(
      "📩 [HikeService] Received raw filters:",
      JSON.stringify(filters, null, 2)
    );

    const start = Date.now();
    await this.init();
    await ensureDbReady();

    // --- Normalize and log filter inputs
    const normalized = {
      search: filters.search?.trim() || "",
      minLength: filters.minLength?.trim() || "",
      maxLength: filters.maxLength?.trim() || "",
      date:
        typeof filters.date === "number" && !isNaN(filters.date)
          ? filters.date
          : undefined,
      unit: filters.unit?.trim() || "",
    };

    console.log("🔍 [HikeService] Normalized Filters:", normalized);

    // --- Base query setup
    let query = `SELECT * FROM ${TABLE_HIKES}`;
    const conditions: string[] = [];
    const params: any[] = [];

    // --- Search by name or location
    if (normalized.search.length > 0) {
      const term = `%${normalized.search.toLowerCase()}%`;
      conditions.push(`(LOWER(name) LIKE ? OR LOWER(location) LIKE ?)`);
      params.push(term, term);
      console.log("🔸 Added search filter:", term);
    }

    // --- Length range
    const min = Number(normalized.minLength);
    const max = Number(normalized.maxLength);

    if (!isNaN(min) && normalized.minLength !== "") {
      conditions.push(`length_value >= ?`);
      params.push(min);
      console.log("🔸 Added minLength filter:", min);
    }

    if (!isNaN(max) && normalized.maxLength !== "") {
      conditions.push(`length_value <= ?`);
      params.push(max);
      console.log("🔸 Added maxLength filter:", max);
    }
    if (typeof normalized.date === "number") {
      // Compute start and end of selected day (local timezone)
      const startOfDay = new Date(normalized.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(normalized.date);
      endOfDay.setHours(23, 59, 59, 999);

      conditions.push(`date BETWEEN ? AND ?`);
      params.push(startOfDay.getTime(), endOfDay.getTime());

      console.log("🔸 Added date filter (day range):", {
        start: startOfDay.getTime(),
        end: endOfDay.getTime(),
      });
    }

    // --- Unit filter (optional, only if truly relevant)
    if (normalized.unit && normalized.unit !== "") {
      conditions.push(`length_unit = ?`);
      params.push(normalized.unit);
      console.log("🔸 Added unit filter:", normalized.unit);
    }

    // --- Combine all conditions
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(" AND ");
    } else {
      console.log("⚪ No valid filters applied — returning all hikes.");
    }

    // --- Always order by date descending
    query += ` ORDER BY ${COL_DATE} DESC`;

    console.log("🟨 Final Query:", query);
    console.log("🟨 Query Parameters:", params);

    try {
      const rows = await db!.getAllAsync<Hike>(query, params);

      const mapped = rows.map((r: Hike) => ({
        ...r,
        parking: !!r.parking,
      }));

      console.log(`🟩 Returned ${mapped.length} hikes after filtering.`);
      console.log(`⏱️ [HikeService.getFiltered] ${Date.now() - start} ms`);
      return mapped;
    } catch (error) {
      console.error("❌ [HikeService.getFiltered] Query failed:", error);
      return [];
    }
  },
  /** Get all hikes */
  async getAll(): Promise<Hike[]> {
    console.log("🟦 [HikeService] getAll() called");

    const start = Date.now(); // Track performance timing
    try {
      console.log("🟨 Initializing database connection...");
      await this.init();

      console.log("🟨 Ensuring database is ready...");
      await ensureDbReady();

      console.log(`🟩 Fetching all hikes from table: ${TABLE_HIKES}`);
      const query = `SELECT * FROM ${TABLE_HIKES} ORDER BY ${COL_DATE} DESC`;

      const rows = await db!.getAllAsync<Hike>(query);
      console.log(
        `🟩 Query executed successfully. Rows fetched: ${rows.length}`
      );

      const mapped = rows.map((r: Hike) => ({
        ...r,
        parking: !!r.parking,
      }));

      console.log("🟩 Hike data normalized and mapped.");
      console.log("📦 Sample record:", mapped[0] ?? "No records found");

      const end = Date.now();
      console.log(`⏱️ [HikeService.getAll] Completed in ${end - start} ms`);
      return mapped;
    } catch (err) {
      console.error("❌ [HikeService.getAll] Failed:", err);
      return [];
    }
  },
  /** Add a new hike */
  async add(hike: Omit<Hike, "id">): Promise<number> {
    try {
      console.log("🟦 HikeService.add() called");

      // ✅ Ensure initialization completes before continuing
      await this.init();
      await ensureDbReady();
      console.log("✅ Database initialization complete");

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

      console.log(
        "🧾 Hike inserted successfully. Row ID:",
        result.lastInsertRowId
      );
      return result.lastInsertRowId!;
    } catch (err) {
      console.error("💥 HikeService.add() failed:", err);
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
