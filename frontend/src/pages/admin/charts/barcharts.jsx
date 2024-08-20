import { useEffect , useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { BarChart } from "../../../components/admin/Charts";
import apiClient from "../../../utils/apiClient";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const Barcharts = () => {
  const [expense, setExpense] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await apiClient.get("/stats/bar-stats"); 

      if (response.data.success) {
        const barChartData = response.data.barChartData;
        const expense = barChartData.map((barChartData) => barChartData.expense);
        const revenue = barChartData.map((barChartData) => barChartData.revenue);
        const orders = barChartData.map((barChartData) => barChartData.deliveredCount);
        const cancelledOrders = barChartData.map((barChartData) => barChartData.cancelledCount);
        setExpense(expense);
        setRevenue(revenue);
        setOrders(orders);
        setCancelledOrders(cancelledOrders);
        setSalesData(response.data.salesData);
        const salesDataLabels = response.data.salesData.map((data) => data._id);
        const salesDataValues = response.data.salesData.map((data) => data.
        totalSold);
        const salesDataRevenue = response.data.salesData.map((data) => data.totalRevenue/1000);
        setSalesData({ labels: salesDataLabels, values: salesDataValues, revenue: salesDataRevenue });
      }
    }
    fetchData();
  }, []);


  if(revenue.length === 0) return null;
  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="chart-container">
        <h1>Bar Charts</h1>
        <section>
          <BarChart
            data_1={revenue}
            data_2={expense}
            title_1="Revenue"
            title_2="Expense"
            bgColor_1={`hsl(260, 50%, 30%)`}
            bgColor_2={`hsl(360, 90%, 90%)`}
            labels={months}
          />
          <h2>Revenue & Expense</h2>
        </section>

        <section>
          <BarChart
            data_1={orders}
            data_2={cancelledOrders}
            title_1="Orders"
            title_2="Cancelled Orders"
            bgColor_1={`hsl(180, 40%, 50%)`}
            bgColor_2="rgb(255, 0, 53)"
            labels={months}
          />
          <h2>Orders throughout the year</h2>
        </section>

        <section>
          <BarChart
          horizontal={true}
            data_1={salesData.values}
            data_2={salesData.revenue}
            title_1="Orders"
            title_2="Revenue"
            bgColor_1={`hsl(180, 40%, 50%)`}
            bgColor_2="rgb(255, 0, 53)"
            labels={salesData.labels}
          />
          <h2>Sales per Category (Revenue in thousands) </h2>
          
        </section>
      </main>
    </div>
  );
};

export default Barcharts;
