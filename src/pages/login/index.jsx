import React from "react";
import "./style.scss";
import { Button, Form, Input, message } from "antd";
import { login } from "../../api/auth";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form] = Form.useForm(); //tạo một instance form để quản lý dữ liệu form.
  const navigate = useNavigate();

  // xử lý khi người dùng submit form
  const onFinish = async () => {
    try {
      const values = form.getFieldValue(); // Lấy dữ liệu từ form
      const response = await login(values); // Gửi dữ liệu tới API login
      if (response) {
        message.success("Đăng nhập thành công!");
        navigate("/dashboard"); // Điều hướng đến trang dashboard
      } else {
        message.error(response?.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error(error);
      message.error("Đăng nhập thất bại! Hãy thử lại sau.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <Form form={form} className="form-login" onFinish={onFinish}>
          <h2>LOGIN</h2>
          <p>Username: </p>
          <Form.Item
            className="form-input"
            name="username"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên đăng nhập của bạn!",
              },
            ]}
          >
            <Input
              className="input"
              placeholder="Nhập tên đăng nhập của bạn !"
            />
          </Form.Item>

          <p>Password: </p>
          <Form.Item
            className="form-input"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu của bạn!" },
            ]}
          >
            <Input.Password
              className="input"
              placeholder="Nhập mật khẩu của bạn !"
            />
          </Form.Item>

          <Form.Item>
            <Button className="button" type="primary" htmlType="submit">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
