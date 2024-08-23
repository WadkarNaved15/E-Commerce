import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import Pagination from "../../components/Pagination";
import { encryptData, decryptData } from "../../utils/Encryption";
import { toast } from "react-hot-toast";

const columns = [
  {
    Header: "Name",
    accessor: (row) => `${row.first_name} ${row.last_name}`,
  },
  {
    Header: "Mobile",
    accessor: "mobile",
  },
  {
    Header: "Role",
    accessor: "role",
  },
  {
    Header: "Action",
    accessor: "action",
  },
];

const Customers = () => {
  const server = import.meta.env.VITE_SERVER;
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async () => {
    try {
      const encryptedResponse = await axios.post(`${server}/user/all`, {
        encryptedData: encryptData(JSON.stringify({ page: page + 1, perPage: 10 })),
      });

      const { users, total } = JSON.parse(decryptData(encryptedResponse.data.data));

      const updatedRows = users.map((row) => ({
        ...row,
        action: (
          <button onClick={() => handleDelete(row._id)}>
            <FaTrash />
          </button>
        ),
      }));

      setRows(updatedRows);
      setTotalPages(Math.ceil(total / 10));
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
    }
  };

  const handleDelete = async (customerId) => {
    try {
      await axios.delete(`${server}/user/${customerId}`);
      toast.success("Customer deleted successfully");
      fetchCustomers(); // Refresh the customer list after deletion
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]); // Fetch customers whenever the page changes

  const TableComponent = TableHOC(
    columns,
    rows,
    "dashboard-customer-box",
    "Customers"
  );

  return (
    <div className="admin-container">
      <AdminSidebar className="admin-sidebar" />
      <main>
        <TableComponent />
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </main>
    </div>
  );
};

export default Customers;
