import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

const initialCustomers = [
  { id: "CUST-001", name: "Rahul Sharma", email: "rahul@gmail.com", phone: "+91 98765 43210", company: "Sharma Tech Solutions", city: "Mumbai", address: "404 Main St, Bandra East" },
  { id: "CUST-002", name: "Amit Verma", email: "amit@gmail.com", phone: "+91 98123 45678", company: "Verma Logistics", city: "Pune", address: "102 Business Plaza, Shivaji Nagar" },
  { id: "CUST-003", name: "Priya Patel", email: "priya@gmail.com", phone: "+91 90123 45678", company: "Patel Exports", city: "Nashik", address: "55 Industrial Area" },
  { id: "CUST-004", name: "Sneha Joshi", email: "sneha@gmail.com", phone: "+91 91234 56789", company: "Joshi & Co Associates", city: "Mumbai", address: "99 Nariman Point" },
  { id: "CUST-005", name: "Vikas Kumar", email: "vikas@gmail.com", phone: "+91 92345 67890", company: "Vikas Retailers Ltd", city: "Delhi", address: "A-12 Connaught Place" }
];

const initialInvoices = [
  {
    id: "INV-001",
    customer: "Rahul Sharma",
    date: "2026-07-01",
    amount: "₹1,200",
    status: "Paid",
    items: [{ product: "Web Development Consultation", qty: 1, price: 1200 }]
  },
  {
    id: "INV-002",
    customer: "Amit Verma",
    date: "2026-07-02",
    amount: "₹2,500",
    status: "Pending",
    items: [{ product: "UI/UX Design Review", qty: 1, price: 2500 }]
  },
  {
    id: "INV-003",
    customer: "Priya Patel",
    date: "2026-07-04",
    amount: "₹3,700",
    status: "Overdue",
    items: [{ product: "SEO Auditing & Reporting", qty: 1, price: 3700 }]
  },
  {
    id: "INV-004",
    customer: "Sneha Joshi",
    date: "2026-07-05",
    amount: "₹5,400",
    status: "Paid",
    items: [{ product: "Database Optimization", qty: 1, price: 5400 }]
  },
  {
    id: "INV-005",
    customer: "Vikas Kumar",
    date: "2026-07-07",
    amount: "₹2,900",
    status: "Pending",
    items: [{ product: "Cloud Server Setup", qty: 1, price: 2900 }]
  }
];

const initialPayments = [
  { id: "PAY-001", invoiceId: "INV-001", customerName: "Rahul Sharma", amount: 1200, date: "2026-07-01", method: "UPI", reference: "UPI987263548", notes: "Payment received via GPAY" },
  { id: "PAY-002", invoiceId: "INV-004", customerName: "Sneha Joshi", amount: 5400, date: "2026-07-06", method: "Bank Transfer", reference: "TXN18273645", notes: "Direct bank deposit" }
];

const initialSettings = {
  // Organization
  companyName: "PrabhimOne India",
  email: "billing@prabhimone.com",
  phone: "+91 98765 43210",
  address: "123, Business Hub, Bandra East",
  city: "Mumbai, Maharashtra",
  zip: "400051",
  website: "",
  gstinOrg: "",

  // Invoices
  currency: "₹",
  taxRate: 18,
  invoicePrefix: "INV-",
  invoiceAutoNumber: true,
  invoiceDefaultTerms: "Due on Receipt",
  invoiceDefaultNotes: "",
  invoiceShowGstin: true,
  invoiceTermsAndConditions: "1. Goods once sold will not be taken back or exchanged\n2. For warranty, retain cash memo\n3. Please check breakage and damage against delivery\n4. For order need to pay 50% advance amount\n5. All disputes are subject to PUNE jurisdiction only",

  // Estimates
  estimatePrefix: "EST-",
  estimateAutoNumber: true,
  estimateValidityDays: 30,
  estimateDefaultNotes: "",
  estimateDefaultTerms: "1. This estimate is valid for 30 days from the date of issue.\n2. Any changes in specifications or quantities will alter the final pricing.",
  estimateTermsAndConditions: "1. This estimate is valid for 30 days from the date of issue.\n2. Any changes in specifications or quantities will alter the final pricing.\n3. Work will commence only upon approval of this estimate.\n4. All disputes are subject to PUNE jurisdiction only.",

  // Credit Notes
  creditNotePrefix: "CN-",
  creditNoteAutoNumber: true,
  creditNoteDefaultNotes: "",
  creditNoteTermsAndConditions: "1. Credit balance must be applied to future invoices within 180 days.\n2. Refunds on credit notes are subject to review.\n3. Original invoice details must accompany any disputes.",

  // Proforma Invoices
  proformaPrefix: "PI-",
  proformaAutoNumber: true,
  proformaValidityDays: 30,
  proformaDefaultNotes: "",
  proformaTermsAndConditions: "1. This proforma invoice is sent for approval before final billing.\n2. Prices and rates listed are subject to terms of agreement.\n3. Final tax invoice will be generated upon receipt of payment or approval.",

  // Customers
  customerDefaultType: "Existing",
  customerDefaultState: "Maharashtra",
  customerRequireEmail: false,
  customerRequirePhone: true,

  // Payments
  paymentDefaultMethod: "UPI",
  paymentModes: "UPI,Cash,Bank Transfer,Cheque,Credit Card,Debit Card",
  paymentShowReceipt: true,

  // Expenses
  expenseDefaultCategory: "Office Supplies",
  expenseBillableDefault: false,
  expenseCategories: "Rent & Accommodation,Advertising & Marketing,IT & Internet Expenses,Office Supplies,Travel Expenses,Utilities,Professional Fees,Miscellaneous",

  // Tax & Compliance
  gstRegistrationNo: "",
  panNumber: "",
  taxCalcMethod: "Exclusive",
  defaultTaxSlab: "18",

  // Preferences
  dateFormat: "YYYY-MM-DD",
  numberFormat: "Indian",
  theme: "light",
  language: "English"
};

