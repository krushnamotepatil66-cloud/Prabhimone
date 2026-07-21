import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout";
import InvoiceHeader from "../../components/Invoice/InvoiceHeader";
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

  const handleAddInvoice = (invoice, shouldPrint) => {
    addInvoice(invoice);
    setIsCreating(false);
    setPreviewInvoice(invoice);
    if (shouldPrint) {
      setTimeout(() => {
        window.print();
      }, 400);
    }
  };

  const handleUpdateInvoice = (updatedInvoice, shouldPrint) => {
    updateInvoice(updatedInvoice);
    setIsEditing(false);
    setEditingInvoice(null);
    setPreviewInvoice(updatedInvoice);
    if (shouldPrint) {
      setTimeout(() => {
        window.print();
      }, 400);
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
      {previewInvoice ? (
        /* Split Screen Layout: Left list of invoices, Right detailed invoice preview */
        <div className="invoices-split-container">
          <div className="split-list-panel">
            <div className="split-list-header">
              <span>INVOICES ({filteredList.length})</span>
            </div>
            <div className="split-list-scroll">
              {filteredList.length === 0 ? (
                <div className="no-split-data">No invoices found</div>
              ) : (
                filteredList.map((inv) => (
                  <div
                    key={inv.id}
                    className={`split-invoice-card status-border-${inv.status.toLowerCase()} ${
                      previewInvoice.id === inv.id ? "active" : ""
                    }`}
                    onClick={() => setPreviewInvoice(inv)}
                  >
                    <div className="card-top">
                      <span className="card-id">{inv.id}</span>
                      <span className="card-amount">{inv.amount}</span>
                    </div>
                    <div className="card-middle">
                      <span className="card-customer">{inv.customer}</span>
                      <span className={`card-badge-inline badge-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="card-bottom">
                      <span>{inv.date}</span>
                      <span>Due: {inv.dueDate || inv.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="split-preview-panel">
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
        </div>
      ) : (
        /* Full Width Table Layout */
        <>
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