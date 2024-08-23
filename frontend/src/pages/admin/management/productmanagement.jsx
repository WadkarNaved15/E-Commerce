import { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useParams, useNavigate } from "react-router";
import "../../../styles/admin-styles/products.css";
import { Loader } from "../../../components/Loader";
import { encryptData, decryptData } from "../../../utils/Encryption";

const Productmanagement = () => {
  const server = import.meta.env.VITE_SERVER;
  const { id } = useParams();
  const [display_price, setDisplayPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [purchase_price, setPurchasePrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [deletedImageUrls, setDeletedImageUrls] = useState([]);
  const [specifications, setSpecifications] = useState([{ key: "", value: "" }]);
  const [keywords, setKeywords] = useState(""); // New state for keywords

  const navigate = useNavigate();

  const fetchProduct = async () => {
    try {
      const encryptedData = encryptData(JSON.stringify({ id }));
      const encryptedResponse = await axios.post(`${server}/products/page`, { encryptedData });
      const decryptedResponse = decryptData(encryptedResponse.data.data);
      const parsedResponse = JSON.parse(decryptedResponse);
      setPrice(parsedResponse.price);
      setStock(parsedResponse.stock);
      setName(parsedResponse.name);
      setImageUrls(parsedResponse.images.map((image) => image.url));
      setPhotos([]);
      setCategory(parsedResponse.category);
      setSubcategory(parsedResponse.subcategory);
      setDisplayPrice(parsedResponse.display_price);
      setDescription(parsedResponse.description);
      setBrand(parsedResponse.brand);
      setPurchasePrice(parsedResponse.purchase_price);
      setMainImage(parsedResponse.images[0]?.url);
      setKeywords(parsedResponse.keywords || ""); // Set keywords from the fetched data
      setSpecifications(parsedResponse.specifications || [{ key: "", value: "" }]);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const changeImageHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Generate a URL for the new image
      const newImageUrl = URL.createObjectURL(file);
      setPhotos((prevPhotos) => [...prevPhotos, { file, url: newImageUrl }]);
    }
  };

  const deleteImageHandler = (index) => {
    const urlToDelete = imageUrls[index];
    if (urlToDelete) {
      setDeletedImageUrls((prevDeletedUrls) => [...prevDeletedUrls, urlToDelete]);
    }
    setImageUrls((prevImageUrls) => prevImageUrls.filter((_, i) => i !== index));
  };

  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecifications = [...specifications];
    updatedSpecifications[index][field] = value;
    setSpecifications(updatedSpecifications);
  };

  const addSpecificationField = () => {
    setSpecifications([...specifications, { key: "", value: "" }]);
  };

  const removeSpecificationField = (index) => {
    const updatedSpecifications = specifications.filter((_, i) => i !== index);
    setSpecifications(updatedSpecifications);
  };

  const handleKeywordChange = (value) => {
    const updatedKeywords = keywords.length > 1 ? keywords.split(",").map(keyword => keyword.trim()) : keywords.length > 0 ? [value] : [];
    setKeywords(updatedKeywords);
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
      deletedImageUrls,
      specifications,
      keywords
    };

    const encryptedData = encryptData(JSON.stringify(productData));

    const formData = new FormData();

    formData.append("data", encryptedData);

    photos.forEach((photo) => {
      formData.append("new_images", photo.file);
    });

    deletedImageUrls.forEach((url) => {
      formData.append("deleted_images_urls", url);
    });

    try {
      const response = await axios.put(`${server}/products/page/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        toast.success("Product updated successfully");
        setDeletedImageUrls([]);
        navigate("/admin/product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating product");
    }
  };

  useEffect(() => {
    return () => {
      photos.forEach((photo) => {
        if (photo.file) {
          URL.revokeObjectURL(photo.url);
        }
      });
    };
  }, [photos]);

  if (!imageUrls) return <Loader />;

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <section>
          <strong>ID - {id}</strong>
          {mainImage && (
            <img
              src={mainImage.startsWith("data:image") ? mainImage : `${server}/${mainImage}`}
              alt="Main Product"
            />
          )}
          <div className="side-product-image">
            {imageUrls.map((image, index) => (
              <img
                key={index}
                src={`${server}/${image}`}
                alt={`Product Image ${index}`}
                onMouseEnter={() => setMainImage(image)}
              />
            ))}
            {photos.map((photo, index) => (
              <img
                key={`new-${index}`}
                src={photo.url}
                alt={`New Product Image ${index}`}
                onMouseEnter={() => setMainImage(photo.url)}
              />
            ))}
          </div>
          <p>{name}</p>
          {stock > 0 ? (
            <span className="green">{stock} Available</span>
          ) : (
            <span className="red">Not Available</span>
          )}
          <h3>₹{price}</h3>
        </section>
        <article>
          <h2>Manage</h2>
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
              ></textarea>
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
                type="number"
                placeholder="Purchase Price"
                value={purchase_price}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Price</label>
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Stock</label>
              <input
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
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label>Subcategory</label>
              <input
                type="text"
                placeholder="Subcategory"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              />
            </div>

            <div>
              <label>Display Price</label>
              <input
                type="number"
                placeholder="Display Price"
                value={display_price}
                onChange={(e) => setDisplayPrice(Number(e.target.value))}
              />
            </div>

            <div className="keyword-fields">
              <label>Keywords</label>
              <input
                type="text"
                placeholder="Keywords (comma separated)"
                value={keywords}
                onChange={()=>handleKeywordChange(keywords)}
              />
            </div>

            <div className="specification-fields">
              <label>Specifications</label>
              {specifications.map((spec, index) => (
                <div key={index} className="specification">
                  <input
                    type="text"
                    placeholder="Key"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecificationChange(index, "key", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecificationChange(index, "value", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecificationField(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addSpecificationField}>
                Add Specification
              </button>
            </div>

            <div className="file-input">
              <label>Images</label>
              <input
                type="file"
                accept="image/*"
                onChange={changeImageHandler}
              />
            </div>


              {imageUrls.map((url, index) => (
                <div key={index} className="image-item">
                  <img src={`${server}/${url}`} alt={`Image ${index}`} />
                  <button type="button" onClick={() => deleteImageHandler(index)}>
                    <FaTrash />
                  </button>
                </div>
              ))}
              {photos.map((photo, index) => (
                <div key={`new-${index}`} className="image-item">
                  <img src={photo.url} alt={`New Image ${index}`} />
                  <button
                    type="button"
                    onClick={() =>
                      setPhotos((prevPhotos) =>
                        prevPhotos.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
      

            <button type="submit">Submit</button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default Productmanagement;
