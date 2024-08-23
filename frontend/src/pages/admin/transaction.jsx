import { ReactElement, useState , useEffect } from "react";
import { Link , useNavigate } from "react-router-dom";
import { Column } from "react-table";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import Pagination from "../../components/Pagination";
import { encryptData , decryptData } from "../../utils/Encryption";
import axios from "axios";
import { Loader } from "../../components/Loader";



const columns = [
  {
    Header: "User",
    accessor: (row) => `${row.customer?.first_name} ${row.customer?.last_name}`
  },
  {
    Header: "Amount",
    accessor: "total_amount",
  },
  {
    Header: "Discount",
    accessor: "discount",
  },
  {
    Header: "Items",
    accessor: "items.length",
  },
  {
    Header: "Status",
    accessor: (row) => row.status[row.status.length - 1]?.status || "No Status",
  },  
  {
    Header: "Action",
    accessor: "action",
  },

];


const Transaction = () => {
  const navigate = useNavigate();
  const server = import.meta.env.VITE_SERVER;
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const handleNavigate = (order) => {
    navigate(`/admin/transaction/${order._id}`,{state: {order}});
  };

  const fetchOrders = async () => {
    const encryptedData = encryptData(JSON.stringify({ page: page + 1, perPage: 10 }));
    const encryptedResponse = await axios.post(`${server}/order`, {
      encryptedData,
    })

    const { orders, total}  = encryptedResponse.data.data;
    const updatedRows = orders.map((row) => ({
      ...row,
      action: <button className="manage" onClick={() => handleNavigate(row)}>Manage</button>,
    }));
    setRows(updatedRows);
    setTotalPages(Math.ceil(total / 10));
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, []);
  const TableComponent = TableHOC(
    columns,
    rows,
    "dashboard-product-box",
    "Orders"
  );
  
  return (
    <div className="admin-container">
      <AdminSidebar />
      {rows.length > 0 ?(
        <>
      <main>
        <TableComponent />
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </main>
      </>) : <Loader/>}
    </div>
  );
};

export default Transaction;
