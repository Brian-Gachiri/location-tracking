import { App } from './app.js';
import { ValidateEnv } from './utils/validateEnv.js';
import LocationsRoute from "./routes/Location.js";

ValidateEnv();


const app = new App([
  new LocationsRoute()
])

app.listen();
