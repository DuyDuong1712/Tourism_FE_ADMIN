import React, { useEffect, useState } from "react";
import "./style.scss";
import {
  Space,
  Table,
  Modal,
  message,
  Button,
  Popconfirm,
  Input,
  Tag,
  Form,
} from "antd";
import {
  get,
  patch,
  post,
  deleteMethod,
} from "../../utils/axios-http/axios-http";
import { useSelector } from "react-redux";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

function Role() {
  const [listRoles, setListRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roleId, setRoleId] = useState("");

  const [form] = Form.useForm();

  // Lấy quyền từ Redux Store
  const permissions = useSelector((state) => state.admin.permissions);

  const canCreate = permissions.includes("CREATE_ROLES");
  const canUpdate = permissions.includes("UPDATE_ROLES");
  const canDelete = permissions.includes("DELETE_ROLES");

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await get("roles");
      if (response?.data) {
        setListRoles(response.data);
      }
    } catch (error) {
      console.error("Lỗi lấy danh sách roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const showModal = (role = null) => {
    if (role) {
      setIsEditMode(true);
      setRoleId(role.id);
      form.setFieldsValue({
        code: role.code,
        description: role.description || "",
      });
    } else {
      setIsEditMode(false);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (isEditMode) {
        await patch(`roles/${roleId}`, values);
        message.success("Cập nhật thông tin thành công");
      } else {
        await post("roles", values);
        message.success("Thêm mới quyền thành công");
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (error) {
      if (error.name !== "ValidationError") {
        message.error(
          isEditMode
            ? "Cập nhật thông tin thất bại"
            : "Thêm mới quyền thất bại",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async (role) => {
    if (role.code === "ADMIN") {
      message.warning("Không thể xóa quyền ADMIN");
      return;
    }
    setLoading(true);
    try {
      await deleteMethod(`roles/${role.id}`);
      message.success("Xóa quyền thành công");
      fetchRoles();
    } catch (error) {
      message.error("Xóa quyền không thành công");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (id, inActive) => {
    if (!canUpdate) {
      message.error("Bạn không có quyền cập nhật trạng thái");
      return;
    }
    setLoading(true);
    try {
      await patch(`roles/${id}/status`, { inActive: !inActive });
      message.success("Cập nhật trạng thái thành công");
      fetchRoles();
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Trạng thái",
      dataIndex: "inActive",
      render: (inActive, record) => {
        const isDisabled = !canUpdate || record.code === "ADMIN";
        return (
          <Tag
            color={inActive ? "green" : "red"}
            style={{
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.5 : 1,
            }}
            onClick={() => {
              if (!isDisabled) handleChangeStatus(record.id, inActive);
            }}
          >
            {inActive ? "Hoạt động" : "Không hoạt động"}
          </Tag>
        );
      },
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
      render: (_, role) => (
        <Space size="middle">
          {canUpdate && (
            <Button
              icon={<EditOutlined />}
              onClick={() => showModal(role)}
              disabled={role.code === "ADMIN"}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn xóa quyền này chứ?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => handleDelete(role)}
              disabled={role.code === "ADMIN"}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={role.code === "ADMIN"}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const data =
    listRoles?.map((role) => ({
      id: role.id,
      code: role.code,
      description: role.description,
      inActive: role.inActive,
      createdBy: role.createdBy,
      updatedBy: role.modifiedBy,
    })) || [];

  return (
    <div className="layout-container">
      {canCreate && (
        <Button type="primary" onClick={() => showModal()}>
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
        title={isEditMode ? "Cập nhật quyền" : "Thêm mới quyền"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập tên quyền" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Role;
