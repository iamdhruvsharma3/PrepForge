import { createApp } from "./app";
import { apiEnv } from "./env";

const app = createApp();

app.listen(apiEnv.PORT, () => {
  console.log(
    `PrepForge API listening on http://localhost:${apiEnv.PORT}${apiEnv.API_BASE_PATH}`,
  );
});
