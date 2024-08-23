import { useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import "../../../styles/admin-styles/products.css";
import axios from "axios";
import { encryptData } from "../../../utils/Encryption";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const NewProduct = () => {
  const server = import.meta.env.VITE_SERVER;
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [display_price, setDisplayPrice] = useState(null);
  const [purchase_price, setPurchasePrice] = useState(null);
  const [price, setPrice] = useState(null);
  const [stock, setStock] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [keywords, setKeywords] = useState([""]); // State for keywords

  const changeImageHandler = (e) => {
    const files = Array.from(e.target.files);

    files.forEach(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPhotos(prevPhotos => [
          ...prevPhotos,
          { url: reader.result, file }
        ]);
      };
    });
  };

  const removeImage = (index) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);
  };

  const handleSpecificationChange = (index, key, value) => {
    const newSpecifications = [...specifications];
    newSpecifications[index][key] = value;
    setSpecifications(newSpecifications);
  };

  const addSpecificationField = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecificationField = (index) => {
    const newSpecifications = specifications.filter((_, i) => i !== index);
    setSpecifications(newSpecifications);
  };

  const handleKeywordChange = (index, value) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const addKeywordField = () => {
    setKeywords([...keywords, ""]);
  };

  const removeKeywordField = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const productData = {
      name,
      description,
      brand,
      purchase_price,
      display_price,
      price,
      stock,
      category,
      subcategory,
      specifications,
      keywords, // Include keywords in the product data
    };

    const encryptedData = encryptData(JSON.stringify(productData));

    const formData = new FormData();
    formData.append("data", encryptedData);
    photos.forEach((photo) => {
      formData.append("images", photo.file);
    });

    try {
      const response = await axios.post(`${server}/products/new`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        toast.success("Product created successfully");
        navigate("/admin/product");
      }
    } catch (error) {
      toast.error("Failed to create product");
    }
  };

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <article>
          <h2>New Product</h2>
          <form onSubmit={submitHandler}>
            <div>
              <label>Name</label>
              <textarea
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></textarea>
            </div>
            <div>
              <label>Description</label>
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label>Brand</label>
              <input
                type="text"
                placeholder="Brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </div>
            <div>
              <label>Purchase Price</label>
              <input
                min={0}
                type="number"
                placeholder="Purchase Price"
                value={purchase_price}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Display Price</label>
              <input
                min={0}
                type="number"
                placeholder="Display Price"
                value={display_price}
                onChange={(e) => setDisplayPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Price</label>
              <input
                min={0}
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Stock</label>
              <input
                min={0}
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Category</label>
              <input
                type="text"
                placeholder="eg. laptop, camera etc"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div>
              <label>Subcategory</label>
              <input
                type="text"
                placeholder="eg. Sports Shoes etc"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              />
            </div>
            <div>
              <label>Photos</label>
              <input type="file" onChange={changeImageHandler} accept="image/*" multiple />
            </div>
            <div className="image-preview">
              {photos.map((photo, index) => (
                <div key={index} className="image-item">
                  <img src={photo.url} alt={`Product Image ${index + 1}`} />
                  <button type="button" onClick={() => removeImage(index)}>Remove</button>
                </div>
              ))}
            </div>

            {/* Specification fields */}
            <div className="specification-fields">
              <label>Specifications</label>
              {specifications.map((specification, index) => (
                <div key={index}>
                  <input
                    type="text"
                    placeholder="Specification Key"
                    value={specification.key}
                    onChange={(e) => handleSpecificationChange(index, "key", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Specification Value"
                    value={specification.value}
                    onChange={(e) => handleSpecificationChange(index, "value", e.target.value)}
                  />
                  <button type="button" onClick={() => removeSpecificationField(index)}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={addSpecificationField}>Add Specification</button>
            </div>

            {/* Keyword fields */}
            <div className="keyword-fields">
              <label>Keywords</label>
              {keywords.map((keyword, index) => (
                <div key={index}>
                  <input
                    type="text"
                    placeholder="Keyword"
                    value={keyword}
                    onChange={(e) => handleKeywordChange(index, e.target.value)}
                  />
                  <button type="button" onClick={() => removeKeywordField(index)}>Remove</button>
                </div>
              ))}
              <button type="button" onClick={addKeywordField}>Add Keyword</button>
            </div>

            <button type="submit">Create</button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default NewProduct;
