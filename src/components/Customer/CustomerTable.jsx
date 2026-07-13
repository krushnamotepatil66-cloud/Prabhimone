import "./CustomerTable.css";

const customers = [
  {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    city: "Mumbai"
  },
  {
    name: "Amit Verma",
    email: "amit@gmail.com",
    city: "Pune"
  },
  {
    name: "Priya Patel",
    email: "priya@gmail.com",
    city: "Nashik"
  }
];

function CustomerTable() {
  return (
    <table className="customer-table">

      <thead>

        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>City</th>
          <th>Action</th>
        </tr>

      </thead>

      <tbody>

        {customers.map((customer) => (

          <tr key={customer.email}>

            <td>{customer.name}</td>

            <td>{customer.email}</td>

            <td>{customer.city}</td>

            <td>

              <button>Edit</button>

            </td>

          </tr>

        ))}

      </tbody>

    </table>
  );
}

export default CustomerTable;