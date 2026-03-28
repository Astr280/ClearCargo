import { initializePlatformDataPersistence, syncPlatformDataToDatabase } from "../services/platform-data.js";

async function main() {
  await initializePlatformDataPersistence();
  const status = await syncPlatformDataToDatabase();

  console.log("CargoClear database sync complete.");
  console.log(`Mode: ${status.mode}`);
  console.log(`Configured: ${status.databaseUrlConfigured}`);
  console.log(`Connected: ${status.connected}`);

  if (status.host || status.databaseName) {
    console.log(`Target: ${status.host ?? "unknown-host"} / ${status.databaseName ?? "unknown-db"}`);
  }

  for (const table of status.tables) {
    console.log(`${table.name}: ${table.rowCount}`);
  }
}

main().catch((error) => {
  console.error("CargoClear database sync failed.");
  console.error(error);
  process.exit(1);
});
