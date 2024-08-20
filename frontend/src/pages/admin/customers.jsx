import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import AdminSidebar from "../../components/admin/AdminSidebar";
import TableHOC from "../../components/admin/TableHOC";
import Pagination from "../../components/Pagination";

const columns = [
  // {
  //   Header: "Avatar",
  //   accessor: "avatar",
  // },
  {
    Header: "Name",
    accessor: (row) => `${row.first_name} ${row.last_name}`
  },
  // {
  //   Header: "Gender",
  //   accessor: "gender",
  // },
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

// const arr = [
//   {
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img}
//         alt="Avatar"
//       />
//     ),
//     name: "Emily Palmer",
//     email: "emily.palmer@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },
//   {
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },{
//     avatar: (
//       <img
//         style={{
//           borderRadius: "50%",
//         }}
//         src={img2}
//         alt="Avatar"
//       />
//     ),
//     name: "May Scoot",
//     email: "aunt.may@example.com",
//     gender: "female",
//     role: "user",
//     action: (
//       <button>
//         <FaTrash />
//       </button>
//     ),
//   },
// ];

const Customers = () => {
  const server = import.meta.env.VITE_SERVER
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    axios
      .get(`${server}/user/all`)
      .then((res) => {
        const {data} = res.data;
        setRows(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  rows.forEach((row) => {
    row.action = (
      <button>
        <FaTrash />
      </button>
    );
  });



  const TableComponent = TableHOC(
    columns,
    rows,
    "dashboard-customer-box",
    "Customers",
    rows.length > 6
  );

  return (
    <div className="admin-container" > 
      <AdminSidebar className="admin-sidebar" />
      <main>
        <TableComponent />
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </main>
    </div>
  );
};

export default Customers;
