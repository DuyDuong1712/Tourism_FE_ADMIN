import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Tag,
  Divider,
  Button,
  Input,
  Form,
  message,
  Select,
} from "antd";
import { get, patch } from "../../utils/axios-http/axios-http";
import { useParams, useNavigate } from "react-router-dom";

function OrderEdit() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetail, setOrderDetail] = useState();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderDetailResponse = await get(`orders/order-item/${orderId}`);
      setStatus(orderDetailResponse?.order?.status);
      setOrderDetail(orderDetailResponse);
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const order = orderDetail?.order;
  const orderItem = orderDetail?.orderItem;

  const handleSubmit = async (values) => {
    try {
      values.orderId = order.id;
      values.orderItemId = orderItem.id;

      await patch(`orders/edit`, values);

      message.success("Cập nhật đơn hàng thành công!");
      navigate(`/orders`);
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật đơn hàng.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Button
        type="primary"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20 }}
      >
        Quay lại
      </Button>

      <Divider />

      <Form
        initialValues={{
          fullName: order?.fullName,
          email: order?.email,
          phoneNumber: order?.phoneNumber,
          address: order?.address,
          note: orderItem?.note,
          status: status,
          adultPrice: orderItem?.adultPrice,
          adultQuantity: orderItem?.adultQuantity,
          childrenPrice: orderItem?.childrenPrice,
          childrenQuantity: orderItem?.childrenQuantity,
          childPrice: orderItem?.childPrice,
          childQuantity: orderItem?.childQuantity,
          babyPrice: orderItem?.babyPrice,
          babyQuantity: orderItem?.babyQuantity,
          singleRoomSupplementPrice: orderItem?.singleRoomSupplementPrice,
          singleRoomSupplementQuantity: orderItem?.singleRoomSupplementQuantity,
        }}
        onFinish={handleSubmit}
        layout="vertical"
      >
        <Card title="Thông tin người đặt hàng">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Vui lòng nhập email!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Địa chỉ" name="address">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Ghi chú" name="note">
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Trạng thái" name="status">
                <Select
                  style={{ width: 120 }}
                  // onChange={handleChange}
                  options={[
                    { value: "pending", label: "Pending" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "cancelled", label: "Cancelled" },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider />

        <Card title="Thông tin đơn hàng">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giá người lớn" name="adultPrice">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số lượng người lớn" name="adultQuantity">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá trẻ em" name="childrenPrice">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số lượng trẻ em" name="childrenQuantity">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá trẻ nhỏ" name="childPrice">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá trẻ nhỏ" name="childQuantity">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá em bé" name="babyPrice">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số lượng em bé" name="babyQuantity">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá phòng đơn" name="singleRoomSupplementPrice">
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Số lượng phòng đơn"
                name="singleRoomSupplementQuantity"
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Divider />

        <Button type="primary" htmlType="submit">
          Cập nhật đơn hàng
        </Button>
      </Form>
    </div>
  );
}

export default OrderEdit;
