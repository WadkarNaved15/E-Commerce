import toast from "react-hot-toast";
import { BiMaleFemale } from "react-icons/bi";
import { BsSearch } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
import { HiTrendingDown, HiTrendingUp } from "react-icons/hi";
import { useSelector } from "react-redux";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { BarChart, DoughnutChart } from "../../components/admin/Charts";
import Table from "../../components/admin/DashboardTable";
import { Loader } from "../../components/Loader";
import { useEffect, useState ,useRef } from "react";
import apiClient from "../../utils/apiClient";
import "../../styles/admin-styles/dashboard.css";

const userImg =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJxA5cTf-5dh5Eusm0puHbvAhOrCRPtckzjA&usqp";

import data from "../../assets/data.json";
import axios from "axios";

const Dashboard = () => {
  const server = import.meta.env.VITE_SERVER
  const [category, setCategory] = useState([]);
  const [stats, setStats] = useState({});
  const [months, setMonths] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [expense, setExpense] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/products/categories");
        if (response.data.success) {
          setCategory(response.data.data);        
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };  

    const fetchData = async () => {
      try {
        const response = await apiClient.get("/stats/dashboard-stats");
        if (response.data.success) {
          setStats(response.data.stats);
          setMonths(response.data.stats.revenue.map((revenue) => revenue.month));
          setRevenue(response.data.stats.revenue.map((revenue) => revenue.revenue));
          setExpense(response.data.stats.expenses.map((expense) => expense.expense));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    fetchCategories();
  }, []);

  if(!stats.changePercentage) return (
    <div className="admin-container-loader">
      <Loader />
    </div>
  )
  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="dashboard">
        <section className="widget-container">
          {/* <WidgetItem
            percent={stats.changePercentage.revenue}
            amount={true}
            value={stats.count.revenue}
            heading="Revenue"
            color="rgb(0, 115, 255)"
          /> */}
          <WidgetItem
            percent={stats.changePercentage.user}
            value={stats.count.user}
            color="rgb(0 198 202)"
            heading="Users"
          />
          <WidgetItem
            percent={stats.changePercentage.order}
            value={stats.count.order}
            color="rgb(255 196 0)"
            heading="Orders"
          />

          <WidgetItem
            percent={stats.changePercentage.product}
            value={stats.count.product}
            color="rgb(76 0 255)"
            heading="Products"
          />
          
        </section>

        <section className="graph-container">
          <div className="revenue-chart">
            <h2>Revenue & Transaction</h2>
            <BarChart             
              data_1={revenue}
              data_2={expense}
              title_1="Revenue"
              title_2="Expense"
              bgColor_1="rgb(0, 115, 255)"
              bgColor_2="rgba(53, 162, 235, 0.8)"
              labels={months}
            />
          </div>


        </section>

        <section className="graph-container">
        <div className="dashboard-categories">
            <h2>Inventory</h2>

            <div>
              {category.map((i) => (
                <CategoryItem
                  key={i.category}
                  value={i.count}
                  heading={i.category}
                  color={`hsl(${i.count * 4}, ${i.count}%, 50%)`}
                />
              ))}
            </div>

          </div>
          {/* <div className="gender-chart">
            <h2>Gender Ratio</h2>
            <DoughnutChart
              labels={["Female", "Male"]}
              data={[12, 19]}
              backgroundColor={[
                "hsl(340, 82%, 56%)",
                "rgba(53, 162, 235, 0.8)",
              ]}
              cutout={90}
            />
          </div>
          <Table data={data.transaction} /> */}
        </section>
      </main>
    </div>
  );
};


const WidgetItem = ({
  heading,
  value,
  percent,
  color,
  amount = false,
}) => (
  <article className="widget">
    <div className="widget-info">
      <p>{heading}</p>
      <h4>{amount ? `₹${value}` : value}</h4>
      {percent > 0 ? (
        <span className="green">
          <HiTrendingUp /> +{percent}%{" "}
        </span>
      ) : (
        <span className="red">
          <HiTrendingDown /> {percent}%{" "}
        </span>
      )}
    </div>

    <div
      className="widget-circle"
      style={{
        background: `conic-gradient(
        ${color} ${(Math.abs(percent) / 100) * 360}deg,
        rgb(255, 255, 255) 0
      )`,
      }}
    >
      <span
        style={{
          color,
        }}
      >
        {percent}%
      </span>
    </div>
  </article>
);



const CategoryItem = ({ color, value, heading }) => (
  <div className="category-item">
    <h5 style={{ textTransform: 'capitalize',
      fontWeight: 'bold'
     }}>{heading}</h5>
    <div>
      <div
        style={{
          backgroundColor: color,
          width: `${value}%`, 
        }}
      ></div>
    </div>
    <span>{value}</span>
  </div>
);

export default Dashboard;
