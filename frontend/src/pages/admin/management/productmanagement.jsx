import { useEffect, useRef, useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useParams , useNavigate} from "react-router";
import "../../../styles/admin-styles/products.css"
import { Loader } from "../../../components/Loader";
import { encryptData , decryptData } from "../../../utils/Encryption";

const Productmanagement = () => {
  const server = import.meta.env.VITE_SERVER
  const { id } = useParams();
  const [display_price, setDisplayPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [purchase_price, setPurchasePrice] = useState(0);
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState([]); // Store File objects directly
  const [imageUrls, setImageUrls] = useState([]); // Store existing image URLs separately
  const [category, setCategory] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [deletedImageUrls, setDeletedImageUrls] = useState([]); // Track deleted image URLs
  const [editedImages, setEditedImages] = useState([]); // Track edited images
  const editImageRefs = useRef([]);

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
      setImageUrls(parsedResponse.images.map(image => image.url)); 
      setPhotos([]); // Initialize as empty, new photos will be added via file input
      setCategory(parsedResponse.category);
      setDisplayPrice(parsedResponse.display_price);
      setDescription(parsedResponse.description);
      setBrand(parsedResponse.brand);
      setPurchasePrice(parsedResponse.purchase_price);
      setMainImage(parsedResponse.images[0]?.url);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const changeImageHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Adding file:", file);
      setPhotos(prevPhotos => [...prevPhotos, file]); // Store File object directly
    }
  };

  const deleteImageHandler = (index) => {
    const urlToDelete = imageUrls[index];
    if (urlToDelete) {
      setDeletedImageUrls(prevDeletedUrls => [...prevDeletedUrls, urlToDelete]);
    }
    setImageUrls(prevImageUrls => prevImageUrls.filter((_, i) => i !== index));
  };

  const editImageHandler = (index, e) => {
    const file = e.target.files?.[0];
    setImageUrls(prevImageUrls => prevImageUrls.filter((_, i) => i !== index));

    if (file) {
      console.log("Editing image at index:", file);
      setEditedImages(prevEditedImages => {
        const newEditedImages = [...prevEditedImages,file];
        return newEditedImages;
      });
    }
  };

  const handleEditClick = (index) => {
    if (editImageRefs.current[index]) {
      editImageRefs.current[index].click();
    }
  };

  console.log(imageUrls)
  console.log(editedImages)
  console.log(photos)

  const submitHandler = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('brand', brand);
    formData.append('purchase_price', purchase_price);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('category', category);
    formData.append('display_price', display_price);
    formData.append('existing_images', JSON.stringify(imageUrls));
  

  
    // Append new images to FormData
    photos.forEach((photo) => {
      formData.append('new_images', photo); // Field name for new images
    });

    // Append edited images to FormData
    editedImages.forEach((photo, index) => {
      formData.append('edited_images', photo); // Field name for edited images
      formData.append(`edited_image_index`, index); // Include old URL
    });

    // Append deleted image URLs
    deletedImageUrls.forEach((url) => {
      formData.append('deleted_images_urls', url); // Field name for deleted image URLs
    });

    try {
      const response = await axios.put(`${server}/products/page/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {

        toast.success("Product updated successfully");


        setDeletedImageUrls([]);
        setEditedImages([]);
        navigate('/admin/product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error("Error updating product");
    }
  };

  useEffect(() => {
    // Cleanup object URLs to prevent memory leaks
    return () => {
      photos.forEach(photo => {
        if (photo instanceof File) {
          URL.revokeObjectURL(URL.createObjectURL(photo));
        }
      });
    };
  }, [photos]);

  if(!imageUrls) return <Loader />

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <section>
          <strong>ID - {id}</strong>
          {mainImage && (
            <img src={mainImage.startsWith('data:image') ? mainImage : `${server}/${mainImage}`} alt="Main Product" />
          )}
          <div className="side-product-image">
            {imageUrls.map((image, index) => (
              <img
                key={index}
                src={`${server}/${image}`} // Use URL directly
                alt={`Product Image ${index}`}
                onMouseEnter={() => setMainImage(image)}
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
          <form onSubmit={submitHandler}>
            <h2>Manage</h2>
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
                placeholder="e.g. laptop, camera etc"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label>Photo</label>
              <input type="file" onChange={changeImageHandler} />
            </div>
            {imageUrls.map((image, index) => (
              <div key={index} className="photo-container">
                <img
                  src={`${server}/${image}`} // Use URL directly
                  alt={`Product Image ${index}`}
                />
                <button type="button" onClick={() => handleEditClick(index)}>
                  <FaEdit size={30} />
                </button>
                <button type="button" onClick={() => deleteImageHandler(index)}>
                  <FaTrash size={30} />
                </button>
                <input
                  type="file"
                  ref={(el) => (editImageRefs.current[index] = el)}
                  style={{ display: 'none' }}
                  onChange={(e) => editImageHandler(index, e)}
                />
              </div>
            ))}
            {photos.map((photo, index) => (
              <div key={index} className="photo-container">
                <img
                  src={photo instanceof File ? URL.createObjectURL(photo) : `${server}/${photo.url}`} // Use URL.createObjectURL for File objects
                  alt={`Product Image ${index}`}
                />
                <button type="button" onClick={() => handleEditClick(index)}>
                  <FaEdit size={30} />
                </button>
                <button type="button" onClick={() => deleteImageHandler(index)}>
                  <FaTrash size={30} />
                </button>
                <input
                  type="file"
                  ref={(el) => (editImageRefs.current[index] = el)}
                  style={{ display: 'none' }}
                  onChange={(e) => editImageHandler(index, e)}
                />
              </div>
            ))}
            {editedImages.map((photo, index) => (
              <div key={index} className="photo-container">
                <img
                  src={photo instanceof File ? URL.createObjectURL(photo) : `${server}/${photo.url}`} // Use URL.createObjectURL for File objects
                  alt={`Product Image ${index}`}
                />
                <button type="button" onClick={() => deleteImageHandler(index)}>
                  <FaTrash size={30} />
                </button>
                <input
                  type="file"
                  ref={(el) => (editImageRefs.current[index] = el)}
                  style={{ display: 'none' }}
                  onChange={(e) => editImageHandler(index, e)}
                />
              </div>
            ))}

            <button type="submit">Update</button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default Productmanagement;
