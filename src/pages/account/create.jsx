import React, { useState } from "react";
import "./create.scss";
import { Modal, message, Form, Input, Select, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { postForm } from "../../utils/axios-http/axios-http";
import PropTypes from "prop-types";

const { Option } = Select;

const ModalCreateAccount = ({ onClose, fetchAccounts, open, roles }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const handleImageChange = (info) => {
    if (info.file.status === "done" || info.file.status === "uploading") {
      setImage(info.file.originFileObj);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (image) {
        formData.append("image", image);
      }

      await postForm("users", formData);
      message.success("Tạo tài khoản thành công");
      fetchAccounts();
      form.resetFields();
      setImage(null);
      onClose();
    } catch (error) {
      if (error.name !== "ValidationError") {
        message.error("Có lỗi xảy ra khi tạo tài khoản mới");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo mới tài khoản"
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        setImage(null);
        onClose();
      }}
      confirmLoading={loading}
      width={500}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Ảnh đại diện" name="image">
          <Upload
            beforeUpload={() => false}
            onChange={handleImageChange}
            maxCount={1}
            accept="image/*"
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
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
        >
          <Input />
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
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Quyền"
          name="roleId"
          rules={[{ required: true, message: "Vui lòng chọn quyền" }]}
        >
          <Select placeholder="Chọn quyền">
            {roles.map((role) => (
              <Option key={role.id} value={role.id}>
                {role.code}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

ModalCreateAccount.propTypes = {
  onClose: PropTypes.func.isRequired,
  fetchAccounts: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      code: PropTypes.string.isRequired, // Đổi từ "name" sang "code" nếu bạn dùng code để hiển thị
    }),
  ).isRequired,
};

export default ModalCreateAccount;
