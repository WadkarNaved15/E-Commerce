import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import Pagination from "../../components/Pagination";
import { toast } from "react-hot-toast";
import { decryptData , encryptData} from "../../utils/Encryption";
import { format } from "date-fns";

const couponColumns = [
    {
      Header: "Coupon Name",
      accessor: "name",
    },
    {
      Header: "Discount Type",
      accessor: "discountType",
    },
    {
      Header: "Discount Value",
      accessor: "discountValue",
    },
    {
      Header: "Expiration Date",
      accessor: "expirationDate",
    },
    {
        Header: "Minimum Purchase",
        accessor: "minimumPurchaseAmount",
    },
    {
      Header: "Action",
      accessor: "action",
    },
  ];
  

const Coupons = () => {
  const server = import.meta.env.VITE_SERVER;
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async() => {
    const encryptedData = encryptData(JSON.stringify({ page: page + 1, perPage: 10 }));
    const encryptedResponse = await axios.post(`${server}/coupon/all`, {
      encryptedData
    })

    const { coupons, total } = JSON.parse(decryptData(encryptedResponse.data.data));
    setRows(coupons);
    setTotalPages(Math.ceil(total / 10));
  };


  const handleDelete = (couponId) => {
    axios
      .delete(`${server}/coupon/${couponId}`)
      .then(() => {
        toast.success("Coupon deleted successfully!");
        fetchCoupons();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to delete coupon. Please try again.");
      });
  };

  rows.forEach((row) => {
    row.expirationDate = format(new Date(row.expirationDate), "yyyy-MM-dd HH:mm:ss");
    row.action = (
      <button onClick={() => handleDelete(row._id)}>
        <FaTrash />
      </button>
    );
  });

  const TableComponent = TableHOC(
    couponColumns,
    rows,
    "dashboard-coupon-box",
    "Coupons"
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

export default Coupons;
