import React, { useEffect, useState } from "react";
import "./style.scss";
import { Table, Space, Tag, message, Button, Popconfirm } from "antd";
import { deleteMethod, get, patch } from "../../utils/axios-http/axios-http";
import EditAccount from "./edit";
import CreateAccount from "./create";
import { useSelector } from "react-redux";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";

function Account() {
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [roleId, setRoleId] = useState(null);

  // Lấy quyền từ Redux Store
  const permissions = useSelector((state) => state.admin.permissions);

  // Kiểm tra quyền
  const canCreate = permissions.includes("CREATE_CATEGORY");
  const canUpdate = permissions.includes("UPDATE_CATEGORY");
  const canDelete = permissions.includes("DELETE_CATEGORY");

  //Lấy danh sách quyền
  const fetchRoles = async () => {
    try {
      const res = await get("roles");
      setRoles(res.data);
      console.log(res.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách quyền");
    }
  };

  //Lấy danh sách tài khoản
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await get("users");
      setAccounts(accounts.data);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách tài khoản");
      console.error("Lỗi lấy danh sách accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchRoles();
  }, []);

  const columns = [
    {
      title: "Ảnh đại diện",
      dataIndex: "profileImg",
      key: "profileImg",
      render: (profileImg) => (
        <img
          src={profileImg}
          alt="profileImg"
          style={{ width: 100, height: 100 }}
        />
      ),
    },
    {
      title: "Tài khoản",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname", // Trước đây là fullName
      key: "fullname",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      dataIndex: "inActive",
      key: "inActive",
      render: (inActive, record) => {
        const isDisabled = !canUpdate || record.role === "ADMIN";
        return (
          <Tag
            color={inActive ? "green" : "red"}
            onClick={() => {
              if (!isDisabled) handleChangeinActive(record);
            }}
            className={`button-change-inActive ${record.role === "ADMIN" ? "disabled" : ""}`}
            style={{
              cursor: record.role === "ADMIN" ? "not-allowed" : "pointer",
              opacity: record.role === "ADMIN" ? 0.5 : 1,
            }}
          >
            {inActive ? "Hoạt động" : "Không hoạt động"}
          </Tag>
        );
      },
    },
    {
      title: "Quyền",
      dataIndex: "role",
      key: "role",
      render: (role) => role || "Chưa gán",
    },
    {
      title: "Tạo lúc",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (createdDate) =>
        createdDate ? moment(createdDate).format("DD-MM-YYYY") : "Không rõ",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {canUpdate && record.role !== "admin" && (
            <Button
              icon={<EditOutlined />}
              disabled={record.role === "ADMIN"}
              onClick={() => handleEdit(record)}
              default
            />
          )}
          {canDelete && record.role !== "admin" && (
            <Popconfirm
              title="Bạn có chắc chắn xóa tài khoản này không?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => handleDelete(record)}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={record.role === "ADMIN"}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const handleChangeinActive = async (record) => {
    setLoading(true);
    const inActive = { inActive: !record.inActive };
    console.log(inActive);

    try {
      await patch(`users/${record.id}/status`, inActive);
      fetchAccounts();
      message.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      message.error("Cập nhật trạng thái thất bại!");
      console.log("Lỗi Cập nhật trạng thái");
    }
    setLoading(false);
  };

  const handleDelete = async (account) => {
    setLoading(true);
    try {
      await deleteMethod(`users/${account.id}`);
      fetchAccounts();
      message.success("Xóa tài khoản thành công!");
    } catch (error) {
      message.error("Xóa tài khoản thất bại!");
      console.log("Lỗi xóa tài khoản");
    }
    setLoading(false);
  };
  const handleEdit = (account) => {
    console.log(account);
    const roleSelect = roles.find((role) => role.code === account.role);
    console.log(roleSelect);
    setRoleId(roleSelect.id);
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  console.log(selectedAccount);

  const handleCreate = () => {
    setIsModalCreateOpen(true);
  };

  return (
    <>
      <div className="layout-container">
        {canCreate && (
          <Button type="primary" onClick={handleCreate}>
            Thêm mới
          </Button>
        )}
        <Table
          columns={columns}
          dataSource={accounts}
          loading={loading}
          rowKey="id"
          className="table-container"
        />
      </div>

      {isModalOpen && (
        <EditAccount
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          account={selectedAccount}
          roles={roles}
          roleId={roleId}
          fetchAccounts={fetchAccounts}
        />
      )}

      {isModalCreateOpen && (
        <CreateAccount
          open={isModalCreateOpen}
          onClose={() => setIsModalCreateOpen(false)}
          roles={roles}
          fetchAccounts={fetchAccounts}
        />
      )}
    </>
  );
}

export default Account;
