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
        const orderDetailResponse = await get(`bookings/${orderId}`);
        const tour = await get(
          `tours/${orderDetailResponse.data.tourId}/details`,
        );
        setOrderDetail(orderDetailResponse.data);
        setTourData(tour.data);
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
            <Text strong>Họ và tên:</Text> {orderDetail?.fullName}
          </Col>
          <Col span={12}>
            <Text strong>Email:</Text> {orderDetail?.email}
          </Col>
          <Col span={12}>
            <Text strong>Số điện thoại:</Text> {orderDetail?.phoneNumber}
          </Col>
          <Col span={12}>
            <Text strong>Địa chỉ:</Text> {orderDetail?.address}
          </Col>
          <Col span={12}>
            <Text strong>Trạng thái:</Text>{" "}
            <Tag
              color={
                orderDetail?.bookingStatus === "pending" ? "orange" : "green"
              }
            >
              {orderDetail?.bookingStatus.toUpperCase()}
            </Tag>
          </Col>
          <Col span={12}>
            <Text strong>Ngày đặt:</Text>{" "}
            {orderDetail?.confirmedAt
              ? new Date(orderDetail?.confirmedAt).toLocaleString()
              : "Chưa có ngày"}
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Thông tin thanh toán */}
      <Card title={<Title level={4}>Thông tin thanh toán</Title>} hoverable>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Mã giao dịch:</Text> {orderDetail?.transactionId}
          </Col>
          {/* <Col span={12}> */}
          {/* <Text strong>Phương thức thanh toán:</Text>{" "} */}
          {/* {orderDetail?.paymentMethod} */}
          {/* </Col> */}
          <Col span={12}>
            <Text strong>Số tiền:</Text>{" "}
            {orderDetail?.totalAmount?.toLocaleString()} VND
          </Col>
          <Col span={12}>
            <Text strong>Trạng thái thanh toán:</Text>{" "}
            <Tag
              color={
                orderDetail?.paymentStatus === "pending" ? "orange" : "green"
              }
            >
              {orderDetail?.paymentStatus.toUpperCase()}
            </Tag>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Thông tin đơn hàng */}
      <Card title={<Title level={4}>Thông tin đơn hàng</Title>} hoverable>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Mã đơn hàng:</Text> {orderDetail?.id}
          </Col>
          <Col span={12}>
            <Text strong>Số lượng người lớn:</Text> {orderDetail?.adultCount}
          </Col>
          <Col span={12}>
            <Text strong>Giá người lớn:</Text>{" "}
            {orderDetail?.adultPrice?.toLocaleString()} VND
          </Col>
          <Col span={12}>
            <Text strong>Số lượng trẻ em:</Text> {orderDetail?.childrenCount}
          </Col>
          <Col span={12}>
            <Text strong>Giá trẻ em:</Text>{" "}
            {orderDetail?.childrenPrice?.toLocaleString()} VND
          </Col>
          <Col span={12}>
            <Text strong>Số lượng trẻ nhỏ:</Text> {orderDetail?.childCount}
          </Col>
          <Col span={12}>
            <Text strong>Giá trẻ nhỏ:</Text>{" "}
            {orderDetail?.childPrice?.toLocaleString()} VND
          </Col>
          <Col span={12}>
            <Text strong>Số lượng em bé:</Text> {orderDetail?.babyCount}
          </Col>
          <Col span={12}>
            <Text strong>Giá em bé:</Text>{" "}
            {orderDetail?.babyPrice?.toLocaleString()} VND
          </Col>
          <Col span={24}>
            <Text strong>Ghi chú:</Text> {orderDetail?.note}
          </Col>
        </Row>
      </Card>
      <Divider />

      {orderDetail.bookingStatus === "CANCELLED" && (
        <>
          <Card title={<Title level={4}>Thông tin hủy đơn</Title>} hoverable>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Người hủy:</Text> {orderDetail?.cancelledBy}
              </Col>
              <Col span={12}>
                <Text strong>Lí do hủy:</Text> {orderDetail?.cancellationReason}
              </Col>
              <Col span={12}>
                <Text strong>Thời gian hủy:</Text>{" "}
                {orderDetail?.cancelledAt
                  ? new Date(orderDetail?.cancelledAt).toLocaleString()
                  : "Chưa có ngày"}
              </Col>
              <Col span={12}>
                <Text strong>Trạng thái hoàn tiền:</Text>{" "}
                <Tag
                  color={
                    tourData?.refundStatus === "COMPLETED"
                      ? "green"
                      : tourData?.refundStatus === "PENDING"
                        ? "orange"
                        : tourData?.refundStatus === "FAILED"
                          ? "red"
                          : "yellow"
                  }
                >
                  {tourData?.refundStatus === "COMPLETED"
                    ? "Đã hoàn tiền"
                    : tourData?.refundStatus === "PENDING"
                      ? "Đang xử lý"
                      : tourData?.refundStatus === "FAILED"
                        ? "Thất bại"
                        : "Không áp dụng"}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Tỷ lệ hoàn tiền:</Text>{" "}
                {orderDetail?.refundPercent}
              </Col>
              <Col span={12}>
                <Text strong>Số tiền hoàn trả:</Text>{" "}
                {orderDetail?.refundAmount.toLocaleString()} VND
              </Col>
            </Row>
          </Card>
          <Divider />
        </>
      )}

      {/* Thông tin tour */}
      <Card title={<Title level={4}>Thông tin tour</Title>} hoverable>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Text strong>Tên tour:</Text> {tourData?.title}
            <br />
            <Text strong>Danh mục tour:</Text> {tourData?.category}
            <br />
            <Text strong>Điểm khởi hành:</Text> {tourData?.departure}
            <br />
            <Text strong>Điểm đến:</Text> {tourData?.destination}
            <br />
            <Text strong>Trạng thái:</Text>{" "}
            <Tag color={tourData?.inActive ? "green" : "red"}>
              {tourData?.inActive ? "Đang hoạt động" : "Ngừng hoạt động"}
            </Tag>
          </Col>
          <Col span={12}>
            <img
              src={tourData?.images[0].imageUrl}
              alt="Tour Image"
              style={{ width: 100, height: 100 }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default OrderDetail;
