import React, { useEffect, useState } from "react";
import "./style.scss";
import { Table, Tag, Select, Space, Button } from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import { get } from "../../utils/axios-http/axios-http";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Order() {
  const [orderData, setOrderData] = useState();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const permissions = useSelector((state) => state.admin.permissions);

  const canUpdate = permissions?.includes("UPDATE_ORDER");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await get(`bookings`);
        setOrderData(response?.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchOrder, 300);
    return () => clearTimeout(debounceFetch);
  }, [status]);

  // const columns = [
  //   {
  //     title: "STT",
  //     key: "index",
  //     render: (text, record, index) => <a>{index + 1}</a>,
  //   },
  //   {
  //     title: "Mã đơn hàng",
  //     dataIndex: "code",
  //     key: "code",
  //   },
  //   {
  //     title: "Khách hàng",
  //     dataIndex: "fullName",
  //     key: "fullName",
  //   },
  //   {
  //     title: "Email",
  //     dataIndex: "email",
  //     key: "email",
  //   },
  //   {
  //     title: "Số điện thoại",
  //     dataIndex: "phoneNumber",
  //     key: "phoneNumber",
  //   },
  //   {
  //     title: "Địa chỉ",
  //     dataIndex: "address",
  //     key: "address",
  //   },
  //   {
  //     title: "Trạng thái",
  //     dataIndex: "status",
  //     key: "status",
  //     render: (status) => {
  //       let color = "";
  //       switch (status) {
  //         case "confirmed":
  //           color = "green";
  //           break;
  //         case "cancelled":
  //           color = "red";
  //           break;
  //         default:
  //           color = "orange";
  //           break;
  //       }
  //       return <Tag color={color}>{status.toUpperCase()}</Tag>;
  //     },
  //   },
  //   {
  //     title: "Tổng tiền",
  //     dataIndex: "amount",
  //     key: "amount",
  //     render: (amount) => amount.toLocaleString(),
  //   },
  //   {
  //     title: "Phương thức",
  //     dataIndex: "paymentMethod",
  //     key: "paymentMethod",
  //     render: (amount) => amount.toLocaleString(),
  //   },
  //   {
  //     title: "Thanh toán",
  //     dataIndex: "transactionStatus",
  //     key: "transactionStatus",
  //     render: (status) => {
  //       let color = "";
  //       switch (status) {
  //         case "completed":
  //           color = "green";
  //           break;
  //         case "failed":
  //           color = "red";
  //           break;
  //         default:
  //           color = "orange";
  //           break;
  //       }
  //       return <Tag color={color}>{status.toUpperCase()}</Tag>;
  //     },
  //   },
  //   {
  //     title: "Ngày đặt",
  //     dataIndex: "createdAt",
  //     key: "createdAt",
  //     render: (createdAt) => new Date(createdAt).toLocaleString(),
  //   },
  //   {
  //     title: "Hành động",
  //     key: "action",
  //     render: (_, record) => (
  //       <Space size="middle">
  //         <Button
  //           onClick={() => {
  //             navigate(`/orders/detail/${record.id}`);
  //           }}
  //           type="primary"
  //           icon={<EyeOutlined />}
  //           style={{ marginRight: 1 }}
  //         ></Button>

  //         {canUpdate && (
  //           <Button
  //             onClick={() => {
  //               navigate(`/orders/edit/${record.id}`);
  //             }}
  //             type="default"
  //             icon={<EditOutlined />}
  //             style={{ marginLeft: 1 }}
  //           />
  //         )}
  //       </Space>
  //     ),
  //   },
  // ];

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => <a>{index + 1}</a>,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value) => value.toLocaleString(),
    },
    {
      title: "Trạng thái đặt",
      dataIndex: "bookingStatus",
      key: "bookingStatus",
      render: (status) => {
        let color = "";
        switch (status) {
          case "CONFIRMED":
            color = "green";
            break;
          case "CANCELLED":
            color = "red";
            break;
          case "COMPLETED":
            color = "blue";
            break;
          default:
            color = "orange";
            break;
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (status) => {
        let color = "";
        switch (status) {
          case "PAID":
            color = "green";
            break;
          case "FAILED":
            color = "red";
            break;
          case "REFUNDED":
            color = "purple";
            break;
          default:
            color = "orange";
            break;
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Ngày xác nhận",
      dataIndex: "confirmedAt",
      key: "confirmedAt",
      render: (date) => (date ? new Date(date).toLocaleString() : "-"),
    },
    {
      title: "Ngày hủy",
      dataIndex: "cancelledAt",
      key: "cancelledAt",
      render: (date) => (date ? new Date(date).toLocaleString() : "-"),
    },
    {
      title: "Lý do hủy",
      dataIndex: "cancellationReason",
      key: "cancellationReason",
      ellipsis: true,
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => (date ? new Date(date).toLocaleString() : "-"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => {
              navigate(`/orders/detail/${record.id}`);
            }}
            type="primary"
            icon={<EyeOutlined />}
            style={{ marginRight: 1 }}
          />
          {canUpdate && (
            <Button
              onClick={() => {
                navigate(`/orders/edit/${record.id}`);
              }}
              type="default"
              icon={<EditOutlined />}
              style={{ marginLeft: 1 }}
            />
          )}
        </Space>
      ),
    },
  ];

  const options = [
    {
      value: "pending",
      label: "Pending",
    },
    {
      value: "confirmed",
      label: "Confirmed",
    },
    {
      value: "cancelled",
      label: "Cancelled",
    },
  ];

  return (
    <div className="layout-container">
      {/* <Select
        defaultValue={status}
        style={{
          width: 120,
        }}
        onChange={(value) => {
          setStatus(value);
        }}
        options={options}
      /> */}

      <Table
        dataSource={orderData || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 12 }}
        className="table-container"
        style={{ cursor: "pointer" }}
      />
    </div>
  );
}

export default Order;
