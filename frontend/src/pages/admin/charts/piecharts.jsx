import { useState, useEffect } from "react";
import apiClient from "../../../utils/apiClient";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { DoughnutChart, PieChart } from "../../../components/admin/Charts";
import data from "../../../assets/data.json";


const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
const PieCharts = () => {
  const [orderLabels, setOrderLabels] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [categoryColors, setCategoryColors] = useState([]);
  const [stock , setStock] = useState([]);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiClient.get("/stats/pie-stats");
        if (res.data.success) {
          const orderFullFillment = res.data.charts.orderFullFillment;
          const labels = Object.keys(orderFullFillment);
          const data = Object.values(orderFullFillment);
          const ProductStockData = [
            res.data.charts.productStock["inStock"] || 0,
            res.data.charts.productStock["outOfStock"] || 0,
          ];
          setStock(ProductStockData);
          const Colors = data.map(() => getRandomColor());
          setOrderLabels(labels);
          setOrderData(data);
          setCategoryColors(Colors);
        }
      } catch (error) {
        console.error('Error fetching pie chart data:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await apiClient.get("/products/categories");
        if (response.data.success) {
          setCategories(response.data.data);        
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };  

    fetchCategories();

    fetchData();
  }, []);

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="chart-container">
        <h1>Pie & Doughnut Charts</h1>

        <section>
          <div>
            <PieChart
              labels={orderLabels}
              data={orderData}
              backgroundColor={[
                `hsl(110,80%, 80%)`,
                `hsl(110,80%, 50%)`,
                `hsl(110,40%, 50%)`,
                `hsl(120,40%, 50%)`,
                `hsl(130,50%, 50%)`,
                `hsl(140,60%, 50%)`,
              ]}
              offset={[0, 0, 50]} // Adjust based on your chart library's support
            />
          </div>
          <h2>Order Fulfillment Ratio</h2>
        </section>

        <section>
          <div>
            <DoughnutChart
              labels={categories.map((i) => i.category)}
              data={categories.map((i) => i.count)}
              backgroundColor={categoryColors}
              legends={false}
              offset={[0, 0, 0, 80]} // Adjust based on your chart library's support
            />
          </div>
          <h2>Product Categories Ratio</h2>
        </section>

        <section>
          <div>
            <DoughnutChart
              labels={["In Stock", "Out Of Stock"]}
              data={stock}
              backgroundColor={["rgb(53, 162, 255)","rgb(255, 0, 53)" ]}
              legends={false}
              offset={[0, 80]}
              cutout={"70%"}
            />
          </div>
          <h2>Stock Availability</h2>
        </section>

        {/* <section>
          <div>
            <DoughnutChart
              labels={[
                "Marketing Cost",
                "Discount",
                "Burnt",
                "Production Cost",
                "Net Margin",
              ]}
              data={[32, 18, 5, 20, 25]}
              backgroundColor={[
                "hsl(110,80%,40%)",
                "hsl(19,80%,40%)",
                "hsl(69,80%,40%)",
                "hsl(300,80%,40%)",
                "rgb(53, 162, 255)",
              ]}
              legends={false}
              offset={[20, 30, 20, 30, 80]}
            />
          </div>
          <h2>Revenue Distribution</h2>
        </section>

        <section>
          <div>
            <PieChart
              labels={[
                "Teenager(Below 20)",
                "Adult (20-40)",
                "Older (above 40)",
              ]}
              data={[30, 250, 70]}
              backgroundColor={[
                `hsl(10, ${80}%, 80%)`,
                `hsl(10, ${80}%, 50%)`,
                `hsl(10, ${40}%, 50%)`,
              ]}
              offset={[0, 0, 50]} // Adjust based on your chart library's support
            />
          </div>
          <h2>Users Age Group</h2>
        </section>

        <section>
          <div>
            <DoughnutChart
              labels={["Admin", "Customers"]}
              data={[40, 250]}
              backgroundColor={[`hsl(335, 100%, 38%)`, "hsl(44, 98%, 50%)"]}
              offset={[0, 50]}
            />
          </div>
        </section> */}
      </main>
    </div>
  );
};

export default PieCharts;
