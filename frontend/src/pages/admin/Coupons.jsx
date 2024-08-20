import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import Pagination from "../../components/Pagination";
import { toast } from "react-hot-toast";
import { decryptData } from "../../utils/Encryption";
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

  const fetchCoupons = () => {
    axios
      .get(`${server}/coupon/all`)
      .then((res) => {
        const { data } = res.data;
        const coupons = JSON.parse(decryptData(data))
        setRows(coupons);
      })
      .catch((err) => {
        console.log(err);
      });
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
    "Coupons",
    rows.length > 6
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
