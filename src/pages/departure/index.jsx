import React, { useEffect, useState } from "react";
import {
  get,
  post,
  patch,
  deleteMethod,
} from "../../utils/axios-http/axios-http"; // Make sure deleteMethod is not used here
import {
  Space,
  Table,
  Modal,
  message,
  Button,
  Form,
  Input,
  Tag,
  Popconfirm,
} from "antd";
import { useSelector } from "react-redux";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

function Departure() {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  // Thay đổi ở đây: 3 state mới
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");

  const [departureId, setDepartureId] = useState(null);
  const [form] = Form.useForm();

  // Lấy quyền từ Redux Store
  const permissions = useSelector((state) => state.admin.permissions);

  // Kiểm tra quyền
  const canCreate = permissions.includes("CREATE_DEPARTURE");
  const canUpdate = permissions.includes("UPDATE_DEPARTURE");
  const canDelete = permissions.includes("DELETE_DEPARTURE");

  const handleOk = async () => {
    setLoading(true);
    try {
      await patch(`departures/${departureId}`, {
        name,
        code,
        address,
        departureId,
      });
      message.success("Cập nhật thông tin thành công");
      fetchApi();
      setIsModalEditOpen(false);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Cập nhật thông tin thất bại");
      }
    }
    setLoading(false);
  };

  const fetchApi = async () => {
    try {
      const departures = await get("departures");
      setDepartures(departures.data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching departures:", error);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (text, record, index) => <a>{index + 1}</a>,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Trạng thái",
      dataIndex: "inActive",
      key: "inActive",
      render: (inActive, record) => (
        <Tag
          color={inActive === 1 ? "green" : "red"}
          onClick={() => handleChangeStatus(record.id, inActive)}
          className="button-change-status"
        >
          {inActive === 1 ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Tạo bởi",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Cập nhật bởi",
      dataIndex: "updatedBy",
      key: "updatedBy",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, departure) => (
        <Space size="middle">
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(departure)}
              default
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn xóa tour này chứ ?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => handleDelete(departure)}
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const data = departures.map((departure) => {
    return {
      id: departure.id,
      name: departure.name,
      code: departure.code,
      address: departure.address,
      inActive: departure.inActive ? 1 : 0,
      createdBy: departure.createdBy,
      updatedBy: departure.updatedBy,
    };
  });
  console.log(departures);

  const handleChangeStatus = async (departureId, inActive) => {
    if (!canUpdate) {
      message.error("Bạn không có quyền cập nhật trạng thái");
      return;
    }
    setLoading(true);
    try {
      await patch(`departures/${departureId}/status`, { inActive: !inActive });
      message.success("Cập nhật trạng thái thành công");
      fetchApi();
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    }
    setLoading(false);
  };

  const handleEdit = (departure) => {
    setName(departure.name);
    setCode(departure.code);
    setAddress(departure.address);
    setDepartureId(departure.id);
    form.setFieldsValue({
      name: departure.name,
      code: departure.code,
      address: departure.address,
    });
    setIsModalEditOpen(true);
  };

  const handleDelete = async (departure) => {
    setLoading(true);
    try {
      await deleteMethod(`departures/${departure.id}`, {});
      setLoading(false);
      message.success("Xóa điểm khởi hành thành công");
      fetchApi();
    } catch (error) {
      setLoading(false);
      message.error("Xóa điểm khởi hành thất bại");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      await post("departures", values);
      message.success("Tạo mới điểm khởi hành thành công");
      fetchApi();
      setIsModalCreateOpen(false);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Tạo mới điểm khởi hành thất bại");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <div className="layout-container">
        {canCreate && (
          <Button
            type="primary"
            onClick={() => {
              form.resetFields();
              setIsModalCreateOpen(true);
              setName("");
              setCode("");
              setAddress("");
              setDepartureId(null);
            }}
          >
            Thêm mới
          </Button>
        )}
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          className="table-container"
        />
        {/* Edit Modal */}
        <Modal
          title="Cập nhật thông tin"
          open={isModalEditOpen}
          onOk={handleOk}
          onCancel={() => {
            setIsModalEditOpen(false);
            form.resetFields();
            setName("");
            setCode("");
            setAddress("");
            setDepartureId(null);
          }}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical" onFinish={handleOk}>
            <Form.Item
              label="Tên"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Mã"
              name="code"
              rules={[{ required: true, message: "Vui lòng nhập mã" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input />
            </Form.Item>
          </Form>
        </Modal>
        {/* Create Modal */}
        <Modal
          title="Thêm mới điểm khởi hành"
          open={isModalCreateOpen}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalCreateOpen(false);
            form.resetFields();
          }}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Tên"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="Nhập tên điểm khởi hành" />
            </Form.Item>
            <Form.Item
              label="Mã"
              name="code"
              rules={[{ required: true, message: "Vui lòng nhập mã" }]}
            >
              <Input placeholder="Nhập mã điểm khởi hành" />
            </Form.Item>
            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
            >
              <Input placeholder="Nhập địa chỉ điểm khởi hành" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Departure;
