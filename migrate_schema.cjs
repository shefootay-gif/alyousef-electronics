const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'db', 'schema.ts');
let content = fs.readFileSync(schemaPath, 'utf8');

// Imports
content = content.replace(
  /import\s+\{([^}]+)\}\s+from\s+"drizzle-orm\/sqlite-core";/g,
  `import {
  pgTable,
  text,
  integer,
  serial,
  timestamp,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";`
);

// Table definitions
content = content.replace(/sqliteTable\(/g, 'pgTable(');

// ID columns
content = content.replace(/integer\("id", \{ mode: "number" \}\)\.primaryKey\(\{ autoIncrement: true \}\)/g, 'serial("id").primaryKey()');

// Timestamp columns
content = content.replace(/integer\("([^"]+)", \{ mode: "timestamp" \}\)/g, 'timestamp("$1", { mode: "date" })');

// Boolean columns
content = content.replace(/integer\("([^"]+)", \{ mode: "boolean" \}\)/g, 'boolean("$1")');

// Number columns
content = content.replace(/integer\("([^"]+)", \{ mode: "number" \}\)/g, 'integer("$1")');

// JSON columns
content = content.replace(/text\("([^"]+)", \{ mode: "json" \}\)/g, 'jsonb("$1")');

fs.writeFileSync(schemaPath, content);
console.log("Schema migrated successfully.");
