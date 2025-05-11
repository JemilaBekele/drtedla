"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Service_1 = require("../controllers/invoice/Service");
const catagory_1 = require("../controllers/invoice/catagory");
const router = express_1.default.Router();
// Define routes for Bicycle getAllServices
router.route('/').post(Service_1.createService); // Create a new bicycle
router.route('/').get(Service_1.getAllServices); // Get all bicycles
router.route('/delete').delete(Service_1.deleteService);
router.route('/update').patch(Service_1.updateService); // Delete a bicycle by ID
router.route('/ultrasound').get(Service_1.getAllcatultrasoun);
router.route('/ultrasound/fetch/by/:id').get(Service_1.getIdcatultrasoun);
router.route('/ultrasound/:id').get(Service_1.getAllservice);
router.route('/categories').post(catagory_1.createCategory).get(catagory_1.getAllCategorys); // Get all bicycles
router.route('/categories/:id').delete(catagory_1.deleteCategory).patch(catagory_1.updateCategory);
exports.default = router;
