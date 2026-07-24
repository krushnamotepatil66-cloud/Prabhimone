import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import "./CreateInvoiceModal.css";

const emptyForm = {
  customer: "",
  date: "",
  status: "Pending",
  items: [
    {
      product: "",
      qty: 1,
      price: 0,
    },
  ],
};

function CreateInvoiceModal({
  isOpen,
  onClose,
  onSave,
  editingInvoice,
}) {
  const { customers } = useApp();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    if (editingInvoice) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        customer: editingInvoice.customer,
        date: editingInvoice.date,
        status: editingInvoice.status,
        items:
          editingInvoice.items && editingInvoice.items.length > 0
            ? editingInvoice.items
            : [
                {
                  product: "Invoice Amount",
                  qty: 1,
                  price: Number(
                    String(editingInvoice.amount).replace(/[₹,]/g, "")
                  ),
                },
              ],
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingInvoice, isOpen]);

  if (!isOpen) return null;

  const handleInput = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...form.items];

    updatedItems[index][field] =
      field === "product" ? value : Number(value);

    setForm((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: "",
          qty: 1,
          price: 0,
        },
      ],
    }));
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;

    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const total = form.items.reduce(
    (sum, item) => sum + item.qty * item.price,
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      id: editingInvoice ? editingInvoice.id : "",
      customer: form.customer,
      date: form.date,
      status: form.status,
      amount: `₹${total.toLocaleString()}`,
      items: form.items,
    });

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal large-modal">

        <div className="modal-header">
          <h2>
            {editingInvoice
              ? "Edit Invoice"
              : "Create Invoice"}
          </h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form
          className="invoice-form"
          onSubmit={handleSubmit}
        >

          <select
            value={form.customer}
            onChange={(e) =>
              handleInput("customer", e.target.value)
            }
            required
          >
            <option value="">Select Customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} {c.company ? `(${c.company})` : ""}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              handleInput("date", e.target.value)
            }
            required
          />

          <select
            value={form.status}
            onChange={(e) =>
              handleInput("status", e.target.value)
            }
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>

          <h3>Items</h3>

          {form.items.map((item, index) => (
            <div
              className="product-row"
              key={index}
            >
              <input
                type="text"
                placeholder="Item"
                value={item.product}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "product",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                min="1"
                value={item.qty === 0 ? "" : item.qty}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "qty",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                min="0"
                value={item.price === 0 ? "" : item.price}
                onChange={(e) =>
                  handleItemChange(
                    index,
                    "price",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeItem(index)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            className="add-item-btn"
            onClick={addItem}
          >
            + Add Item
          </button>

          <h3>
            Grand Total : ₹{total.toLocaleString()}
          </h3>

          <div className="modal-buttons">

            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
            >
              {editingInvoice
                ? "Update Invoice"
                : "Save Invoice"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default CreateInvoiceModal;