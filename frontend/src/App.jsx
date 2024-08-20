import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styles/admin-styles/chart.css";
import "./styles/admin-styles/mediaquery.css";
import "./styles/App.css";
import Layout from "./Layout";
import ProductFilterPage from "./components/DisplayPage/ProductFilterPage";
import Login from "./components/Home/Login";
import Categories from "./pages/admin/categories";
import CategoryManagement from "./pages/admin/management/CategoryManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";



// const Login = lazy(() => import("./pages/Login"));
const Home = lazy(() => import("./pages/Home"));
const Cart = lazy(() => import("./pages/Cart"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsCondition"));
const PaymentPolicy = lazy(() => import("./pages/PaymentPolicy"));
const ShippingAddress = lazy(() => import("./pages/ShippingAddress"));
const Profile = lazy(() => import("./pages/Profile"));
const Checkout = lazy(() => import("./pages/Checkout"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const OrderSummary = lazy(() => import("./pages/OrderSummary"));
const ReviewForm = lazy(() => import("./pages/ReviewForm"));
const EmptyCart = lazy(() => import("./pages/EmptyCart"));



// Admin Routes
const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const Products = lazy(() => import("./pages/admin/products"));
const Customers = lazy(() => import("./pages/admin/customers"));
const Transaction = lazy(() => import("./pages/admin/transaction"));
const CouponManagement = lazy(() => import("./pages/admin/Coupons"));
const Barcharts = lazy(() => import("./pages/admin/charts/barcharts"));
const Piecharts = lazy(() => import("./pages/admin/charts/piecharts"));
const Linecharts = lazy(() => import("./pages/admin/charts/linecharts"));
const Coupon = lazy(() => import("./pages/admin/apps/coupon"));
const NewProduct = lazy(() => import("./pages/admin/management/newproduct"));
const NewCategory = lazy(() => import("./pages/admin/management/NewCategory"));
const ProductManagement = lazy(
  () => import("./pages/admin/management/productmanagement")
);
const TransactionManagement = lazy(
  () => import("./pages/admin/management/transactionmanagement")
);

const App = () => {
  return (
      
    <Router>
      <Suspense >
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/empty-cart" element={<EmptyCart />} />
            <Route path="/product/:name" element={<ProductPage />} />
            <Route path="/display/:search" element={<ProductFilterPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/payment-policy" element={<PaymentPolicy />} />

            <Route path="/login"element={<GuestRoute><Login /></GuestRoute>}/>

            <Route path="/" element={<ProtectedRoute />}>
              <Route path="profile" element={<Profile />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-summary" element={<OrderSummary />} />
              <Route path="review-form" element={<ReviewForm />} />
            </Route>


            <Route path="/admin" element={<ProtectedRoute adminOnly={true} />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="product" element={<Products />} />
                <Route path="category" element={<Categories />} />
                <Route path="customer" element={<Customers />} />
                <Route path="transaction" element={<Transaction />} />
                <Route path="coupon" element={<CouponManagement />} />
                <Route path="chart/bar" element={<Barcharts />} />
                <Route path="chart/pie" element={<Piecharts />} />
                <Route path="chart/line" element={<Linecharts />} />
                <Route path="app/coupon" element={<Coupon />} />
                <Route path="product/new" element={<NewProduct />} />
                <Route path="category/new" element={<NewCategory />} />
                <Route path="productmanagement/:id" element={<ProductManagement />} />
                <Route path="categorymanagement/:id" element={<CategoryManagement />} />
                <Route path="transaction/:id" element={<TransactionManagement />} />
            </Route>


          </Routes>
        </Layout>
      </Suspense>
    </Router>

  );
};

export default App;
