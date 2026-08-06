import { createContext, useContext, useState, useEffect } from "react";
import { customerApi, productApi, invoiceApi, profileApi } from "../api/client";

const AppContext = createContext();

const initialCustomers = [];

const initialProducts = [];

const initialInvoices = [];

const initialPayments = [];

const initialSettings = {
  // Organization
  companyName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
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

  // Purchases
  purchaseOrderTermsAndConditions: "1. Goods received subject to inspection and approval.\n2. Payment will be processed as per agreed terms.\n3. Mention PO number on all invoices and delivery notes.\n4. All disputes are subject to PUNE jurisdiction only.",
  billTermsAndConditions: "1. Bill is payable within the agreed credit period.\n2. Late payments will attract interest as per agreed terms.\n3. Discrepancies must be reported within 7 days of receipt.\n4. All disputes are subject to PUNE jurisdiction only.",

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
  language: "English",

  // Subscription Billing History
  billingHistory: [],

  // Subscription
  subscriptionPlan: null,
  subscriptionStatus: null,
  savedPaymentMethod: null
};

const initialProfile = {
  name: "",
  email: "",
  phone: "",
  role: "",
  avatar: "👤",
  theme: "light",
  profilePic: ""
};

const initialActivities = [];

const initialExpenses = [];

const initialEstimates = [];

const initialCreditNotes = [];

const initialProformaInvoices = [];

const initialPurchases = [];

const initialVendors = [];

