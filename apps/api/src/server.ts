import cors from "cors";
import express from "express";
import platformRoutes from "./routes/platform.js";
import { initializePlatformDataPersistence } from "./services/platform-data.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());
app.use("/api", platformRoutes);

async function startServer() {
  await initializePlatformDataPersistence();

  app.listen(port, () => {
    console.log(`CargoClear API listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start CargoClear API", error);
  process.exit(1);
});
