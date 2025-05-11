"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInvoice = exports.deleteInvoice = exports.getInvoiceDetails = exports.getInvoices = exports.createInvoice = void 0;
const http_status_codes_1 = require("http-status-codes");
const async_1 = __importDefault(require("../../middleware/async"));
const Services_1 = __importDefault(require("../../models/Services"));
const Invoice_1 = __importDefault(require("../../models/Invoice"));
const Patient_1 = __importDefault(require("../../models/Patient"));
const bad_request_1 = __importDefault(require("../../errors/bad-request"));
const not_found_1 = __importDefault(require("../../errors/not-found"));
const catagory_1 = __importDefault(require("../../models/catagory"));
// Create a new invoice
const createInvoice = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { id } = req.params; // Patient ID from URL params
    const { items, currentpayment, status } = req.body;
    console.log(req.body);
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required');
    }
    const validStatuses = ['Paid', 'Pending', 'Cancel', 'order'];
    if (!validStatuses.includes(status)) {
        throw new bad_request_1.default('Invalid status value.');
    }
    // Find the patient by ID
    const patient = yield Patient_1.default.findById(id).exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found.');
    }
    const categoryId = items.map((item) => item.categoryId);
    const Categoryes = yield catagory_1.default.find({ _id: { $in: categoryId } });
    const CategoryesMap = new Map(Categoryes.map((Category) => [Category._id.toString(), Category]));
    for (const item of items) {
        if (!(item === null || item === void 0 ? void 0 : item.categoryId) || !CategoryesMap.has(item === null || item === void 0 ? void 0 : item.categoryId)) {
            throw new not_found_1.default(`Service with ID ${item === null || item === void 0 ? void 0 : item.categoryId} not found.`);
        }
    }
    // Validate services in the items
    const serviceIds = items.map((item) => item.service.id);
    const services = yield Services_1.default.find({ _id: { $in: serviceIds } });
    const serviceMap = new Map(services.map((service) => [service._id.toString(), service]));
    for (const item of items) {
        if (!((_a = item.service) === null || _a === void 0 ? void 0 : _a.id) || !serviceMap.has(item.service.id)) {
            throw new not_found_1.default(`Service with ID ${(_b = item.service) === null || _b === void 0 ? void 0 : _b.id} not found.`);
        }
    }
    const createdBy = {
        id: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId) || '',
        username: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.username) || '',
    };
    // Map items with the validated services
    const mappedItems = items.map((item) => ({
        categoryId: item.categoryId,
        service: {
            id: item.service.id,
            service: item.service.service, // Include the service name from the object
        },
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price, // Calculate total price
    }));
    // Create the new invoice
    const newInvoice = new Invoice_1.default({
        items: mappedItems,
        customerName: { id: patient._id },
        currentpayment,
        status,
        createdBy,
        totalAmount: mappedItems.reduce((total, item) => total + item.totalPrice, 0), // Calculate total amount
    });
    const savedInvoice = yield newInvoice.save();
    // Link the invoice to the patient
    patient.Invoice = patient.Invoice || [];
    patient.Invoice.push(savedInvoice._id);
    yield patient.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        message: 'Invoice created successfully.',
        success: true,
        data: savedInvoice,
    });
}));
exports.createInvoice = createInvoice;
// Retrieve all invoices for a specific patient
const getInvoices = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Validate required fields
    if (!id) {
        throw new bad_request_1.default('Patient ID is required.');
    }
    // Find the patient by ID and populate invoices
    const patient = yield Patient_1.default.findById(id).populate('Invoice').exec();
    if (!patient) {
        throw new not_found_1.default('Patient not found.');
    }
    if (!patient.Invoice || patient.Invoice.length === 0) {
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: 'No invoices available for this patient.',
            data: [],
        });
        return;
    }
    // Sort invoices by `createdAt` in descending order
    const sortedInvoices = patient.Invoice.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Invoices retrieved successfully.',
        success: true,
        data: sortedInvoices,
    });
}));
exports.getInvoices = getInvoices;
// GET: Retrieve invoice details
const getInvoiceDetails = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { invoiceId } = req.body; // Assuming the invoiceId is passed in the request body
    // Validate required fields
    if (!invoiceId) {
        throw new bad_request_1.default('Invoice ID is required');
    }
    // Find the invoice by ID
    const invoice = yield Invoice_1.default.findById(invoiceId).exec();
    if (!invoice) {
        throw new not_found_1.default('Invoice not found');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json(invoice);
}));
exports.getInvoiceDetails = getInvoiceDetails;
// DELETE: Delete an invoice
const deleteInvoice = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { invoiceId } = req.body; // Assuming the invoiceId is passed in the request body
    // Validate required fields
    if (!invoiceId) {
        throw new bad_request_1.default('Invoice ID is required');
    }
    // Find and delete the invoice
    const deletedInvoice = yield Invoice_1.default.findByIdAndDelete(invoiceId).exec();
    if (!deletedInvoice) {
        throw new not_found_1.default('Invoice not found');
    }
    // Remove the invoice reference from the associated patient's record
    const patient = yield Patient_1.default.findOneAndUpdate({ Invoice: invoiceId }, // Find the patient with this invoice ID
    { $pull: { Invoice: invoiceId } }, // Remove the invoice ID from the array
    { new: true } // Return the updated patient document
    );
    if (!patient) {
        console.warn(`No patient found with Invoice ID: ${invoiceId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Invoice deleted successfully and reference removed from patient',
        success: true,
    });
}));
exports.deleteInvoice = deleteInvoice;
// PATCH: Update an invoice
const updateInvoice = (0, async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const _e = req.body, { invoiceId, currentpayment } = _e, data = __rest(_e, ["invoiceId", "currentpayment"]);
    if (!invoiceId) {
        throw new bad_request_1.default('Invoice ID is required');
    }
    console.log(currentpayment);
    const invoice = yield Invoice_1.default.findById(invoiceId).exec();
    console.log(invoice);
    if (!invoice) {
        throw new not_found_1.default('Invoice not found');
    }
    // Update invoice fields
    Object.assign(invoice, data);
    invoice.createdBy = {
        id: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || '',
        username: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.username) || '',
    };
    // Update total paid
    const totalAmount = (_c = invoice.totalAmount) !== null && _c !== void 0 ? _c : 0;
    const previousTotalPaid = (_d = invoice.totalpaid) !== null && _d !== void 0 ? _d : 0;
    console.log(previousTotalPaid);
    invoice.balance = totalAmount - previousTotalPaid;
    invoice.currentpayment.amount = currentpayment.amount;
    // Set confirm to false if current payment is greater than 1
    if ((currentpayment === null || currentpayment === void 0 ? void 0 : currentpayment.amount) > 0) {
        invoice.currentpayment.confirm = false;
    }
    yield invoice.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({
        message: 'Invoice updated successfully',
        success: true,
        data: invoice,
    });
}));
exports.updateInvoice = updateInvoice;
