import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import "../styles/AddressDisplay.css";

function AddressDisplay({ addresses, onEdit, onDelete }) {
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);

  const formatAddress = (address) => {
    return [
      address.address_line1,
      address.landmark,
      address.locality,
      address.city,
      address.state,
    ]
      .filter(Boolean) // Remove empty or undefined values
      .join(", ");
  };

  const handleOptionsClick = (index) => {
    setSelectedAddressIndex(selectedAddressIndex === index ? null : index);
  };

  const handleEditClick = (address, index) => {
    onEdit(address, index);
  };

  const handleDeleteClick = (address) => {
    onDelete(address);
  };

  return (
    <div className="address-display-container">
      <h2>Saved Addresses</h2>
      {addresses.length > 0 ? (
        addresses.map((address, index) => (
          <div key={index} className="address-card">
            <div className="address-header">
              <div className="addressType">
                <p>{address.type}</p>
              </div>
              <div className="options" onClick={() => handleOptionsClick(index)}>
                <BsThreeDotsVertical />
                {selectedAddressIndex === index && (
                  <div className="dropdown-menu">
                    <div onClick={() => handleEditClick(address, index)}>Edit</div>
                    <div onClick={() => handleDeleteClick(address)}>Delete</div>
                  </div>
                )}
              </div>
            </div>
            <div className="user-details">
              <p>{address.name}</p>
              <p>{address.phoneNumber}</p>
              <p>{address.alternatePhoneNumber}</p>
            </div>
            <div className="address-details">
              <p>
                {formatAddress(address)}
                {address.pinCode && (
                  <>
                    {" - "}
                    <span className="pincode">{address.pinCode}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>No addresses found.</p>
      )}
    </div>
  );
}

export default AddressDisplay;
