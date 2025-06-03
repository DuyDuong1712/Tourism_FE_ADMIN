import { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { get } from "../../utils/axios-http/axios-http";
import { Spin, message } from "antd";
import { useDispatch } from "react-redux";
import { setPermissions, setAdminInfo } from "../../slice/adminSlice";
import axios from "axios";

const PrivateRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // const baseUrl = import.meta.env.VITE_APP_URL_BE;
  const baseUrl = "http://localhost:8080/travel/api/auth";

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Kiểm tra token
        const token = localStorage.getItem("token");

        if (!token) {
          message.error("Vui lòng đăng nhập trước.");
          navigate("/login");
          return;
        }

        const verifyResponse = await axios.post(`${baseUrl}/introspect`, {
          token: token,
        });

        console.log(verifyResponse);

        const adminId = verifyResponse.data.data.user.id;
        const userName = verifyResponse.data.data.user.userName;
        const fullName = verifyResponse.data.data.user.fullName;
        const avatar = verifyResponse.data.data.user.avatar;
        const role = verifyResponse.data.data.user.role;
        const permissions = verifyResponse.data.data.user.permissions;

        // // Lấy chi tiết role admin theo adminId
        // const roleResponse = await get(`roles/${adminId}`);
        // const roleName = roleResponse.code;
        // const roleId = roleResponse.id;

        // // Lấy permissions của role đó
        // const permissionsResponse = await get(
        //   `roles/${roleResponse.id}/permissions`
        // );

        // // Lấy danh sách tên quyền
        // const permissions = await permissionsResponse.permissions.map(
        //   (item) => item.code
        // );

        // Lưu thông tin admin và quyền vào redux store
        dispatch(
          setAdminInfo({
            id: adminId,
            userName,
            fullName,
            role,
            avatar,
          }),
        );
        dispatch(setPermissions(permissions));

        // Nếu có quyền thì được truy cập, ngược lại báo lỗi
        if (
          ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF"].includes(role) ||
          (Array.isArray(permissions) && permissions.length > 0)
        ) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          message.error("Không có quyền truy cập!");
        }
      } catch (error) {
        console.log("Lỗi khi xác thực token hoặc lấy quyền:", error);
        setIsAuthorized(false);
        message.error("Lỗi khi xác thực token!");
        navigate("/login"); // Chuyển về trang login nếu lỗi
        return;
      } finally {
        setIsLoading(false); // Dù thành công hay lỗi thì kết thúc loading
      }
    };

    verifyToken();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  //Nếu đã xác thực thành công và có quyền, cho phép render các route con (bên trong PrivateRoute).
  return <Outlet />;
};

export default PrivateRoute;
