import { createClient, SupportedStorage } from "@supabase/supabase-js";

const fs = require("fs");
const path = require("path");

// class LocalStorage {
//   constructor(filename = "localStorage.json") {
//     // Path to the local storage file
//     //@ts-ignore
//     this.filePath = path.join(__dirname, filename);

//     // Initialize the storage
//     this.init();
//   }

//   // Initialize the local storage (create or read the file)
//   init() {
//     //@ts-ignore

//     if (!fs.existsSync(this.filePath)) {
//       // If file doesn't exist, create it with an empty object
//       //@ts-ignore

//       fs.writeFileSync(this.filePath, JSON.stringify({}));
//     }
//   }

//   // Set an item (key-value) into storage
//   //@ts-ignore
//   setItem(key, value) {
//     const storage = this.getStorage();
//     storage[key] = value;
//     this.saveStorage(storage);
//   }

//   // Get an item from storage
//   //@ts-ignore
//   getItem(key) {
//     const storage = this.getStorage();
//     return storage[key] || null;
//   }

//   // Remove an item from storage
//   //@ts-ignore
//   removeItem(key) {
//     const storage = this.getStorage();
//     delete storage[key];
//     this.saveStorage(storage);
//   }

//   // Clear all data in storage
//   clear() {
//     this.saveStorage({});
//   }

//   // Get the current storage data (from the file)
//   getStorage() {
//     //@ts-ignore
//     const data = fs.readFileSync(this.filePath, "utf8");
//     return JSON.parse(data);
//   }

//   // Save the storage back to the file
//   //@ts-ignore
//   saveStorage(storage) {
//     //@ts-ignore

//     fs.writeFileSync(this.filePath, JSON.stringify(storage, null, 2));
//   }
// }

// const localStorage = new LocalStorage();

const supabaseUrl = "https://qilrogisawroynzxputd.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpbHJvZ2lzYXdyb3luenhwdXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg4NjY2MTEsImV4cCI6MjA0NDQ0MjYxMX0.SPSqntInDfSM-ODTXsjWyHuDXoK4pQEQkuRBY29eTxY";

// Better put your these secret keys in .env file
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: true }
});
