import { useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import "../../../styles/admin-styles/category.css";
import axios from "axios";
import toast from "react-hot-toast";

const NewCategory = () => {
  const server = import.meta.env.VITE_SERVER;
  const [name, setName] = useState("");
  const [type, setType] = useState("simple");
  const [imageFile, setImageFile] = useState(null);
  const [altText, setAltText] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [subcategories, setSubcategories] = useState([{ name: "" }]);

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSubcategoryChange = (index, event) => {
    const updatedSubcategories = [...subcategories];
    updatedSubcategories[index].name = event.target.value;
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
    formData.append("name", name);
    formData.append("type", type);
    formData.append("alt_text", altText);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.append("subcategories", JSON.stringify(subcategories));

    try {
      const response = await axios.post(`${server}/category/new`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Category created successfully");
        setName("");
        setType("simple");
        setAltText("");
        setImageFile(null);
        setImagePreview("");
        setSubcategories([{ name: "" }]);
      }
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="category-management">
        <article>
          <form onSubmit={submitHandler}>
            <h2>New Category</h2>
            <div>
              <label>Name</label>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="simple">Product</option>
                <option value="price">Price</option>
              </select>
            </div>
            <div>
              <label>Subcategories</label>
              {subcategories.map((subcategory, index) => (
                <div key={index} className="subcategory-input">
                  <input
                    type="text"
                    placeholder={`Subcategory ${index + 1}`}
                    value={subcategory.name}
                    onChange={(e) => handleSubcategoryChange(index, e)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeSubcategory(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSubcategory}>
                Add Subcategory
              </button>
            </div>
            <div>
              <label>Image</label>
              <input
                type="file"
                onChange={changeImageHandler}
                accept="image/*"
                required
              />
            </div>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt={altText} />
              </div>
            )}
            <button type="submit">Create</button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default NewCategory;
