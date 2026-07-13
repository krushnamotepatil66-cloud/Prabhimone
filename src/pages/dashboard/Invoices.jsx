import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import InvoiceHeader from "../../components/Invoice/InvoiceHeader";
import InvoiceSummary from "../../components/InvoiceSummary/InvoiceSummary";
import InvoiceTable from "../../components/Invoice/InvoiceTable";
import CreateInvoiceForm from "../../components/Invoice/CreateInvoiceForm";
import InvoicePreview from "../../components/Invoice/InvoicePreview";
import RecordPaymentModal from "../../components/Payment/RecordPaymentModal";

import { useApp } from "../../context/AppContext";
import "./Invoices.css";

function Invoices() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  // Page layout states (swapping table views for full page edit forms)
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);

  // Connected modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [preselectedPaymentInvoice, setPreselectedPaymentInvoice] = useState(null);

  const { invoices: invoiceList, addInvoice, updateInvoice, deleteInvoice } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Monitor URL Query Parameters for quick create redirects (?action=new)
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "new") {
      setIsCreating(true);
      // Clean query parameter to prevent redirect loops on browser reloads
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleAddInvoice = (invoice) => {
    addInvoice(invoice);
    setIsCreating(false);
  };

  const handleUpdateInvoice = (updatedInvoice) => {
    updateInvoice(updatedInvoice);
    setIsEditing(false);
    setEditingInvoice(null);

    // Refresh details preview pane if active
    if (previewInvoice && previewInvoice.id === updatedInvoice.id) {
      setPreviewInvoice(updatedInvoice);
    }
  };

  const handleDeleteInvoice = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this invoice?"
    );
    if (!confirmDelete) return;
    deleteInvoice(id);
    if (previewInvoice && previewInvoice.id === id) {
      setPreviewInvoice(null);
    }
  };

  const handleRecordPaymentClick = (invoice) => {
    setPreselectedPaymentInvoice(invoice);
    setShowPaymentModal(true);
  };

  // Filter invoices for table view and split sidebar list
  const filteredList = invoiceList.filter((invoice) => {
    const customer = invoice.customer || "";
    const id = invoice.id || "";

    const matchSearch =
      customer.toLowerCase().includes(search.toLowerCase()) ||
      id.toLowerCase().includes(search.toLowerCase());

    const matchStatus = status === "All" || invoice.status === status;

    return matchSearch && matchStatus;
  });

  // Render Full-page Invoice Creation/Edit View
  if (isCreating || isEditing) {
    return (
      <DashboardLayout>
        <CreateInvoiceForm
          editingInvoice={isEditing ? editingInvoice : null}
          onSave={isEditing ? handleUpdateInvoice : handleAddInvoice}
          onCancel={() => {
            setIsCreating(false);
            setIsEditing(false);
            setEditingInvoice(null);
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <InvoiceHeader
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        onCreate={() => {
          setIsCreating(true);
        }}
        invoices={invoiceList}
      />

      {previewInvoice ? (
        /* Full Width Details Preview Panel */
        <div className="invoice-full-preview-container">
          <InvoicePreview
            invoice={previewInvoice}
            onClose={() => setPreviewInvoice(null)}
            onEdit={(inv) => {
              setEditingInvoice(inv);
              setIsEditing(true);
            }}
            onDelete={handleDeleteInvoice}
            onRecordPayment={handleRecordPaymentClick}
          />
        </div>
      ) : (
        /* Full Width Table Layout */
        <>
          <InvoiceTable
            invoices={invoiceList}
            search={search}
            status={status}
            onEdit={(invoice) => {
              setEditingInvoice(invoice);
              setIsEditing(true);
            }}
            onDelete={handleDeleteInvoice}
            onView={(invoice) => {
              setPreviewInvoice(invoice);
            }}
            activeInvoiceId={null}
          />

          <InvoiceSummary invoices={invoiceList} />
        </>
      )}

      {/* Connected Record Payment Modal */}
      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        initialInvoice={preselectedPaymentInvoice}
      />
    </DashboardLayout>
  );
}

export default Invoices;