import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import asyncWrapper from '../../middleware/async';
import Invoice from '../../models/Invoice';
import History from '../../models/history';
import Card from '../../models/card';
import Expense from '../../models/expense';
import BadRequestError from '../../errors/bad-request';
import Payment from '../../models/payments';
import Patient from '../../models/Patient';
import { LabTest } from '../../models/LabTest';
import User from '../../models/Users';
import { UltraTest } from '../../models/ultrasound';
import mongoose from 'mongoose';
interface Query {
 
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}


interface Query {
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

// POST: Retrieve invoices, cards, and expenses
const getInvoicesCardsExpenses = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    throw new BadRequestError('Provide both start and end dates.');
  }

  try {
    const query: Query = {};
    let startDateObj: Date | null = null;
    let endDateObj: Date | null = null;

    // Add date range filter if both startDate and endDate are provided
    if (startDate && endDate) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new BadRequestError('Invalid date format.');
      }

      if (endDateObj < startDateObj) {
        throw new BadRequestError('End date must be greater than or equal to start date.');
      }

      // Include the end of the day for the endDate
      endDateObj.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }

    // Retrieve history based on query and populate patient name & card number
    const history = await History.find(query)
      .populate({
        path: "Invoice.customerName.id",
        select: "firstname cardno", // Only retrieve patient name & card number
      })
      .populate({
        path: "Invoice.created.id",
        select: "username", // Only retrieve patient name & card number
      }).populate({
        path: "createdBy.id",
        select: "username", // Only retrieve patient name & card number
      })
      .exec();

    let cards = [];
    let expenses = [];
    let payments = [];

    // Retrieve cards and expenses if createdById is not provided
    cards = await Card.find({
      createdAt: { $gte: startDateObj, $lte: endDateObj },
    })
      .populate({
        path: "patient",
        select: "firstname cardno", // Retrieve patient's name & card number
      }).populate({
        path: "createdBy.id",
        select: "username", // Only retrieve patient name & card number
      })
      .exec();

    expenses = await Expense.find({
      createdAt: { $gte: startDateObj, $lte: endDateObj },
    }).populate({
      path: "createdBy.id",
      select: "username", // Only retrieve patient name & card number
    }).exec();

    payments = await Payment.find({
      $or: [
        {
          createdAt: { $gte: startDateObj, $lte: endDateObj },
        },
        {
          'paymentHistory.date': { $gte: startDateObj, $lte: endDateObj },
        },
      ],
    })
      .populate({
        path: 'customerName',
        select: 'firstname cardno status', // Retrieve patient's name & card number
      })
      .populate({
        path: 'OrderBy',
        select: 'username', // Retrieve the username of the person who ordered
      })
      .populate({
        path: 'createdBy.id',
        select: 'username', // Retrieve the username of the creator (who created the payment)
      })
      .populate({
        path: 'paymentHistory.receivedBy.id', // Populate the user who received the payment
        select: 'username', // Only retrieve the username
      })
      .exec();
    

console.log(history)
    res.status(StatusCodes.OK).json({
      message: "Invoices, cards, and expenses retrieved successfully.",
      success: true,
      data: { history, cards, expenses, payments },
    });
  } catch (error) {
    console.error("Error fetching invoices, cards, and expenses:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to retrieve invoices, cards, and expenses.",
      success: false,
    });
  }
});



const getExpenses = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    throw new BadRequestError('Provide both start and end dates.');
  }

  try {
    const query: Query = {};
    let startDateObj: Date | null = null;
    let endDateObj: Date | null = null;

    // Add date range filter if both startDate and endDate are provided
    if (startDate && endDate) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        throw new BadRequestError('Invalid date format.');
      }

      if (endDateObj < startDateObj) {
        throw new BadRequestError('End date must be greater than or equal to start date.');
      }

      // Include the end of the day for the endDate
      endDateObj.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startDateObj, $lte: endDateObj };
    }

    

   
    let expenses = [];
   

    

    expenses = await Expense.find({
      createdAt: { $gte: startDateObj, $lte: endDateObj },
    }).populate({
      path: "createdBy.id",
      select: "username", // Only retrieve patient name & card number
    }).exec();

    
    


    res.status(StatusCodes.OK).json({
      message: " expenses retrieved successfully.",
      success: true,
      data: {  expenses },
    });
  } catch (error) {
    console.error("Error  expenses:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to retrieve  expenses.",
      success: false,
    });
  }
});


