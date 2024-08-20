import React , { useEffect, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { LineChart } from "../../../components/admin/Charts";
import apiClient from "../../../utils/apiClient";


const Linecharts = () => {
    const [user, setUser] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [expense, setExpense] = useState([]);
    const [months, setMonths] = useState([]);
    useEffect(() => {
       const fetchData = async () => {
         const response = await apiClient.get("/stats/line-stats");
         if (response.data.success) {
           const {lineChartData} = response.data;
           const month = lineChartData.map((lineChartData) => lineChartData.month)
           const revenue = lineChartData.map((lineChartData) => lineChartData.revenue);
           const users = lineChartData.map((lineChartData) => lineChartData.newUser);
           const expense = lineChartData.map((lineChartData) => lineChartData.expense);
           setMonths(month);
           setRevenue(revenue);
           setUser(users);
           setExpense(expense);
       }
      }

      fetchData();
    }, []);
  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="chart-container">
        <h1>Line Charts</h1>
        <section>
          <LineChart
            data={user}
            label="New Users"
            borderColor="rgb(53, 162, 255)"
            labels={months}
            backgroundColor="rgba(53, 162, 255, 0.5)"
          />
          <h2>New Users</h2>
        </section>


        <section>
          <LineChart
            data={revenue}
            backgroundColor={"hsla(129,80%,40%,0.4)"}
            borderColor={"hsl(129,80%,40%)"}
            label="Revenue"
            labels={months}
          />
          <h2>Total Revenue </h2>
        </section>

        <section>
          <LineChart
            data={expense}
            backgroundColor={"hsla(29,80%,40%,0.4)"}
            borderColor={"hsl(29,80%,40%)"}
            label="Expense"
            labels={months}
          />
          <h2>Total Expense </h2>
        </section>
      </main>
    </div>
  );
};

export default Linecharts;
