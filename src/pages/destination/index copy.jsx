/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  get,
  postForm,
  patchForm,
  patch,
  deleteMethod,
} from "../../utils/axios-http/axios-http";
import {
  Space,
  Table,
  Modal,
  message,
  Button,
  Form,
  Input,
  Tag,
  Upload,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";

const Destination1 = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [image, setImage] = useState(null);
  const [destinationId, setDestinationId] = useState(null);
  const [form] = Form.useForm();

  const permissions = useSelector((state) => state.admin.permissions);
  const canCreate = permissions.includes("CREATE_DESTINATION");
  const canUpdate = permissions.includes("UPDATE_DESTINATION");
  const canDelete = permissions.includes("DELETE_DESTINATION");

  const fetchApi = async () => {
    setLoading(true);
    try {
      const response = await get("destinations");
      if (response.data) {
        setDestinations(response.data);
      } else {
        message.error("Không thể lấy dữ liệu địa điểm");
      }
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu địa điểm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("code", values.code || "");
      formData.append("description", values.description || "");
      if (image) formData.append("image", image);

      await postForm("destinations", formData);
      message.success("Tạo mới địa điểm thành công");
      fetchApi();
      setIsModalCreateOpen(false);
      form.resetFields();
      setImage(null);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Tạo mới địa điểm thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("code", values.code || "");
      formData.append("description", values.description || "");
      if (image) formData.append("image", image);
      formData.append("id", destinationId);

      await patchForm(`destinations/${destinationId}`, formData);
      message.success("Cập nhật thông tin thành công");
      fetchApi();
      setIsModalEditOpen(false);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Cập nhật thông tin thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (destinationId, inActive) => {
    setLoading(true);
    try {
      await patch(`destinations/${destinationId}/status`, {
        inActive: !inActive,
      });
      message.success("Cập nhật trạng thái địa điểm thành công");
      fetchApi();
    } catch (error) {
      message.error("Cập nhật trạng thái địa điểm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (destination) => {
    form.setFieldsValue({
      name: destination.name,
      code: destination.code,
      description: destination.description,
      image: null,
    });
    setDestinationId(destination.id);
    setIsModalEditOpen(true);
  };

  const handleDelete = async (destination) => {
    setLoading(true);
    try {
      await deleteMethod(`destinations/${destination.id}`, {});
      message.success("Xóa địa điểm thành công");
      fetchApi();
    } catch (error) {
      message.error("Xóa địa điểm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <img src={image} alt="destination" style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "inActive",
      key: "inActive",
      render: (inActive, record) => (
        <Tag
          color={!inActive ? "green" : "red"}
          onClick={() => canUpdate && handleChangeStatus(record.id, inActive)}
          style={{ cursor: "pointer" }}
        >
          {!inActive ? "Hoạt động" : "Không hoạt động"}
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
      render: (_, destination) => (
        <Space size="middle">
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(destination)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn xóa địa điểm này chứ?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => handleDelete(destination)}
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="layout-container">
      {canCreate && (
        <Button
          type="primary"
          style={{ marginBottom: 20 }}
          onClick={() => {
            setIsModalCreateOpen(true);
            form.resetFields();
            setImage(null);
          }}
        >
          Thêm mới
        </Button>
      )}

      <Table
        columns={columns}
        dataSource={destinations}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />

      {/* Modal tạo mới */}
      <Modal
        title="Thêm mới địa điểm"
        open={isModalCreateOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalCreateOpen(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên điểm đến" />
          </Form.Item>
          <Form.Item
            label="Mã"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã" },
              {
                pattern: /^[a-zA-Z0-9]+$/,
                message: "Mã chỉ được chứa chữ và số",
              },
            ]}
          >
            <Input placeholder="Nhập mã điểm đến" />
          </Form.Item>
          <Form.Item
            label="Thông tin"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả..." />
          </Form.Item>
          <Form.Item label="Hình ảnh" name="image">
            <Upload
              listType="picture"
              beforeUpload={(file) => {
                const isJpg =
                  file.type === "image/jpeg" ||
                  file.type === "image/jpg" ||
                  file.name.toLowerCase().endsWith(".jpg") ||
                  file.name.toLowerCase().endsWith(".jpeg");
                console.log("File type:", file.type);
                console.log("File name:", file.name);
                if (!isJpg) {
                  message.error("Chỉ chấp nhận file ảnh định dạng JPG!");
                }
                return false;
              }}
              onChange={(info) => setImage(info.fileList[0]?.originFileObj)}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa */}
      <Modal
        title="Cập nhật địa điểm"
        open={isModalEditOpen}
        onOk={handleOk}
        onCancel={() => setIsModalEditOpen(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên điểm đến" />
          </Form.Item>
          <Form.Item
            label="Mã"
            name="code"
            rules={[
              { required: true, message: "Vui lòng nhập mã" },
              {
                pattern: /^[a-zA-Z0-9]+$/,
                message: "Mã chỉ được chứa chữ và số",
              },
            ]}
          >
            <Input placeholder="Nhập mã điểm đến" />
          </Form.Item>
          <Form.Item
            label="Thông tin"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả..." />
          </Form.Item>
          <Form.Item label="Hình ảnh" name="image">
            <Upload
              listType="picture"
              beforeUpload={(file) => {
                const isJpg =
                  file.type === "image/jpeg" ||
                  file.type === "image/jpg" ||
                  file.name.toLowerCase().endsWith(".jpg") ||
                  file.name.toLowerCase().endsWith(".jpeg");
                console.log("File type:", file.type);
                console.log("File name:", file.name);
                if (!isJpg) {
                  message.error("Chỉ chấp nhận file ảnh định dạng JPG!");
                }
                return false;
              }}
              onChange={(info) => setImage(info.fileList[0]?.originFileObj)}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Destination1;
