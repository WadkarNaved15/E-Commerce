import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { Link , useNavigate} from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/admin/AdminSidebar';
import TableHOC from '../../components/admin/TableHOC';
import '../../styles/admin-styles/category.css';
import Pagination from '../../components/Pagination';
import { encryptData , decryptData } from '../../utils/Encryption';

const columns = [
  {
    Header: 'Photo',
    accessor: 'image',
  },
  {
    Header: 'Name',
    accessor: 'name',
  },
  {
    Header: 'Type',
    accessor: 'type',
  },
  {
    Header: 'Child Category',
    accessor: 'subcategories',
    Cell: ({ value }) => (
      <div>
        {value.map((subcategory, index) => (
          <div key={index}>{subcategory.name}</div>
        ))}
      </div>
    ),
  },
  {
    Header: 'Action',
    accessor: 'action',
  },
];

const Categories = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const handleNavigate = (category) => {
    navigate(`/admin/categorymanagement/${category._id}`,{state: {category}});
  };
  useEffect(() => {
    const server = import.meta.env.VITE_SERVER
    const fetchCategories = async () => {
      try {
        const encryptedData = encryptData(JSON.stringify({ page: page + 1, perPage: 10 }));
        const encryptedResponse = await axios.post(`${server}/category/all`,{
          encryptedData,
        } );
        const decryptedResponse = decryptData(encryptedResponse.data.data);
        const parsedResponse = JSON.parse(decryptedResponse);
        const { categories, total } = parsedResponse;
        const updatedRows = categories.map((row) => ({
          ...row,
          image: <img src={`${server}/${row?.Image?.url}`} alt={row?.Image?.alt_text} />,
          action: <button className="manage" onClick={() => handleNavigate(row)}>Manage</button>,
        }));
        setRows(updatedRows);
        setTotalPages(Math.ceil(total / 10));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, [page]);

  const TableComponent = TableHOC(columns, rows, 'dashboard-category-box', 'Categories');

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main>
        <TableComponent />
        <Pagination page={page} setPage={setPage} totalPages={totalPages} />
      </main>
      <Link to="/admin/category/new" className="create-category-btn">
        <FaPlus />
      </Link>
    </div>
  );
};

export default Categories;