const initialProfile = {
  name: "Aditya Kumar",
  email: "aditya.k@prabhimone.com",
  phone: "+91 99887 76655",
  role: "Administrator",
  avatar: "👨‍💻",
  theme: "light"
};

const initialActivities = [
  { id: 1, text: "Invoice INV-005 created for Vikas Kumar", time: "2 hours ago", read: true },
  { id: 2, text: "Payment of ₹5,400 received for Invoice INV-004", time: "1 day ago", read: true },
  { id: 3, text: "Payment of ₹1,200 received for Invoice INV-001", time: "5 days ago", read: true },
  { id: 4, text: "Customer Vikas Kumar registered", time: "5 days ago", read: true }
];

const initialExpenses = [
  { id: "EXP-001", category: "Rent & Accommodation", amount: 15000, date: "2026-07-01", customerName: "Rahul Sharma", status: "Billable" },
  { id: "EXP-002", category: "Advertising & Marketing", amount: 8000, date: "2026-07-03", customerName: "Amit Verma", status: "Non-Billable" },
  { id: "EXP-003", category: "IT & Internet Expenses", amount: 3500, date: "2026-07-04", customerName: "", status: "Non-Billable" },
  { id: "EXP-004", category: "Office Supplies", amount: 1200, date: "2026-07-05", customerName: "", status: "Non-Billable" },
  { id: "EXP-005", category: "Travel Expenses", amount: 4500, date: "2026-07-06", customerName: "Priya Patel", status: "Billable" }
];

const initialEstimates = [
  { id: "EST-001", customer: "Rahul Sharma", date: "2026-07-10", expiryDate: "2026-08-10", amount: "₹4,500", status: "Accepted", items: [{ product: "Web Development Proposal", qty: 1, price: 4500 }] },
  { id: "EST-002", customer: "Amit Verma", date: "2026-07-12", expiryDate: "2026-08-12", amount: "₹1,200", status: "Sent", items: [{ product: "Consulting Support Hour", qty: 1, price: 1200 }] },
  { id: "EST-003", customer: "Priya Patel", date: "2026-07-15", expiryDate: "2026-08-15", amount: "₹8,900", status: "Draft", items: [{ product: "SEO Kickoff Proposal", qty: 1, price: 8900 }] }
];

const initialCreditNotes = [
  { id: "CN-001", customer: "Rahul Sharma", date: "2026-07-05", amount: "₹200", status: "Open", invoiceId: "INV-001" },
  { id: "CN-002", customer: "Sneha Joshi", date: "2026-07-08", amount: "₹500", status: "Closed", invoiceId: "INV-004" }
];

