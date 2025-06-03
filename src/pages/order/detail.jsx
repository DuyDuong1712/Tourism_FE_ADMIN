import React, { useState, useEffect } from "react";
import { Card, Row, Col, Tag, Divider, Button, Typography, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { get } from "../../utils/axios-http/axios-http";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetail, setOrderDetail] = useState();
  const [tourData, setTourData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderDetailResponse = await get(`orders/order-item/${orderId}`);
        const tour = await get(
          `tour_detail/${orderDetailResponse.orderItem.tourDetailId}/getTour`
        );
        setOrderDetail(orderDetailResponse);
        setTourData(tour);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  const order = orderDetail?.order;
  const transaction = orderDetail?.transaction;
  const orderItem = orderDetail?.orderItem;

  return (
    <div style={{ padding: "20px" }}>
      <Button
        type="primary"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
      >
        Quay lại
      </Button>
      <Divider />

      {/* Thông tin người đặt hàng */}
      <Card title={<Title level={4}>Thông tin người đặt hàng</Title>} hoverable>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Họ và tên:</Text> {order?.fullName}
          </Col>
          <Col span={12}>
            <Text strong>Email:</Text> {order?.email}
          </Col>
          <Col span={12}>
            <Text strong>Số điện thoại:</Text> {order?.phoneNumber}
          </Col>
          <Col span={12}>
            <Text strong>Địa chỉ:</Text> {order?.address}
          </Col>
          <Col span={12}>
            <Text strong>Trạng thái:</Text>{" "}
            <Tag color={order?.status === "pending" ? "orange" : "green"}>
              {order?.status.toUpperCase()}
            </Tag>
          </Col>
          <Col span={12}>
            <Text strong>Ngày đặt:</Text>{" "}
            {order?.createdAt
              ? new Date(order?.createdAt).toLocaleString()
              : "Chưa có ngày"}
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Thông tin thanh toán */}
      <Card title={<Title level={4}>Thông tin thanh toán</Title>} hoverable>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Mã giao dịch:</Text> {transaction?.code}
          </Col>
          <Col span={12}>
            <Text strong>Phương thức thanh toán:</Text>{" "}
            {transaction?.paymentMethod}
          </Col>
          <Col span={12}>
            <Text strong>Số tiền:</Text> {transaction?.amount?.toLocaleString()}{" "}
            VND
          </Col>
          <Col span={12}>
            <Text strong>Trạng thái thanh toán:</Text>{" "}
            <Tag color={transaction?.status === "pending" ? "orange" : "green"}>
              {transaction?.status.toUpperCase()}
            </Tag>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Thông tin đơn hàng */}
      <Card title={<Title level={4}>Thông tin đơn hàng</Title>} hoverable>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Mã đơn hàng:</Text> {order?.code}
          </Col>
          <Col span={12}>
            <Text strong>Số lượng người lớn:</Text> {orderItem?.adultQuantity}
          </Col>
          <Col span={12}>
            <Text strong>Giá người lớn:</Text>{" "}
            {orderItem?.adultPrice?.toLocaleString()} VND
          </Col>
          <Col span={12}>
            <Text strong>Số lượng trẻ em:</Text> {orderItem?.childrenQuantity}
          </Col>
          <Col span={12}>
            <Text strong>Giá trẻ em:</Text>{" "}
            {orderItem?.childrenPrice?.toLocaleString()} VND
          </Col>
          <Col span={12}>
            <Text strong>Số lượng trẻ nhỏ:</Text> {orderItem?.childQuantity}
          </Col>
          <Col span={12}>
            <Text strong>Giá trẻ em:</Text>{" "}
            {orderItem?.childPrice?.toLocaleString()} VND
          </Col>
          <Col span={12}>
            <Text strong>Số lượng em bé:</Text> {orderItem?.babyQuantity}
          </Col>
          <Col span={12}>
            <Text strong>Giá em bé:</Text>{" "}
            {orderItem?.babyPrice?.toLocaleString()} VND
          </Col>
          <Col span={24}>
            <Text strong>Ghi chú:</Text> {orderItem?.note}
          </Col>
        </Row>
      </Card>
      <Divider />

      {/* Thông tin tour */}
      <Card title={<Title level={4}>Thông tin tour</Title>} hoverable>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Tên tour:</Text> {tourData?.tour.title}
            <br />
            <Text strong>Mã tour:</Text> {tourData?.tour.code}
            <br />
            <Text strong>Trạng thái:</Text>{" "}
            <Tag color={tourData?.tour.status ? "green" : "red"}>
              {tourData?.tour.status ? "Đang hoạt động" : "Ngừng hoạt động"}
            </Tag>
          </Col>
          <Col span={12}>
            <img
              src={tourData?.image?.source}
              alt="Tour Image"
              style={{ width: "100%", borderRadius: "8px" }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default OrderDetail;
