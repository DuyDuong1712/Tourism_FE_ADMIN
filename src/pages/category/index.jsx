import React, { useEffect, useState } from "react";
import {
  get,
  post,
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
  Popconfirm,
} from "antd";
import { useSelector } from "react-redux";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [form] = Form.useForm();

  // Lấy quyền từ Redux Store
  const permissions = useSelector((state) => state.admin.permissions);

  // Kiểm tra quyền
  const canCreate = permissions.includes("CREATE_CATEGORY");
  const canUpdate = permissions.includes("UPDATE_CATEGORY");
  const canDelete = permissions.includes("DELETE_CATEGORY");

  const fetchApi = async () => {
    try {
      const res = await get("categories");
      setCategories(res.data);
      console.log(res);
      setLoading(false);
    } catch (error) {
      message.error("Lấy danh mục thất bại");
      console.log("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  //Tạo mới danh mục
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await form.validateFields(); // kiểm tra dữ liệu nhập vào
      const values = form.getFieldValue(); // lấy dữ liệu nhập vào
      await post("categories", values); // gửi dữ liệu đến server
      message.success("Tạo mới danh mục thành công");
      await fetchApi();
      setIsModalCreateOpen(false);
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error("Tạo mới danh mục thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  //Cập nhật danh mục
  const handleOk = async () => {
    try {
      setLoading(true);
      await patch(`categories/${categoryId}`, {
        name,
        description,
      });
      message.success("Cập nhật thông tin thành công");
      await fetchApi();
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

  //Mở modal chỉnh sửa và thiết lập giá trị ban đầu
  const handleEdit = (category) => {
    setName(category.name);
    setDescription(category.description);
    setCategoryId(category.id);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setIsModalEditOpen(true);
  };

  const resetFormAndState = () => {
    form.resetFields();
    setName("");
    setDescription("");
    setCategoryId(null);
  };

  const handleDelete = async (category) => {
    setLoading(true);
    try {
      await deleteMethod(`categories/${category.id}`, {});
      setLoading(false);
      message.success("Xóa danh mục thành công");
      await fetchApi();
    } catch (error) {
      message.error("Xóa danh mục thất bại");
    } finally {
      setLoading(false);
    }
  };

  //Thay đổi trạng thái hoạt động của category
  const handleChangeStatus = async (categoryId, status) => {
    setLoading(true);
    try {
      const option = { inActive: !status };
      await patch(`categories/${categoryId}/status`, option);
      message.success("Cập nhật trạng thái danh mục thành công");
      await fetchApi();
    } catch (error) {
      message.error("Cập nhật trạng thái danh mục thất bại");
    } finally {
      setLoading(false);
    }
  };

  //Cột hiển thị trên bảng
  /**
      title: Tên cột hiển thị trên giao diện
      dataIndex: Tên trường dữ liệu lấy từ data source (mảng dữ liệu)
      key: Khóa duy nhất của cột
      render: Hàm để tùy chỉnh cách hiển thị nội dung trong ô
   */
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
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Trạng thái",
      dataIndex: "inActive",
      key: "inActive",
      render: (status, record) => (
        <Tag
          color={status == true ? "green" : "red"}
          onClick={() => handleChangeStatus(record.id, status)}
          className="button-change-status"
        >
          {status == true ? "Hoạt động" : "Không hoạt động"}
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
      dataIndex: "updateBy",
      key: "updateBy",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, category) => (
        <Space size="middle">
          {canUpdate && (
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => handleEdit(category)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn xóa tour này chứ ?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => handleDelete(category)}
            >
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  //chuyển đổi mảng categories thành một mảng data
  const data = categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    inActive: category.inActive,
    createdBy: category.createdBy,
    updateBy: category.updateBy,
  }));

  return (
    <>
      <div className="layout-container">
        {canCreate && (
          <Button
            type="primary"
            onClick={() => {
              resetFormAndState();
              setIsModalCreateOpen(true);
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
            resetFormAndState();
            setIsModalEditOpen(false);
          }}
          loading={loading}
        >
          <Form form={form} layout="vertical" onFinish={handleOk}>
            <Form.Item
              label="Tên"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên",
                  whitespace: true,
                },
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Item>
          </Form>
        </Modal>
        {/* Create Modal */}
        <Modal
          title="Thêm mới danh mục"
          open={isModalCreateOpen}
          onOk={handleSubmit}
          onCancel={() => {
            resetFormAndState();
            setIsModalCreateOpen(false);
          }}
          loading={loading}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Tên"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên",
                  whitespace: true,
                },
              ]}
              validateTrigger={["onChange", "onBlur"]}
            >
              <Input placeholder="Nhập tên danh mục" />
            </Form.Item>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input placeholder="Nhập mô tả danh mục" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Category;
