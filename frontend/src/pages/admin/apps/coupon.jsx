import { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import "../../../styles/admin-styles/coupon.css";
import apiClient from "../../../utils/apiClient";
import { encryptData } from "../../../utils/Encryption";
import { toast } from "react-hot-toast";

const Coupon = () => {
  const [couponName, setCouponName] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumPurchaseAmount, setMinimumPurchaseAmount] = useState("");
  const [isLifetime, setIsLifetime] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [coupon, setCoupon] = useState("");

  const copyText = async (coupon) => {
    await window.navigator.clipboard.writeText(coupon);
    setIsCopied(true);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!couponName) return toast.error("Please enter a coupon name");
    if (!expirationDate && !isLifetime) return toast.error("Please enter an expiration date or select lifetime");
    if (!discountValue) return toast.error("Please enter a discount value");
    if (!minimumPurchaseAmount) return toast.error("Please enter a minimum purchase amount");

    const couponData = {
      name: couponName,
      expirationDate: isLifetime ? new Date(9999, 11, 31).toISOString() : expirationDate,
      discountType,
      discountValue: parseFloat(discountValue),
      minimumPurchaseAmount: parseFloat(minimumPurchaseAmount)
    };

    try {
      const encryptedData = encryptData(JSON.stringify(couponData));
      const response = await apiClient.post("/coupon/new", { encryptedData });

      if (response.data.success) {
        setCoupon(couponName);
        toast.success("Coupon created successfully!");
      } else {
        toast.error("Failed to create coupon. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    setIsCopied(false);
  }, [coupon]);

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="dashboard-app-container">
        <h1>Coupon</h1>
        <section>
          <form className="coupon-form" onSubmit={submitHandler}>
            <input
              type="text"
              placeholder="Coupon Name"
              value={couponName}
              onChange={(e) => setCouponName(e.target.value)}
              maxLength={25}
              required
            />

            <input
              type="datetime-local"
              placeholder="Expiration Date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              disabled={isLifetime}
              required={!isLifetime}
            />

            <label>
              <input
                type="checkbox"
                checked={isLifetime}
                onChange={() => setIsLifetime(!isLifetime)}
              />
              Lifetime Coupon
            </label>

            <fieldset>
              <legend>Discount Type</legend>
              <label>
                <input
                  type="radio"
                  value="percentage"
                  checked={discountType === "percentage"}
                  onChange={() => setDiscountType("percentage")}
                />
                Percentage
              </label>
              <label>
                <input
                  type="radio"
                  value="fixed"
                  checked={discountType === "fixed"}
                  onChange={() => setDiscountType("fixed")}
                />
                Fixed Amount
              </label>
            </fieldset>

            <input
              type="number"
              placeholder="Discount Value"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Minimum Purchase Amount"
              value={minimumPurchaseAmount}
              onChange={(e) => setMinimumPurchaseAmount(e.target.value)}
              required
            />

            <button type="submit">Create</button>
          </form>

          {coupon && (
            <code>
              {coupon}{" "}
              <span onClick={() => copyText(coupon)}>
                {isCopied ? "Copied" : "Copy"}
              </span>{" "}
            </code>
          )}
        </section>
      </main>
    </div>
  );
};

export default Coupon;
