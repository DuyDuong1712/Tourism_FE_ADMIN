import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./create.scss";
import { Modal, message, Form, Input, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { patchForm } from "../../utils/axios-http/axios-http";

const { Option } = Select;

function EditAccount({ open, onClose, account, roles, roleId, fetchAccounts }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(account.avatar || "");
  const [newAvatar, setNewAvatar] = useState(null);

  // Cập nhật lại khi modal mở ra
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        username: account.username || "",
        fullName: account.fullname || "",
        email: account.email || "",
        phone: account.phone || "",
        password: "",
        roleId: roleId || "",
      });
      setPreviewAvatar(account.avatar || "");
      setNewAvatar(null);
    }
  }, [open, account, roleId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      formData.append("username", values.username);
      formData.append("fullName", values.fullName);
      formData.append("email", values.email);
      formData.append("phone", values.phone);
      formData.append("roleId", values.roleId);
      if (values.password) {
        formData.append("password", values.password);
      }
      if (newAvatar) {
        formData.append("avatar", newAvatar);
      }

      await patchForm(`users/${account.id}`, formData);
      message.success("Cập nhật thông tin thành công");
      fetchAccounts();
      form.resetFields();
      setNewAvatar(null);
      onClose();
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = ({ file }) => {
    const img = file.originFileObj;
    if (img) {
      setNewAvatar(img);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(img);
    }
  };

  return (
    <Modal
      title="Cập nhật thông tin"
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        setNewAvatar(null);
        onClose();
      }}
      confirmLoading={loading}
      width={500}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Ảnh đại diện">
          {previewAvatar && (
            <img
              src={previewAvatar}
              alt="Avatar Preview"
              style={{
                width: 100,
                height: 100,
                marginBottom: 10,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />
          )}
          <Upload
            beforeUpload={() => false}
            accept="image/*"
            maxCount={1}
            onChange={handleAvatarChange}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          label="Tên đăng nhập"
          name="username"
          rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Mật khẩu" name="password">
          <Input.Password placeholder="Để trống nếu không đổi mật khẩu" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
              pattern: /^[0-9]{9,15}$/,
              message: "Số điện thoại không hợp lệ (9-15 chữ số)",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Quyền"
          name="roleId"
          rules={[{ required: true, message: "Vui lòng chọn quyền" }]}
        >
          <Select placeholder="Chọn quyền">
            {roles.map((r) => (
              <Option key={r.id} value={r.id}>
                {r.code}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}

EditAccount.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    username: PropTypes.string,
    fullname: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    avatar: PropTypes.string,
  }).isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
    }),
  ).isRequired,
  roleId: PropTypes.string,
  fetchAccounts: PropTypes.func.isRequired,
};

export default EditAccount;
