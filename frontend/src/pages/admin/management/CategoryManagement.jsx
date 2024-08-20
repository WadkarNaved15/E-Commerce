import { useEffect, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useParams, useNavigate } from "react-router";
import "../../../styles/admin-styles/category.css";
import { Loader } from "../../../components/Loader";
import { encryptData , decryptData } from "../../../utils/Encryption";


const CategoryManagement = () => {
  const server = import.meta.env.VITE_SERVER;
  const { id } = useParams();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [subcategories, setSubcategories] = useState([{ name: "" }]); // Manage subcategories as an array
  const [imageFile, setImageFile] = useState(null); 
  const [imageAltText, setImageAltText] = useState(""); 
  const [imagePreview, setImagePreview] = useState("");
  const [deletedImage, setDeletedImage] = useState(false); 
  const navigate = useNavigate();

  const fetchCategory = async () => {
    try {
      const encryptedData = encryptData(JSON.stringify({ id }));
      const encryptedResponse = await axios.post(`${server}/category`, { encryptedData });
      const decryptedResponse = decryptData(encryptedResponse.data.data);
      const data = JSON.parse(decryptedResponse);
      setName(data.name);
      setType(data.type);
      setSubcategories(data.subcategories || [{ name: "" }]); // Initialize subcategories
      setImagePreview(data.Image.url);
      setImageAltText(data.Image.alt_text);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const deleteImageHandler = () => {
    setDeletedImage(true);
    setImagePreview("");
    setImageFile(null);
    setImageAltText("");
  };

  const handleSubcategoryChange = (index, value) => {
    const updatedSubcategories = [...subcategories];
    updatedSubcategories[index].name = value;
    setSubcategories(updatedSubcategories);
  };

  const addSubcategory = () => {
    setSubcategories([...subcategories, { name: "" }]);
  };

  const removeSubcategory = (index) => {
    const updatedSubcategories = subcategories.filter((_, i) => i !== index);
    setSubcategories(updatedSubcategories);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('subcategories', JSON.stringify(subcategories));
    formData.append('alt_text', imageAltText);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    formData.append('deletedImage', deletedImage);

    try {
      const response = await axios.put(`${server}/category/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        toast.success("Category updated successfully");
        navigate('/admin/category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error("Error updating category");
    }
  };

  if (!imagePreview) return <Loader />;

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="category-management">
        <section>
          <strong>ID - {id}</strong>
          {imagePreview && (
            <img src={`${server}/${imagePreview}`} alt="Category" />
          )}
          <p>{name}</p>
          <h3>{type}</h3>
        </section>
        <article>
          <form onSubmit={submitHandler}>
            <h2>Manage Category</h2>
            <div>
              <label>Name</label>
              <textarea
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></textarea>
            </div>

            <div>
              <label>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="price">Price</option>
                <option value="simple">Product</option>
              </select>
            </div>

            <div>
              <label>Subcategories</label>
              {subcategories.map((subcategory, index) => (
                <div key={index} className="subcategory-item">
                  <input
                    type="text"
                    placeholder={`Subcategory ${index + 1}`}
                    value={subcategory.name}
                    onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                  />
                  <button type="button" onClick={() => removeSubcategory(index)}>
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSubcategory}>
                Add Subcategory
              </button>
            </div>

            <div>
              <label>Image Alt Text</label>
              <input
                type="text"
                placeholder="Alt Text"
                value={imageAltText}
                onChange={(e) => setImageAltText(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Image</label>
              <input
                type="file"
                onChange={changeImageHandler}
                accept="image/*"
              />
              {imagePreview && (
                <div className="photo-container">
                  <img
                    src={`${server}/${imagePreview}`}
                    alt="Category Image"
                  />
                  <button type="button" onClick={deleteImageHandler}>
                    <FaTrash size={30} />
                  </button>
                </div>
              )}
            </div>

            <button type="submit">Update</button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default CategoryManagement;
