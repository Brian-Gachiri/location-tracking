import LocationsController from "../controllers/location/index.js";
import { Router } from 'express';
import {ApiKeyMiddleware} from "../middlewares/authentication.js";

export default class LocationsRoute {
  path = '/locations';
  router = Router();

  locationsController = new LocationsController();

  constructor() {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(`${this.path}`, ApiKeyMiddleware, this.locationsController.getLocation);
    this.router.post(`${this.path}`, ApiKeyMiddleware, this.locationsController.createLocation);
    this.router.put(`${this.path}`, ApiKeyMiddleware, this.locationsController.updateLocation);
    // this.router.delete(`${this.path}`, ApiKeyMiddleware, this.locationsController.deleteLocation);
  }
}
