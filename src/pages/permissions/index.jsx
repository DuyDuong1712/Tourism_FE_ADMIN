import React, { useState, useEffect } from "react";
import "./style.scss";
import { Table, Button, message, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteMethod,
  get,
  post,
  put,
} from "../../utils/axios-http/axios-http";
import { setPermissions as updateReduxPermissions } from "../../slice/adminSlice";

function Permissions() {
  const [permissions, setPermissions] = useState([]);
  const [newPermissions, setNewPermissions] = useState({
    added: [],
    removed: [],
  });
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const recordAdmin = useSelector((state) => state.admin);
  const adminPermissions = recordAdmin.permissions || [];

  const hasRoleManagementPermission = () => {
    return (
      adminPermissions.includes("CREATE_ROLES") ||
      adminPermissions.includes("UPDATE_ROLES") ||
      adminPermissions.includes("DELETE_ROLES")
    );
  };

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const [permissionResponse, roleResponse] = await Promise.all([
        get("permissions"),
        get("roles"),
      ]);

      const permissionList = permissionResponse.data;
      const roleList = roleResponse.data;

      const permissionsWithRoles = permissionList.map((permission) => ({
        ...permission,
        roleIds: [],
      }));

      roleList.forEach((role) => {
        const permissionResponses = role.permissionResponses || [];
        permissionResponses.forEach((permission) => {
          const index = permissionsWithRoles.findIndex(
            (p) => p.id === permission.id,
          );
          if (index !== -1) {
            permissionsWithRoles[index].roleIds.push(role.id);
          }
        });
      });

      setPermissions(permissionsWithRoles);
      setRoles(roleList);
    } catch (error) {
      message.error("Lỗi khi lấy danh sách phân quyền");
      console.error("Lỗi lấy danh sách permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handleCheckboxChange = (permissionId, roleId) => {
    const currentPermission = permissions.find((p) => p.id === permissionId);
    const isCurrentlyChecked = currentPermission?.roleIds.includes(roleId);

    setPermissions((prevPermissions) =>
      prevPermissions.map((permission) => {
        if (permission.id === permissionId) {
          const updatedRoleIds = isCurrentlyChecked
            ? permission.roleIds.filter((id) => id !== roleId)
            : [...permission.roleIds, roleId];
          return { ...permission, roleIds: updatedRoleIds };
        }
        return permission;
      }),
    );

    setNewPermissions((prevState) => {
      const isAdded = prevState.added.some(
        (item) => item.permissionId === permissionId && item.roleId === roleId,
      );
      const isRemoved = prevState.removed.some(
        (item) => item.permissionId === permissionId && item.roleId === roleId,
      );

      let addedPermissions = [...prevState.added];
      let removedPermissions = [...prevState.removed];

      if (!isCurrentlyChecked) {
        if (!isAdded && !isRemoved) {
          addedPermissions.push({ permissionId, roleId });
        }
        removedPermissions = removedPermissions.filter(
          (item) =>
            item.permissionId !== permissionId || item.roleId !== roleId,
        );
      } else {
        if (!isRemoved && !isAdded) {
          removedPermissions.push({ permissionId, roleId });
        }
        addedPermissions = addedPermissions.filter(
          (item) =>
            item.permissionId !== permissionId || item.roleId !== roleId,
        );
      }

      return { added: addedPermissions, removed: removedPermissions };
    });
  };

  const handleClick = async () => {
    setLoading(true);
    const optionAdd = [];
    const optionRemove = [];

    newPermissions.added.forEach((item) => {
      const existRole = optionAdd.find((o) => o.roleId === item.roleId);
      if (existRole) {
        existRole.permissionIds.push(item.permissionId);
      } else {
        optionAdd.push({
          roleId: item.roleId,
          permissionIds: [item.permissionId],
        });
      }
    });

    newPermissions.removed.forEach((item) => {
      const existRole = optionRemove.find((o) => o.roleId === item.roleId);
      if (existRole) {
        existRole.permissionIds.push(item.permissionId);
      } else {
        optionRemove.push({
          roleId: item.roleId,
          permissionIds: [item.permissionId],
        });
      }
    });

    if (optionAdd.length === 0 && optionRemove.length === 0) {
      message.info("Chưa có cập nhật phân quyền nào.");
      setLoading(false);
      return;
    }

    try {
      await Promise.all(
        optionAdd.map((item) =>
          put(`roles/${item.roleId}/permissions`, {
            permissionIds: item.permissionIds,
          }),
        ),
      );
      await Promise.all(
        optionRemove.map((item) =>
          deleteMethod(`roles/${item.roleId}/permissions`, {
            permissionIds: item.permissionIds,
          }),
        ),
      );
      message.success("Cập nhật phân quyền thành công!");
      setNewPermissions({ added: [], removed: [] });

      // Chỉ cập nhật quyền admin nếu có thay đổi liên quan đến role của admin
      const adminId = recordAdmin?.admin?.roleId;
      const hasAdminRoleChanges =
        optionAdd.some((item) => item.roleId === adminId) ||
        optionRemove.some((item) => item.roleId === adminId);

      if (hasAdminRoleChanges) {
        const updated = permissions
          .filter((p) => p.roleIds.includes(adminId))
          .map((p) => p.code);
        dispatch(updateReduxPermissions(updated));
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật phân quyền");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Phân quyền",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    ...roles.map((role) => ({
      title: role.code,
      dataIndex: role.code,
      key: role.id,
      render: (_, record) => (
        <input
          type="checkbox"
          checked={record.roleIds.includes(role.id)}
          onChange={() => handleCheckboxChange(record.id, role.id)}
          disabled={!hasRoleManagementPermission() || role.code === "ADMIN"}
        />
      ),
    })),
  ];

  const data = permissions.map((item) => ({
    key: item.id,
    id: item.id,
    code: item.code,
    description: item.description,
    roleIds: item.roleIds || [],
  }));

  return (
    <Spin spinning={loading}>
      <div className="layout-container">
        <Button
          type="primary"
          onClick={handleClick}
          disabled={!hasRoleManagementPermission()}
        >
          Cập nhật phân quyền
        </Button>
        <Table
          className="table-container"
          columns={columns}
          dataSource={data}
          pagination={false}
        />
      </div>
    </Spin>
  );
}

export default Permissions;