const initialProformaInvoices = [
  { id: "PI-001", customer: "Vikas Kumar", date: "2026-07-09", expiryDate: "2026-08-09", amount: "₹3,200", status: "Sent", items: [{ product: "Server Provisioning Agreement", qty: 1, price: 3200 }] },
  { id: "PI-002", customer: "Amit Verma", date: "2026-07-14", expiryDate: "2026-08-14", amount: "₹1,500", status: "Draft", items: [{ product: "UI Mockup Review", qty: 1, price: 1500 }] }
];

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState(() => {
    const val = localStorage.getItem("prabhimone_customers");
    return val ? JSON.parse(val) : initialCustomers;
  });

  const [invoices, setInvoices] = useState(() => {
    const val = localStorage.getItem("prabhimone_invoices");
    return val ? JSON.parse(val) : initialInvoices;
  });

  const [payments, setPayments] = useState(() => {
    const val = localStorage.getItem("prabhimone_payments");
    return val ? JSON.parse(val) : initialPayments;
  });

  const [settings, setSettings] = useState(() => {
    const val = localStorage.getItem("prabhimone_settings");
    return val ? JSON.parse(val) : initialSettings;
  });

  const [profile, setProfile] = useState(() => {
    const val = localStorage.getItem("prabhimone_profile");
    return val ? JSON.parse(val) : initialProfile;
  });

  const [activities, setActivities] = useState(() => {
    const val = localStorage.getItem("prabhimone_activities");
    return val ? JSON.parse(val) : initialActivities;
  });

  const [expenses, setExpenses] = useState(() => {
    const val = localStorage.getItem("prabhimone_expenses");
    return val ? JSON.parse(val) : initialExpenses;
  });

  const [estimates, setEstimates] = useState(() => {
    const val = localStorage.getItem("prabhimone_estimates");
    return val ? JSON.parse(val) : initialEstimates;
  });

  const [creditNotes, setCreditNotes] = useState(() => {
    const val = localStorage.getItem("prabhimone_credit_notes");
    return val ? JSON.parse(val) : initialCreditNotes;
  });

  const [proformaInvoices, setProformaInvoices] = useState(() => {
    const val = localStorage.getItem("prabhimone_proforma_invoices");
    return val ? JSON.parse(val) : initialProformaInvoices;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const val = localStorage.getItem("prabhimone_sidebar_collapsed");
    return val ? JSON.parse(val) : false;
  });

  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);


  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("prabhimone_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("prabhimone_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("prabhimone_payments", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem("prabhimone_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("prabhimone_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("prabhimone_activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("prabhimone_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("prabhimone_estimates", JSON.stringify(estimates));
  }, [estimates]);

  useEffect(() => {
    localStorage.setItem("prabhimone_credit_notes", JSON.stringify(creditNotes));
  }, [creditNotes]);

  useEffect(() => {
    localStorage.setItem("prabhimone_proforma_invoices", JSON.stringify(proformaInvoices));
  }, [proformaInvoices]);

  useEffect(() => {
    localStorage.setItem("prabhimone_sidebar_collapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);


  // Log activity helper
  const logActivity = (text) => {
    setActivities((prev) => [
      { id: Date.now(), text, time: "Just now", read: false },
      ...prev.slice(0, 19) // Keep last 20 activities
    ]);
  };

  const markAllActivitiesAsRead = () => {
    setActivities((prev) => prev.map((act) => ({ ...act, read: true })));
  };

  // Customers CRUD
  const addCustomer = (customer) => {
    const newCust = {
      ...customer,
      id: `CUST-${String(customers.length + 1).padStart(3, "0")}`
    };
    setCustomers((prev) => [...prev, newCust]);
    logActivity(`Customer ${newCust.name} added`);
    return newCust;
  };

  const updateCustomer = (updatedCust) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCust.id ? updatedCust : c))
    );
    // Update invoice customer names if changed
    setInvoices((prev) =>
      prev.map((inv) => {
        const matchingCust = customers.find((c) => c.id === updatedCust.id);
        if (matchingCust && inv.customer === matchingCust.name) {
          return { ...inv, customer: updatedCust.name };
        }
        return inv;
      })
    );
    logActivity(`Customer ${updatedCust.name} updated`);
  };

  const deleteCustomer = (id) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (cust) {
      logActivity(`Customer ${cust.name} deleted`);
    }
  };

  // Invoices CRUD
  const addInvoice = (invoice) => {
    const newInv = {
      ...invoice,
      id: `INV-${String(invoices.length + 1).padStart(3, "0")}`
    };
    setInvoices((prev) => [newInv, ...prev]);
    logActivity(`Invoice ${newInv.id} created for ${newInv.customer}`);
    return newInv;
  };

  const updateInvoice = (updatedInv) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInv.id ? updatedInv : inv))
    );
    logActivity(`Invoice ${updatedInv.id} updated`);
  };

  const deleteInvoice = (id) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    // Also delete any associated payments
    setPayments((prev) => prev.filter((p) => p.invoiceId !== id));
    logActivity(`Invoice ${id} deleted`);
  };

  // Payments CRUD
  const addPayment = (payment) => {
    const newPay = {
      ...payment,
      id: `PAY-${String(payments.length + 1).padStart(3, "0")}`
    };
    setPayments((prev) => [newPay, ...prev]);

    // Mark corresponding invoice as Paid
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === payment.invoiceId) {
          return { ...inv, status: "Paid" };
        }
        return inv;
      })
    );

    logActivity(`Payment of ${settings.currency}${payment.amount} recorded for ${payment.invoiceId}`);
    return newPay;
  };

  const deletePayment = (id) => {
    const payment = payments.find((p) => p.id === id);
    if (!payment) return;

    setPayments((prev) => prev.filter((p) => p.id !== id));

    // Reset corresponding invoice to Pending
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === payment.invoiceId) {
          return { ...inv, status: "Pending" };
        }
        return inv;
      })
    );

    logActivity(`Payment ${id} for invoice ${payment.invoiceId} deleted`);
  };

  // Settings & Profile
  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    logActivity("Organization settings updated");
  };

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
    logActivity("User profile updated");
  };

  // Expenses CRUD
  const addExpense = (expense) => {
    const newExp = {
      ...expense,
      id: `EXP-${String(expenses.length + 1).padStart(3, "0")}`
    };
    setExpenses((prev) => [newExp, ...prev]);
    logActivity(`Expense of ₹${newExp.amount} for ${newExp.category} recorded`);
    return newExp;
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    logActivity(`Expense ${id} deleted`);
  };

  // Estimates CRUD
  const addEstimate = (estimate) => {
    const newEst = {
      ...estimate,
      id: `EST-${String(estimates.length + 1).padStart(3, "0")}`
    };
    setEstimates((prev) => [newEst, ...prev]);
    logActivity(`Estimate ${newEst.id} created for ${newEst.customer}`);
    return newEst;
  };

  const updateEstimate = (updatedEst) => {
    setEstimates((prev) =>
      prev.map((est) => (est.id === updatedEst.id ? updatedEst : est))
    );
    logActivity(`Estimate ${updatedEst.id} updated`);
  };

  const deleteEstimate = (id) => {
    setEstimates((prev) => prev.filter((est) => est.id !== id));
    logActivity(`Estimate ${id} deleted`);
  };

  // Credit Notes CRUD
  const addCreditNote = (creditNote) => {
    const newCN = {
      ...creditNote,
      id: `CN-${String(creditNotes.length + 1).padStart(3, "0")}`
    };
    setCreditNotes((prev) => [newCN, ...prev]);
    logActivity(`Credit Note ${newCN.id} created for ${newCN.customer}`);
    return newCN;
  };

  const updateCreditNote = (updatedCN) => {
    setCreditNotes((prev) =>
      prev.map((cn) => (cn.id === updatedCN.id ? updatedCN : cn))
    );
    logActivity(`Credit Note ${updatedCN.id} updated`);
  };

  const deleteCreditNote = (id) => {
    setCreditNotes((prev) => prev.filter((cn) => cn.id !== id));
    logActivity(`Credit Note ${id} deleted`);
  };

  // Proforma Invoices CRUD
  const addProformaInvoice = (proformaInvoice) => {
    const newPI = {
      ...proformaInvoice,
      id: `PI-${String(proformaInvoices.length + 1).padStart(3, "0")}`
    };
    setProformaInvoices((prev) => [newPI, ...prev]);
    logActivity(`Proforma Invoice ${newPI.id} created for ${newPI.customer}`);
    return newPI;
  };

  const updateProformaInvoice = (updatedPI) => {
    setProformaInvoices((prev) =>
      prev.map((pi) => (pi.id === updatedPI.id ? updatedPI : pi))
    );
    logActivity(`Proforma Invoice ${updatedPI.id} updated`);
  };

  const deleteProformaInvoice = (id) => {
    setProformaInvoices((prev) => prev.filter((pi) => pi.id !== id));
    logActivity(`Proforma Invoice ${id} deleted`);
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        invoices,
        payments,
        settings,
        profile,
        activities,
        expenses,
        estimates,
        creditNotes,
        proformaInvoices,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addPayment,
        deletePayment,
        updateSettings,
        updateProfile,
        logActivity,
        markAllActivitiesAsRead,
        addExpense,
        deleteExpense,
        addEstimate,
        updateEstimate,
        deleteEstimate,
        addCreditNote,
        updateCreditNote,
        deleteCreditNote,
        addProformaInvoice,
        updateProformaInvoice,
        deleteProformaInvoice,
        sidebarCollapsed,
        setSidebarCollapsed,
        sidebarMobileOpen,
        setSidebarMobileOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
