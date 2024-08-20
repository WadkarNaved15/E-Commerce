import React, { useState, useEffect } from "react";
import "../styles/ShippingAddress.css";
import { FaPlus } from "react-icons/fa";
import { encryptData, decryptData } from "../utils/Encryption";
import apiClient from "../utils/apiClient";
import AddressDisplay from "../components/AddressDisplay";
import { Loader } from "../components/Loader";
import toast from "react-hot-toast";

const statesList = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Delhi",
  "Puducherry",
  "Ladakh",
  "Jammu and Kashmir",
];

const ShippingAddress = ({dispalyAddresses = true}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phoneNumber: '',
    pinCode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    alternatePhoneNumber: '',
    addressType: 'Home',
  });

  const [showForm, setShowForm] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/shipping-address');
        const decryptedData = decryptData(response.data.addresses);
        const parsedData = JSON.parse(decryptedData || '[]');
        setAddresses(parsedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        setAddresses([]); // Ensure addresses is always set to an array
      }
    };
    if(dispalyAddresses) {
    fetchAddresses();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const encryptedData = encryptData(JSON.stringify(formData));
      let response;
      if (isEditing) {
        response = await apiClient.put('/shipping-address', { encryptedData }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if(response.data.message === 'Address updated successfully') {
          toast.success('Address updated successfully');
        }
      } else {
        response = await apiClient.post('/shipping-address', { encryptedData }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if(response.data.message === 'Address added successfully') {
          toast.success('Address added successfully');
        }
      }
      const updatedAddresses = await apiClient.get('/shipping-address');
      const decryptedUpdatedData = decryptData(updatedAddresses.data.addresses);
      const parsedUpdatedData = JSON.parse(decryptedUpdatedData || '[]');
      setAddresses(parsedUpdatedData);
      setFormData({
        id: '',
        name: '',
        phoneNumber: '',
        pinCode: '',
        locality: '',
        address: '',
        city: '',
        state: '',
        landmark: '',
        alternatePhoneNumber: '',
        addressType: 'Home',
      });
      setShowForm(false);
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (e.g., show an error message)
    }
  };

  const toggleFormVisibility = () => {
    setShowForm((prevShowForm) => !prevShowForm);
    setIsEditing(false);
    setFormData({
      id: '',
      name: '',
      phoneNumber: '',
      pinCode: '',
      locality: '',
      address: '',
      city: '',
      state: '',
      landmark: '',
      alternatePhoneNumber: '',
      addressType: 'Home',
    });
  };

  const handleEdit = (address, index) => {
    const mappedAddress = {
      id: address._id,
      name: address.name,
      phoneNumber: address.phoneNumber,
      pinCode: address.pinCode,
      locality: address.locality,
      address: address.address_line1, 
      city: address.city,
      state: address.state,
      landmark: address.landmark,
      alternatePhoneNumber: address.alternatePhoneNumber,
      addressType: address.type, 
    };
    setFormData(mappedAddress);
    setShowForm(true);
    setIsEditing(true);
  };

  const handleDelete = async (address) => {
    try {
        const encryptedData = encryptData(JSON.stringify({ id: address._id }));
      const response = await apiClient.delete('/shipping-address', {
        data: { encryptedData },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      if (response.data.message === 'Address deleted successfully') {
        toast.success('Address deleted successfully');
        const updatedAddresses = await apiClient.get('/shipping-address');
        const decryptedUpdatedData = decryptData(updatedAddresses.data.addresses);
        const parsedUpdatedData = JSON.parse(decryptedUpdatedData || '[]');
        setAddresses(parsedUpdatedData);
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      // Handle error (e.g., show an error message)
    }
  };

  if(isLoading) {
    return <Loader />
  }

  return (
    <div className="shipping-container">
      <div className="manage-address">
       {dispalyAddresses && <p>Manage Address</p> }
        {!showForm && (
          <div className="add-address-button">
            <button onClick={toggleFormVisibility}>
              <FaPlus /> Add New Address
            </button>
          </div>
        )}
      </div>
      {showForm && (
        <div className="shipping-form-container">
          <p>{isEditing ? "Edit Address" : "Add New Address"}</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                type="text"
                name="name"
                id="name"
                required
              />
            </div>
            <div className="form-group">
              <input
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="10-digit-number"
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                required
              />
            </div>
            <div className="form-group">
              <input
                value={formData.pinCode}
                onChange={handleChange}
                placeholder="Pincode"
                type="text"
                name="pinCode"
                id="pinCode"
                required
              />
            </div>
            <div className="form-group">
              <input
                value={formData.locality}
                onChange={handleChange}
                placeholder="Locality"
                type="text"
                name="locality"
                id="locality"
                required
              />
            </div>
            <div id="address" className="form-group">
              <input
                value={formData.address}
                onChange={handleChange}
                placeholder="Address (Area and Street)"
                type="text"
                name="address"
                id="address"
                required
              />
            </div>
            <div className="form-group">
              <input
                value={formData.city}
                onChange={handleChange}
                placeholder="City/District/Town"
                type="text"
                name="city"
                id="city"
                required
              />
            </div>
            <div className="form-group">
              <select
                value={formData.state}
                onChange={handleChange}
                name="state"
                id="state"
                required
              >
                <option value="" disabled>Select State</option>
                {statesList.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <input
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Landmark (optional)"
                type="text"
                name="landmark"
                id="landmark"
              />
            </div>
            <div className="form-group">
              <input
                value={formData.alternatePhoneNumber}
                onChange={handleChange}
                placeholder="Alternate Phone Number (optional)"
                type="tel"
                name="alternatePhoneNumber"
                id="alternatePhoneNumber"
              />
            </div>
            <div id="addressType" className="form-group">
              <label>
                <input
                  type="radio"
                  name="addressType"
                  value="Home"
                  checked={formData.addressType === 'Home'}
                  onChange={handleChange}
                />
                Home
              </label>
              <label>
                <input
                  type="radio"
                  name="addressType"
                  value="Work"
                  checked={formData.addressType === 'Work'}
                  onChange={handleChange}
                />
                Work
              </label>
              <label>
                <input
                  type="radio"
                  name="addressType"
                  value="Other"
                  checked={formData.addressType === 'Other'}
                  onChange={handleChange}
                />
                Other
              </label>
            </div>
            <button className="submit-button" type="submit">
              {isEditing ? "Update" : "Submit"}
            </button>
            <button
              className="cancel-button"
              type="button"
              onClick={toggleFormVisibility}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
      {dispalyAddresses && <AddressDisplay addresses={addresses} onEdit={handleEdit} onDelete={handleDelete} />}
    </div>
  );
};

export default ShippingAddress;
