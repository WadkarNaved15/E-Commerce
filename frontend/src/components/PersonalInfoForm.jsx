import React, { useEffect, useState } from "react";
import "../styles/PersonalInfoForm.css"; // Ensure you create this CSS file

const PersonalInfoForm = ({ currentInfo, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile: "",
  });

  useEffect(() => {
    // Ensure all fields are defined
    setFormData({
      first_name: currentInfo.first_name || "",
      last_name: currentInfo.last_name || "",
      mobile: currentInfo.mobile || "",
    });
  }, [currentInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="personal-info-form">
      <h2>Edit Personal Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        {/* <div className="form-group">
          <label htmlFor="mobile">Phone Number</label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
        </div> */}
        <button type="submit" className="submit-button">Save Changes</button>
      </form>
    </div>
  );
};

export default PersonalInfoForm;