// GET: Retrieve invoices with unconfirmed payments
const getUnconfirmedInvoices = asyncWrapper(async (_req: Request, res: Response): Promise<void> => {
  try {
    const invoices = await Invoice.find({
      'currentpayment.confirm': false,
    });

    res.status(StatusCodes.OK).json({
      message: 'Invoices with unconfirmed payments retrieved successfully.',
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error('Error fetching unconfirmed invoices:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve unconfirmed invoices.',
      success: false,
    });
  }
});



const getFinancialSummary = asyncWrapper(async (req: Request, res: Response) => {
  // Calculate Total Revenue from Invoices
  const totalInvoiceRevenue = await Invoice.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
        totalPaid: { $sum: "$totalpaid" },
      }
    }
  ]);
// Calculate Total Patients
const totalPatients = await Patient.countDocuments();
const totalEmployees = await User.countDocuments();
  // Calculate Total Revenue from Cards
  const totalCardRevenue = await Card.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$cardprice" },
      }
    }
  ]);

  // Calculate Total Revenue from Payments
  const totalPaymentRevenue = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$totalAmount" },
        totalPaid: { $sum: "$amountPaid" },
      }
    }
  ]);

  // Calculate Total Expenses
  const totalExpenses = await Expense.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$amount" },
      }
    }
  ]);

  // Extract values from aggregates
  const invoiceTotal = totalInvoiceRevenue.length > 0 ? totalInvoiceRevenue[0].totalAmount : 0;
  const invoicePaid = totalInvoiceRevenue.length > 0 ? totalInvoiceRevenue[0].totalPaid : 0;
  const cardTotal = totalCardRevenue.length > 0 ? totalCardRevenue[0].totalAmount : 0;
  const paymentTotal = totalPaymentRevenue.length > 0 ? totalPaymentRevenue[0].totalAmount : 0;
  const paymentPaid = totalPaymentRevenue.length > 0 ? totalPaymentRevenue[0].totalPaid : 0;
  const expenseTotal = totalExpenses.length > 0 ? totalExpenses[0].totalAmount : 0;

  // Calculate Total Revenue (Invoice + Card + Payment)
  const totalRevenue = invoiceTotal + cardTotal + paymentTotal;

  // Calculate Net Revenue (Total Revenue - Expenses)
  const netRevenue = totalRevenue - expenseTotal;

  // Calculate Unpaid Balance (Invoice Balance + Payment Balance)
  const invoiceUnpaid = invoiceTotal - invoicePaid;
  const paymentUnpaid = paymentTotal - paymentPaid;
  const totalUnpaidBalance = invoiceUnpaid + paymentUnpaid;

  // Prepare the response
  const financialSummary = {
    totalRevenue,
    netRevenue,
    totalUnpaidBalance,
    totalPatients,
    totalEmployees
  };

  res.status(StatusCodes.OK).json({ financialSummary });
});





