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
  companyName: "InvoicePro India",
  email: "billing@invoicepro.com",
  phone: "+91 98765 43210",
  address: "123, Business Hub, Bandra East",
  city: "Mumbai, Maharashtra",
  zip: "400051",
  currency: "₹",
  taxRate: 18
};

const initialProfile = {
  name: "Aditya Kumar",
  email: "aditya.k@invoicepro.com",
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

const initialProjects = [
  { id: "PROJ-001", name: "E-Commerce Website Development", customer: "Rahul Sharma", hours: 45, status: "Active" },
  { id: "PROJ-002", name: "Logistics Optimization Module", customer: "Amit Verma", hours: 18, status: "Active" },
  { id: "PROJ-003", name: "SEO Optimization Campaign", customer: "Priya Patel", hours: 30, status: "Active" }
];

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState(() => {
    const val = localStorage.getItem("invoicepro_customers");
    return val ? JSON.parse(val) : initialCustomers;
  });

  const [invoices, setInvoices] = useState(() => {
    const val = localStorage.getItem("invoicepro_invoices");
    return val ? JSON.parse(val) : initialInvoices;
  });

  const [payments, setPayments] = useState(() => {
    const val = localStorage.getItem("invoicepro_payments");
    return val ? JSON.parse(val) : initialPayments;
  });

  const [settings, setSettings] = useState(() => {
    const val = localStorage.getItem("invoicepro_settings");
    return val ? JSON.parse(val) : initialSettings;
  });

  const [profile, setProfile] = useState(() => {
    const val = localStorage.getItem("invoicepro_profile");
    return val ? JSON.parse(val) : initialProfile;
  });

  const [activities, setActivities] = useState(() => {
    const val = localStorage.getItem("invoicepro_activities");
    return val ? JSON.parse(val) : initialActivities;
  });

  const [expenses, setExpenses] = useState(() => {
    const val = localStorage.getItem("invoicepro_expenses");
    return val ? JSON.parse(val) : initialExpenses;
  });

  const [projects, setProjects] = useState(() => {
    const val = localStorage.getItem("invoicepro_projects");
    return val ? JSON.parse(val) : initialProjects;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const val = localStorage.getItem("invoicepro_sidebar_collapsed");
    return val ? JSON.parse(val) : false;
  });

  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);


  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("invoicepro_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("invoicepro_invoices", JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem("invoicepro_payments", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem("invoicepro_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("invoicepro_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("invoicepro_activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("invoicepro_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("invoicepro_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("invoicepro_sidebar_collapsed", JSON.stringify(sidebarCollapsed));
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

  // Projects CRUD
  const addProject = (project) => {
    const newProj = {
      ...project,
      id: `PROJ-${String(projects.length + 1).padStart(3, "0")}`,
      hours: Number(project.hours) || 0
    };
    setProjects((prev) => [...prev, newProj]);
    logActivity(`Project ${newProj.name} created`);
    return newProj;
  };

  const updateProject = (updatedProj) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === updatedProj.id ? updatedProj : proj))
    );
    logActivity(`Project ${updatedProj.name} updated`);
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
    logActivity(`Project ${id} deleted`);
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
        projects,
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
        addProject,
        updateProject,
        deleteProject,
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
