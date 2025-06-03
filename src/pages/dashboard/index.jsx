import React, { useEffect, useState } from "react";
import "./style.scss";
import { FaPlane, FaBus, FaCar, FaRegFolder, FaTag } from "react-icons/fa";
import {
  Chart,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
import { Tabs, Table } from "antd";
import { Line, Doughnut, PolarArea, Bar } from "react-chartjs-2";
import { get } from "../../utils/axios-http/axios-http";
import { useNavigate } from "react-router-dom";

Chart.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    tours: {},
    categories: {},
    departures: {},
    destinations: {},
    transportations: {},
    orders: {},
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const tourResponse = await get("statistics/tours");
      const categoryResponse = await get("statistics/categories");
      const departureResponse = await get("statistics/departures");
      const destinationResponse = await get("statistics/destinations");
      const transportationResponse = await get("statistics/transportations");
      const orderResponse = await get("statistics/orders");

      setDashboardData({
        tours: tourResponse,
        categories: categoryResponse,
        departures: departureResponse,
        destinations: destinationResponse,
        transportations: transportationResponse,
        orders: orderResponse,
      });
    };
    fetchDashboardData();
  }, []);

  const mostToursColumns = [
    {
      title: "Ảnh",
      dataIndex: "source",
      key: "source",
      render: (source) => (
        <img src={source} alt="tour" style={{ width: 70, height: 70 }} />
      ),
    },
    {
      title: "Tên Tour",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Mã Tour",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Giá",
      dataIndex: "adultPrice",
      key: "adultPrice",
      render: (text) => text.toLocaleString() + " VND",
    },
    {
      title: "Số lượng",
      dataIndex: "count",
      key: "count",
    },
  ];

  const cancellationRateData = {
    labels:
      dashboardData.orders?.cancellationRate
        ?.map((item) => `Tháng ${item.month}/${item.year}`)
        .reverse() || [],
    datasets: [
      {
        label: "Tỷ lệ hủy",
        data:
          dashboardData.orders?.cancellationRate
            ?.map((item) => parseFloat(item.cancelRate))
            .reverse() || [],
        backgroundColor: [
          "#FF5733",
          "#FFCA28", // February
          "#36A2EB", // March
          "#4CAF50", // April
          "#FF7043", // May
          "#9C27B0", // June
          "#00BCD4", // July
          "#8BC34A", // August
          "#FFC107", // September
          "#3F51B5", // October
          "#E91E63", // November
          "#9E9E9E",
        ],
        borderColor: [
          "#FF5733", // January
          "#FFCA28", // February
          "#36A2EB", // March
          "#4CAF50", // April
          "#FF7043", // May
          "#9C27B0", // June
          "#00BCD4", // July
          "#8BC34A", // August
          "#FFC107", // September
          "#3F51B5", // October
          "#E91E63", // November
          "#9E9E9E",
        ],
        borderWidth: 1,
      },
    ],
  };
  const orderStatsData = {
    labels:
      dashboardData.orders.revenueByMonth
        ?.map((item) => `Tháng ${item.month}/${item.year}`)
        .reverse() || [],

    datasets: [
      {
        label: "Doanh thu",
        data:
          dashboardData.orders.revenueByMonth
            ?.map((item) => parseFloat(item.revenue))
            .reverse() || [],
        fill: false,
        borderColor: "#42A5F5",
        pointBackgroundColor: "#42A5F5",
        tension: 0.1,
      },
    ],
  };
  const revenueByMonthData = {
    labels:
      dashboardData.orders.revenueByMonth
        ?.map((item) => `Tháng ${item.month}/${item.year}`)
        .reverse() || [],
    datasets: [
      {
        label: "Số lượng đơn hàng",
        data:
          dashboardData.orders.revenueByMonth?.map(
            (item) => item.orderCount || 0
          ) || [],
        fill: false,
        borderColor: "#42A5F5",
        pointBackgroundColor: "#42A5F5",
        tension: 1,
      },
    ],
  };
  console.log(dashboardData);
  const orderStatusData = {
    labels: ["Đang chờ", "Đã xác nhận", "Đã hủy"],
    datasets: [
      {
        data: [
          dashboardData.orders?.pendingOrders,
          dashboardData.orders?.confirmedOrders,
          dashboardData.orders?.canceledOrders,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCD56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCD56"],
      },
    ],
  };
  const paymentMethodRevenueData = {
    labels:
      dashboardData.orders?.revenueByPaymentMethod?.map(
        (item) => item.paymentMethod
      ) || [],
    datasets: [
      {
        data:
          dashboardData.orders?.revenueByPaymentMethod?.map((item) =>
            parseFloat(item.revenue)
          ) || [],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCD56", "#66BB6A"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCD56", "#66BB6A"],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <div className="overview-cards">
        {/* Card for Tours */}
        <div className="card">
          <div className="card-header">
            <FaTag size={30} />
            <h3>Tours</h3>
          </div>
          <div className="card-footer">
            <span>Hoạt động: {dashboardData.tours.activeTours}</span>
            <span>Không hoạt động: {dashboardData.tours.inactiveTours}</span>
          </div>
        </div>

        {/* Card for Categories */}
        <div className="card">
          <div className="card-header">
            <FaRegFolder size={30} />
            <h3>Danh mục</h3>
          </div>
          <div className="card-footer">
            <span>Hoạt động: {dashboardData.categories.activeCategories}</span>
            <span>
              Không hoạt động: {dashboardData.categories.inactiveCategories}
            </span>
          </div>
        </div>

        {/* Card for Departures */}
        <div className="card">
          <div className="card-header">
            <FaPlane size={30} />
            <h3>Điểm khởi hành</h3>
          </div>
          <div className="card-footer">
            <span>Hoạt động: {dashboardData.departures.activeDepartures}</span>
            <span>
              Không hoạt động: {dashboardData.departures.inactiveDepartures}
            </span>
          </div>
        </div>

        {/* Card for Destinations */}
        <div className="card">
          <div className="card-header">
            <FaCar size={30} />
            <h3>Điểm đến</h3>
          </div>
          <div className="card-footer">
            <span>
              Hoạt động: {dashboardData.destinations.activeDestinations}
            </span>
            <span>
              Không hoạt động: {dashboardData.destinations.inactiveDestinations}
            </span>
          </div>
        </div>

        {/* Card for Transportations */}
        <div className="card">
          <div className="card-header">
            <FaBus size={30} />
            <h3>Phương tiện</h3>
          </div>
          <div className="card-footer">
            <span>
              Hoạt động: {dashboardData.transportations.activeTransportations}
            </span>
            <span>
              Không hoạt động:{" "}
              {dashboardData.transportations.inactiveTransportations}
            </span>
          </div>
        </div>
      </div>
      <div className="chart-container">
        <div className="order-chart-line">
          <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
            <Tabs.TabPane tab="Doanh thu" key="1">
              <Line data={orderStatsData} options={{ responsive: true }} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Tổng đơn hàng" key="2">
              <Bar data={revenueByMonthData} options={{ responsive: true }} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Tỉ lệ hủy đơn" key="3">
              <Bar data={cancellationRateData} options={{ responsive: true }} />
            </Tabs.TabPane>
          </Tabs>
        </div>

        <div className="order-chart-doughnut">
          <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
            <Tabs.TabPane tab="Đơn hàng" key="1">
              <Doughnut className="doughnut" data={orderStatusData} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Doanh thu theo phương thức thanh toán" key="2">
              <PolarArea
                data={paymentMethodRevenueData}
                options={{ responsive: true }}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
      <div className="list-tour">
        <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
          <Tabs.TabPane tab="Tour được đặt nhiều nhất" key="1">
            <Table
              columns={mostToursColumns}
              dataSource={dashboardData.tours.mostBookedTour}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => navigate(`/tour-detail/${record.id}`),
              })}
              style={{ cursor: "pointer" }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Tour được yêu thích nhiều nhất" key="2">
            <Table
              columns={mostToursColumns}
              dataSource={dashboardData.tours.mostFavoritedTour}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => navigate(`/tour-detail/${record.id}`),
              })}
              style={{ cursor: "pointer" }}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Tour bị hủy nhiều nhất" key="3">
            <Table
              columns={mostToursColumns}
              dataSource={dashboardData.tours.mostCancelledTour}
              rowKey="id"
              pagination={false}
              onRow={(record) => ({
                onClick: () => navigate(`/tour-detail/${record.id}`),
              })}
              style={{ cursor: "pointer" }}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default Dashboard;