const getbarchart = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  // Fetch all payments, history, cards, and expenses
  const payments = await Payment.find({});
  const histories = await History.find({});
  const cards = await Card.find({});
  const expenses = await Expense.find({});

  // Aggregate data by month
  const dataByMonth: Record<string, { total: number; expense: number }> = {};

  // Helper function to get the month key (e.g., "January 2023")
  const getMonthKey = (date: Date): string => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Process payments
  payments.forEach((payment) => {
    const monthKey = getMonthKey(payment.createdAt);
    if (!dataByMonth[monthKey]) {
      dataByMonth[monthKey] = { total: 0, expense: 0 };
    }
    dataByMonth[monthKey].total += payment.totalAmount;
  });

  // Process expenses
  expenses.forEach((expense) => {
    const monthKey = getMonthKey(expense.createdAt);
    if (!dataByMonth[monthKey]) {
      dataByMonth[monthKey] = { total: 0, expense: 0 };
    }
    dataByMonth[monthKey].expense += expense.amount;
  });

  // Process cards (if needed)
  cards.forEach((card) => {
    const monthKey = getMonthKey(card.createdAt);
    if (!dataByMonth[monthKey]) {
      dataByMonth[monthKey] = { total: 0, expense: 0 };
    }
    dataByMonth[monthKey].total += card.cardprice;
  });

  // Process histories (if needed)
  histories.forEach((history) => {
    const monthKey = getMonthKey(history.createdAt);
    if (!dataByMonth[monthKey]) {
      dataByMonth[monthKey] = { total: 0, expense: 0 };
    }
    dataByMonth[monthKey].total += history.Invoice.amount;
  });

  // Format the data for the chart
  const chartData = Object.keys(dataByMonth).map((month) => ({
    date: month,
    total: dataByMonth[month].total,
    expense: dataByMonth[month].expense,
  }));

  // Sort the data by date (ascending order)
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Send the response
  res.status(StatusCodes.OK).json({
    success: true,
    data: chartData,
  });
});

const getPatientsByMonth = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  // Fetch all patients
  const patients = await Patient.find({});

  // Aggregate data by month
  const dataByMonth: Record<string, { total: number }> = {};

  // Helper function to get the month key (e.g., "January 2023")
  const getMonthKey = (date: Date): string => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  // Process patients
  patients.forEach((patient) => {
    const monthKey = getMonthKey(patient.createdAt);
    if (!dataByMonth[monthKey]) {
      dataByMonth[monthKey] = { total: 0 };
    }
    dataByMonth[monthKey].total += 1; // Increment the total count for the month
  });

  // Format the data for the chart
  const chartData = Object.keys(dataByMonth).map((month) => ({
    month, // Month name (e.g., "January 2023")
    total: dataByMonth[month].total, // Total patients for the month
  }));

  // Sort the data by date (ascending order)
  chartData.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Send the response
  res.status(StatusCodes.OK).json({
    success: true,
    data: chartData,
  });
});


const ageRanges = [
  { label: "0-10", min: 0, max: 10 },
  { label: "11-20", min: 11, max: 20 },
  { label: "21-30", min: 21, max: 30 },
  { label: "31-40", min: 31, max: 40 },
  { label: "41-50", min: 41, max: 50 },
  { label: "51-60", min: 51, max: 60 },
  { label: "61-70", min: 61, max: 70 },
  { label: "71+", min: 71, max: Infinity },
];

const getPatientsByAgeRange = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  // Fetch all patients with age

 
  const patients = await Patient.find({}, { age: 1 });

  // Initialize age range data
  const ageData = ageRanges.map((range) => ({ label: range.label, total: 0 }));

  // Count patients in each range
  patients.forEach((patient) => {
    const age = patient.age;
    const range = ageData.find((r) => age >= r.label.split("-")[0] && (age <= r.label.split("-")[1] || r.label.includes("+")));
    if (range) {
      range.total += 1;
    }
  });

  // Send response
  res.status(StatusCodes.OK).json({
    success: true,
    data: ageData,
  });
});


const getPatientGenderCount = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  // Count male and female patients
  console.log('hi')
  const maleCount = await Patient.countDocuments({ sex: "male" });
  const femaleCount = await Patient.countDocuments({ sex: "female" });