export function AppProvider({ children }) {
  const [customers, setCustomers] = useState(() => {
    const val = localStorage.getItem("prabhimone_customers");
    return val ? JSON.parse(val) : initialCustomers;
  });

  const [products, setProducts] = useState(() => {
    const val = localStorage.getItem("prabhimone_products");
    return val ? JSON.parse(val) : initialProducts;
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
    if (val) {
      const saved = JSON.parse(val);
      // Merge new defaults over saved — but filter out old sample billing history entries
      // (sample entries had no razorpayPaymentId and used the demo INV-YYYY-MM-001 pattern)
      const cleanBillingHistory = Array.isArray(saved.billingHistory)
        ? saved.billingHistory.filter(
            (inv) =>
              // Keep only entries that have a Razorpay ID (real payment) OR aren't the hardcoded samples
              inv.razorpayPaymentId ||
              !/^INV-20\d\d-\d\d-00\d$/.test(inv.id || "")
          )
        : [];
      return { ...initialSettings, ...saved, billingHistory: cleanBillingHistory };
    }
    return initialSettings;
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

  const [purchases, setPurchases] = useState(() => {
    const val = localStorage.getItem("prabhimone_purchases");
    return val ? JSON.parse(val) : initialPurchases;
  });

  const [vendors, setVendors] = useState(() => {
    const val = localStorage.getItem("prabhimone_vendors");
    return val ? JSON.parse(val) : initialVendors;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const val = localStorage.getItem("prabhimone_sidebar_collapsed");
    return val ? JSON.parse(val) : false;
  });

  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // ─── Load live data from backend on mount ───────────────────────────────────
  useEffect(() => {
    // Load Live Profile
    profileApi.getMe()
      .then((res) => {
        if (res?.data) {
          setProfile((prev) => ({
            ...prev,
            name: (res.data.first_name || res.data.last_name) ? `${res.data.first_name || ""} ${res.data.last_name || ""}`.trim() : prev.name,
            email: res.data.email || prev.email,
            phone: res.data.phone || prev.phone,
          }));
        }
      })
      .catch(() => { /* silently use local state if backend unavailable */ });

    // Load Customers
    customerApi.list({ page_size: 100 })
      .then((res) => {
        if (res?.data?.results?.length) {
          const mapped = res.data.results.map((c) => ({
            id: c.id,
            name: c.display_name || `${c.first_name} ${c.last_name}`.trim(),
            email: c.email,
            phone: c.primary_phone,
            company: c.company_name,
            city: c.billing_city,
            address: [c.billing_address_line_1, c.billing_address_line_2].filter(Boolean).join(", "),
            gstNumber: c.gst_number,
            panNumber: c.pan_number,
            _apiId: c.id,
          }));
          setCustomers(mapped);
        }
      })
      .catch(() => { /* silently use local state if backend unavailable */ });

    // Load Products
    productApi.list({ page_size: 100 })
      .then((res) => {
        if (res?.data?.results?.length) {
          const mapped = res.data.results.map((p) => ({
            id: p.id,
            name: p.name,
            type: p.product_type === "goods" ? "Product" : "Service",
            price: parseFloat(p.selling_price) || 0,
            purchasePrice: parseFloat(p.purchase_price) || 0,
            unit: p.unit_abbreviation || "pcs",
            hsn: p.hsn_sac_code,
            gst: parseFloat(p.gst_tax_rate) || 0,
            sku: p.sku,
            description: p.description,
            _apiId: p.id,
          }));
          setProducts(mapped);
        }
      })
      .catch(() => {});

    // Load Invoices
    invoiceApi.list({ page_size: 100 })
      .then((res) => {
        if (res?.data?.results?.length) {
          const mapped = res.data.results.map((inv) => ({
            id: inv.invoice_number || inv.id,
            customer: inv.customer_name,
            date: inv.invoice_date,
            dueDate: inv.due_date,
            amount: `₹${parseFloat(inv.grand_total).toLocaleString("en-IN")}`,
            status: inv.status?.charAt(0).toUpperCase() + inv.status?.slice(1) || "Draft",
            currency: inv.currency,
            _apiId: inv.id,
          }));
          setInvoices(mapped);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("prabhimone_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("prabhimone_products", JSON.stringify(products));
  }, [products]);

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
    localStorage.setItem("prabhimone_purchases", JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem("prabhimone_vendors", JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem("prabhimone_sidebar_collapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);


  // Log activity helper
  const logActivity = (text) => {
    setActivities((prev) => [
      { id: Date.now() + Math.random(), text, time: "Just now", read: false },
      ...prev.slice(0, 19) // Keep last 20 activities
    ]);
  };

  const markAllActivitiesAsRead = () => {
    setActivities((prev) => prev.map((act) => ({ ...act, read: true })));
  };

  // Customers CRUD
  const addCustomer = async (customer) => {
    // Optimistic local update first
    const newCust = {
      ...customer,
      id: `CUST-${String(customers.length + 1).padStart(3, "0")}`
    };
    setCustomers((prev) => [...prev, newCust]);
    logActivity(`Customer ${newCust.name} added`);

    // Sync to backend
    try {
      const res = await customerApi.create({
        customer_type: customer.type === "business" ? "business" : "individual",
        display_name: customer.name,
        company_name: customer.company || "",
        first_name: customer.name?.split(" ")[0] || customer.name,
        last_name: customer.name?.split(" ").slice(1).join(" ") || "",
        email: customer.email || "",
        primary_phone: customer.phone || "",
        billing_address_line_1: customer.address || "",
        billing_city: customer.city || "",
        billing_country: "India",
        gst_number: customer.gstNumber || "",
        pan_number: customer.panNumber || "",
        currency: "INR",
      });
      // Update local id with real backend id
      if (res?.data?.id) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === newCust.id ? { ...c, _apiId: res.data.id } : c))
        );
      }
    } catch (err) {
      console.warn("Customer sync to backend failed:", err.message);
    }
    return newCust;
  };

  const updateCustomer = async (updatedCust) => {
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

    // Sync to backend
    const apiId = updatedCust._apiId || updatedCust.id;
    try {
      await customerApi.update(apiId, {
        display_name: updatedCust.name,
        company_name: updatedCust.company || "",
        email: updatedCust.email || "",
        primary_phone: updatedCust.phone || "",
        billing_address_line_1: updatedCust.address || "",
        billing_city: updatedCust.city || "",
        gst_number: updatedCust.gstNumber || "",
        pan_number: updatedCust.panNumber || "",
      }, true);
    } catch (err) {
      console.warn("Customer update sync failed:", err.message);
    }
  };

  const deleteCustomer = async (id) => {
    const cust = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (cust) {
      logActivity(`Customer ${cust.name} deleted`);
      const apiId = cust._apiId || cust.id;
      try {
        await customerApi.delete(apiId);
      } catch (err) {
        console.warn("Customer delete sync failed:", err.message);
      }
    }
  };

  // Items / Products CRUD
  const addItem = async (item) => {
    const newItem = {
      ...item,
      id: `ITEM-${String(products.length + 1).padStart(3, "0")}`
    };
    setProducts((prev) => [...prev, newItem]);
    logActivity(`Item ${newItem.name} added`);

    // Sync to backend
    try {
      const res = await productApi.create({
        name: item.name,
        product_type: item.type === "Service" ? "service" : "goods",
        hsn_sac_code: item.hsn || "",
        gst_tax_rate: parseFloat(item.gst) || 0,
        selling_price: parseFloat(item.salesPrice || item.price) || 0,
        purchase_price: parseFloat(item.purchasePrice) || 0,
        description: item.description || "",
        sku: item.sku || "",
        track_inventory: false,
      });
      if (res?.data?.id) {
        setProducts((prev) =>
          prev.map((p) => (p.id === newItem.id ? { ...p, _apiId: res.data.id } : p))
        );
      }
    } catch (err) {
      console.warn("Item sync to backend failed:", err.message);
    }
    return newItem;
  };

  const updateItem = async (updatedItem) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedItem.id ? updatedItem : p))
    );
    logActivity(`Item ${updatedItem.name} updated`);

    const apiId = updatedItem._apiId || updatedItem.id;
    try {
      await productApi.update(apiId, {
        name: updatedItem.name,
        selling_price: parseFloat(updatedItem.salesPrice || updatedItem.price) || 0,
        purchase_price: parseFloat(updatedItem.purchasePrice) || 0,
        gst_tax_rate: parseFloat(updatedItem.gst) || 0,
        hsn_sac_code: updatedItem.hsn || "",
        description: updatedItem.description || "",
      }, true);
    } catch (err) {
      console.warn("Item update sync failed:", err.message);
    }
  };

  const deleteItem = async (id) => {
    const item = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (item) {
      logActivity(`Item ${item.name} deleted`);
      const apiId = item._apiId || item.id;
      try {
        await productApi.delete(apiId);
      } catch (err) {
        console.warn("Item delete sync failed:", err.message);
      }
    }
  };

  const addProduct = addItem;
  const updateProduct = updateItem;
  const deleteProduct = deleteItem;

  // Invoices CRUD
  const addInvoice = async (invoice) => {
    const finalId = invoice.id || invoice.invoiceId || `INV-${String(invoices.length + 1).padStart(3, "0")}`;
    const newInv = {
      ...invoice,
      id: finalId
    };
    setInvoices((prev) => [newInv, ...prev]);
    logActivity(`Invoice ${newInv.id} created for ${newInv.customer}`);

    // Sync to backend
    try {
      const customer = customers.find(
        (c) => c.name === invoice.customer || c.id === invoice.customerId
      );
      const apiCustomerId = customer?._apiId || customer?.id;

      if (apiCustomerId) {
        const payload = {
          customer: apiCustomerId,
          invoice_date: invoice.date || new Date().toISOString().split("T")[0],
          due_date: invoice.dueDate || "",
          currency: invoice.currency || "INR",
          notes: invoice.notes || "",
          terms_and_conditions: invoice.termsAndConditions || "",
          items: (invoice.items || []).map((it) => ({
            product: it._apiId || it.id,
            quantity: parseFloat(it.qty) || 1,
            unit_price: parseFloat(it.price) || null,
            tax: parseFloat(it.tax) || null,
            discount: parseFloat(it.discount) || 0,
          })),
        };
        const res = await invoiceApi.create(payload);
        if (res?.data?.id) {
          setInvoices((prev) =>
            prev.map((inv) =>
              inv.id === newInv.id
                ? { ...inv, _apiId: res.data.id, id: res.data.invoice_number || inv.id }
                : inv
            )
          );
        }
      }
    } catch (err) {
      console.warn("Invoice sync to backend failed:", err.message);
    }
    return newInv;
  };

  const updateInvoice = async (updatedInv) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === updatedInv.id ? updatedInv : inv))
    );
    logActivity(`Invoice ${updatedInv.id} updated`);

    const apiId = updatedInv._apiId || updatedInv.id;
    try {
      await invoiceApi.update(apiId, {
        due_date: updatedInv.dueDate || "",
        notes: updatedInv.notes || "",
        terms_and_conditions: updatedInv.termsAndConditions || "",
      });
    } catch (err) {
      console.warn("Invoice update sync failed:", err.message);
    }
  };

  const deleteInvoice = async (id) => {
    const inv = invoices.find((i) => i.id === id);
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    // Also delete any associated payments
    setPayments((prev) => prev.filter((p) => p.invoiceId !== id));
    logActivity(`Invoice ${id} deleted`);

    if (inv) {
      const apiId = inv._apiId || inv.id;
      try {
        await invoiceApi.delete(apiId);
      } catch (err) {
        console.warn("Invoice delete sync failed:", err.message);
      }
    }
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
      id: expense.id || `EXP-${String(expenses.length + 1).padStart(3, "0")}`
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

  // Purchases CRUD
  const addPurchase = (purchase) => {
    const newPur = {
      ...purchase,
      id: purchase.id || `PUR-${String(purchases.length + 1).padStart(3, "0")}`
    };
    setPurchases((prev) => [newPur, ...prev]);
    logActivity(`Purchase of ₹${newPur.total} recorded`);
    return newPur;
  };

  const updatePurchase = (updatedPurchase) => {
    setPurchases((prev) =>
      prev.map((p) => (p.id === updatedPurchase.id ? updatedPurchase : p))
    );
    logActivity(`Purchase ${updatedPurchase.id} updated`);
  };

  const deletePurchase = (id) => {
    setPurchases((prev) => prev.filter((p) => p.id !== id));
    logActivity(`Purchase ${id} deleted`);
  };

  // Vendors CRUD
  const addVendor = (vendor) => {
    const newVendor = {
      ...vendor,
      id: vendor.id || `VND-${String(vendors.length + 1).padStart(3, "0")}`
    };
    setVendors((prev) => [newVendor, ...prev]);
    logActivity(`Vendor ${newVendor.name} added`);
    return newVendor;
  };

  const updateVendor = (updatedVendor) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
    );
    // Update purchase vendor names if changed
    setPurchases((prev) =>
      prev.map((pur) => {
        const matchingVendor = vendors.find((v) => v.id === updatedVendor.id);
        if (matchingVendor && pur.vendor === matchingVendor.name) {
          return { ...pur, vendor: updatedVendor.name };
        }
        return pur;
      })
    );
    logActivity(`Vendor ${updatedVendor.name} updated`);
  };

  const deleteVendor = (id) => {
    setVendors((prev) => prev.filter((v) => v.id !== id));
    logActivity(`Vendor ${id} deleted`);
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        products,
        items: products,
        invoices,
        payments,
        settings,
        profile,
        activities,
        expenses,
        estimates,
        creditNotes,
        proformaInvoices,
        purchases,
        vendors,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addItem,
        updateItem,
        deleteItem,
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
        addPurchase,
        updatePurchase,
        deletePurchase,
        addVendor,
        updateVendor,
        deleteVendor,
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
