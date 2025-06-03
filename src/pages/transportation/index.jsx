import React, { useEffect, useState } from "react";
import {
  get,
  post,
  patch,
  deleteMethod,
} from "../../utils/axios-http/axios-http";
import { useSelector } from "react-redux";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
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

function Transportation() {
  const [transportations, setTransportations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [transportationId, setTransportationId] = useState(null);
  const [form] = Form.useForm();

  const permissions = useSelector((state) => state.admin.permissions || []);
  const canCreate = permissions.includes("CREATE_TRANSPORTATION");
  const canUpdate = permissions.includes("UPDATE_TRANSPORTATION");
  const canDelete = permissions.includes("DELETE_TRANSPORTATION");

  const fetchApi = async () => {
    setLoading(true);
    try {
      const response = await get("transportations");
      setTransportations(response.data);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Lỗi khi lấy danh sách phương tiện"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const handleChangeStatus = async (id, inActive) => {
    if (!canUpdate) {
      message.error("Bạn không có quyền cập nhật trạng thái");
      return;
    }
    setLoading(true);
    try {
      await patch(`transportations/${id}/status`, { inActive: !inActive });
      message.success("Cập nhật trạng thái phương tiện thành công");
      await fetchApi();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Cập nhật trạng thái phương tiện thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transportation) => {
    setTransportationId(transportation.id);
    form.setFieldsValue({
      name: transportation.name,
      type: transportation.type,
      brand: transportation.brand,
      description: transportation.description,
    });
    setIsModalEditOpen(true);
  };

  const handleDelete = async (transportation) => {
    setLoading(true);
    try {
      await deleteMethod(`transportations/${transportation.id}`);
      message.success("Xóa phương tiện thành công");
      await fetchApi();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Xóa phương tiện thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      await patch(`transportations/${transportationId}`, values);
      message.success("Cập nhật thông tin thành công");
      await fetchApi();
      form.resetFields();
      setIsModalEditOpen(false);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Cập nhật thông tin thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values) => {
    setLoading(true);
    try {
      await post("transportations", values);
      message.success("Tạo mới phương tiện thành công");
      await fetchApi();
      form.resetFields();
      setIsModalCreateOpen(false);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Tạo mới phương tiện thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên",
      dataIndex: "name",
    },
    {
      title: "Loại",
      dataIndex: "type",
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
    },
    {
      title: "Trạng thái",
      dataIndex: "inActive",
      render: (inActive, record) => (
        <Tag
          color={inActive ? "green" : "red"}
          onClick={canUpdate ? () => handleChangeStatus(record.id, inActive) : null}
          style={{ cursor: canUpdate ? "pointer" : "not-allowed" }}
        >
          {inActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Tạo bởi",
      dataIndex: "createdBy",
    },
    {
      title: "Cập nhật bởi",
      dataIndex: "modifiedBy",
    },
    {
      title: "Hành động",
      render: (_, transportation) => (
        <Space>
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(transportation)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn xóa phương tiện này chứ?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => handleDelete(transportation)}
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const data = transportations.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    brand: t.brand,
    description: t.description,
    inActive: t.inActive,
    createdBy: t.createdBy,
    modifiedBy: t.modifiedBy,
  }));

  return (
    <div className="layout-container">
      {canCreate && (
        <Button type="primary" onClick={() => setIsModalCreateOpen(true)}>
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

      <Modal
        title="Cập nhật phương tiện"
        open={isModalEditOpen}
        onOk={form.submit}
        onCancel={() => {
          setIsModalEditOpen(false);
          form.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên phương tiện" />
          </Form.Item>
          <Form.Item
            label="Loại"
            name="type"
            rules={[{ required: true, message: "Vui lòng nhập loại" }]}
          >
            <Input placeholder="Nhập loại phương tiện" />
          </Form.Item>
          <Form.Item
            label="Thương hiệu"
            name="brand"
            rules={[{ required: true, message: "Vui lòng nhập thương hiệu" }]}
          >
            <Input placeholder="Nhập thương hiệu" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea placeholder="Nhập mô tả phương tiện" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Thêm mới phương tiện"
        open={isModalCreateOpen}
        onOk={form.submit}
        onCancel={() => {
          setIsModalCreateOpen(false);
          form.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên phương tiện" />
          </Form.Item>
          <Form.Item
            label="Loại"
            name="type"
            rules={[{ required: true, message: "Vui lòng nhập loại" }]}
          >
            <Input placeholder="Nhập loại phương tiện" />
          </Form.Item>
          <Form.Item
            label="Thương hiệu"
            name="brand"
            rules={[{ required: true, message: "Vui lòng nhập thương hiệu" }]}
          >
            <Input placeholder="Nhập thương hiệu" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea placeholder="Nhập mô tả phương tiện" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Transportation;