console.log(maleCount)
  res.status(StatusCodes.OK).json({
    success: true,
    data: [
      { label: "Male", total: maleCount },
      { label: "Female", total: femaleCount },
    ],
  });
});


// GET: Rank services, lab tests, and ultrasound tests by usage and revenue
const getServiceRankings = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    // Aggregate data for ranking services by usage and revenue
    const serviceRankings = await Invoice.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.service.id",
          serviceName: { $first: "$items.service.service" },
          totalUsage: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { totalUsage: -1, totalRevenue: -1 } },
    ]);

    // Aggregate data for ranking lab tests by usage and revenue
    const labTestRankings = await LabTest.aggregate([
    
      { $unwind: "$sections" },
      { $unwind: "$sections.tests" }, // Ensure each test is counted
      {
        $group: {
          _id: "$sections.section",
          totalUsage: { $sum: 1 },
          totalRevenue: { $sum: "$sections.tests.price" },
        },
      },
      { $sort: { totalUsage: -1, totalRevenue: -1 } },
    ]);

    // Aggregate data for ranking ultrasound tests by usage and revenue
    const ultraTestRankings = await UltraTest.aggregate([
      { $unwind: "$tests" },
      {
        $group: {
          _id: "$tests.name",
          totalUsage: { $sum: 1 },
          totalRevenue: { $sum: "$tests.price" },
        },
      },
      { $sort: { totalUsage: -1, totalRevenue: -1 } },
    ]);
console.log("service",serviceRankings)
console.log("lab",labTestRankings)
console.log("ultra",ultraTestRankings)

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        services: serviceRankings,
        labTests: labTestRankings,
        ultraTests: ultraTestRankings,
      },
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false});
  }
});


const getServiceDateRankings = asyncWrapper(async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, createdBy, updatedBy } = req.body;
    const dateFilter: any = {};
console.log(updatedBy)
console.log(createdBy)
    if (startDate && endDate) {
      dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (createdBy) {
      dateFilter["createdBy.id"] = new mongoose.Types.ObjectId(createdBy);
    }
    if (updatedBy) {
      dateFilter["changeHistory.updatedBy.id"] = new mongoose.Types.ObjectId(updatedBy);
    }

    // Aggregate data for ranking services by usage and revenue
    const serviceRankings = await Invoice.aggregate([
      { $match: dateFilter },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.service.id",
          serviceName: { $first: "$items.service.service" },
          totalUsage: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" },
        },
      },
      { $sort: { totalUsage: -1, totalRevenue: -1 } },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "serviceDetails",
        },
      },
      { $unwind: { path: "$serviceDetails", preserveNullAndEmptyArrays: true } },
    ]);

    // Aggregate data for ranking lab tests by usage and revenue
    const labTestRankings = await LabTest.aggregate([
      { $match: dateFilter },
      { $unwind: "$sections" },
      { $unwind: "$sections.tests" }, // Ensure each test is counted
      {
        $group: {
          _id: "$sections.section",
          totalUsage: { $sum: 1 },
          totalRevenue: { $sum: "$sections.tests.price" },
        },
      },
      { $sort: { totalUsage: -1, totalRevenue: -1 } },
    ]);

    // Aggregate data for ranking ultrasound tests by usage and revenue
    const ultraTestRankings = await UltraTest.aggregate([
      { $match: dateFilter },
      { $unwind: "$tests" },
      {
        $group: {
          _id: "$tests.name",
          totalUsage: { $sum: 1 },
          totalRevenue: { $sum: "$tests.price" },
        },
      },
      { $sort: { totalUsage: -1, totalRevenue: -1 } },
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        services: serviceRankings,
        labTests: labTestRankings,
        ultraTests: ultraTestRankings,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
  }
});



export {getPatientsByAgeRange,getExpenses,getServiceDateRankings,getServiceRankings,getPatientGenderCount, getInvoicesCardsExpenses, getUnconfirmedInvoices,getFinancialSummary, getbarchart ,getPatientsByMonth};
