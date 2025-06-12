import React, { useEffect, useState, useCallback } from "react";
import {
  get,
  post,
  patch,
  postForm,
  patchForm,
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
  Select,
  Popconfirm,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";

const { Option } = Select;

function Destination() {
  const [destinations, setDestinations] = useState([]);
  const [destinationsTree, setDestinationsTree] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [destinationId, setDestinationId] = useState(null);
  const [form] = Form.useForm();

  const permissions = useSelector((state) => state.admin.permissions);
  const canCreate = permissions.includes("CREATE_DESTINATION");
  const canUpdate = permissions.includes("UPDATE_DESTINATION");
  const canDelete = permissions.includes("DELETE_DESTINATION");

  // Hàm xây dựng cây từ danh sách phẳng
  const buildTree = (items) => {
    const map = {};
    const tree = [];

    items.forEach((item) => {
      map[item.id] = { ...item, children: [] };
    });

    items.forEach((item) => {
      if (item.parentId && map[item.parentId]) {
        map[item.parentId].children.push(map[item.id]);
      } else {
        tree.push(map[item.id]);
      }
    });

    return tree;
  };

  // Hàm render danh sách phân cấp cho Select
  const renderDestinations = (items, level = 0) => {
    return items.map((destination) => (
      <>
        <Option key={destination.id} value={destination.id}>
          {`${"---".repeat(level)} ${destination.name}`}
        </Option>
        {destination.children && destination.children.length > 0 && (
          <>{renderDestinations(destination.children, level + 1)}</>
        )}
      </>
    ));
  };

  // Flatten destination tree for table display
  const flattenDestinations = (destinationsTree) => {
    let destinations = [];
    destinationsTree.forEach((item) => {
      destinations.push(item);
      if (item.children && item.children.length > 0) {
        destinations = [...destinations, ...flattenDestinations(item.children)];
      }
    });
    return destinations;
  };

  const fetchApi = useCallback(async () => {
    try {
      const res = await get("destinations");
      const rawData = res.data;
      const treeData = buildTree(rawData); // Chuyển đổi dữ liệu phẳng thành cây
      setDestinationsTree(treeData);
      setDestinations(flattenDestinations(treeData));
      setLoading(false);
    } catch (error) {
      console.log("Error fetching destinations:", error);
      message.error("Lỗi khi lấy dữ liệu địa điểm");
    }
  }, []);

  useEffect(() => {
    fetchApi();
  }, [fetchApi]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("code", values.code || "");
      formData.append("description", values.description || "");
      formData.append("parentId", values.parentId || "");
      formData.append("image", values.image?.file || "");
      await postForm("destinations", formData);
      message.success("Tạo mới địa điểm thành công");
      fetchApi();
      setIsModalCreateOpen(false);
      // Reset state after successful submission
      setName("");
      setCode("");
      setDescription("");
      setImage(null);
      setParentId(null);
      form.resetFields();
    } catch (error) {
      message.error("Tạo mới địa điểm thất bại");
    }
    setLoading(false);
  };

  const handleOk = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("code", values.code || "");
      formData.append("description", values.description || "");
      formData.append("parentId", values.parentId || "");
      formData.append("image", values.image?.file || "");
      formData.append("destinationId", destinationId);
      await patchForm(`destinations/${destinationId}`, formData);
      message.success("Cập nhật thông tin thành công");
      setIsModalEditOpen(false);
      fetchApi();
      // Reset state after successful edit
      setName("");
      setCode("");
      setDescription("");
      setImage(null);
      setParentId(null);
      setDestinationId(null);
      form.resetFields();
    } catch (error) {
      message.error("Cập nhật thông tin thất bại");
    }
    setLoading(false);
  };

  const fetchFilteredDestinations = async (parentId) => {
    try {
      if (parentId) {
        const filteredData = await get(`destinations/${parentId}/children`);
        setFilteredDestinations(filteredData.data);
      } else {
        setFilteredDestinations([]);
      }
    } catch (error) {
      message.error("Lỗi khi lấy dữ liệu con");
    }
  };

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
      title: "Mã",
      dataIndex: "code",
      key: "code",
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
          color={inActive ? "green" : "red"}
          onClick={() => handleChangeStatus(record.id, inActive)}
          className="button-change-status"
        >
          {inActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Parent",
      dataIndex: "parentId",
      key: "parentId",
      render: (parentId) => (parentId ? "Có" : "Không"),
    },
    {
      title: "Tạo bởi",
      dataIndex: "createdBy",
      key: "createdBy",
    },
    {
      title: "Cập nhật bởi",
      dataIndex: "modifiedBy", // Sửa từ updatedBy thành modifiedBy để khớp với dữ liệu
      key: "modifiedBy",
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
              default
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

  const data = (
    filteredDestinations.length > 0 ? filteredDestinations : destinations
  ).map((destination) => ({
    id: destination.id,
    name: destination.name,
    code: destination.code,
    description: destination.description,
    image: destination.image,
    parentId: destination.parentId,
    inActive: destination.inActive,
    createdBy: destination.createdBy,
    modifiedBy: destination.modifiedBy, // Sửa từ updatedBy thành modifiedBy
  }));

  const handleChangeStatus = async (destinationId, status) => {
    setLoading(true);
    try {
      await patch(`destinations/${destinationId}/status`, {
        inActive: !status,
      });
      message.success("Cập nhật trạng thái địa điểm thành công");
      fetchApi();
    } catch (error) {
      message.error(error.response.data.message);
    }
    setLoading(false);
  };

  const handleEdit = (destination) => {
    setName(destination.name);
    setCode(destination.code);
    setDescription(destination.description);
    setImage(destination.image);
    setParentId(destination.parentId);
    setDestinationId(destination.id);
    form.setFieldsValue({
      name: destination.name,
      code: destination.code,
      description: destination.description,
      image: destination.image
        ? { file: { name: destination.image, status: "done" } }
        : null,
      parentId: destination.parentId,
    });
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
    }
    setLoading(false);
  };

  const handleOpenCreateModal = () => {
    setName("");
    setCode("");
    setDescription("");
    setImage(null);
    setParentId(null);
    form.resetFields();
    form.setFieldsValue({
      name: "",
      code: "",
      description: "",
      image: null,
      parentId: null,
    });
    setIsModalCreateOpen(true);
  };

  return (
    <div className="layout-container">
      <div className="mr-4">
        <Select
          style={{ width: 200, marginBottom: 20 }}
          placeholder="Chọn danh mục cha"
          onChange={(value) => {
            setParentId(value);
            fetchFilteredDestinations(value);
          }}
          allowClear
        >
          <Option value="">Tất cả</Option>
          {renderDestinations(destinationsTree)}
        </Select>
      </div>
      {canCreate && (
        <Button type="primary" onClick={handleOpenCreateModal}>
          Thêm mới
        </Button>
      )}
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        className="table-container"
        pagination={{ pageSize: 8 }}
      />
      {/* Edit Modal */}
      <Modal
        title="Cập nhật thông tin"
        open={isModalEditOpen}
        onOk={handleOk}
        onCancel={() => {
          form.resetFields();
          setName("");
          setCode("");
          setDescription("");
          setImage(null);
          setParentId(null);
          setDestinationId(null);
          setIsModalEditOpen(false);
        }}
        loading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleOk}
          initialValues={{
            name,
            code,
            description,
            image,
            parentId,
          }}
        >
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mã"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Hình ảnh" name="image" valuePropName="file">
            <Upload
              name="image"
              listType="picture"
              beforeUpload={() => false}
              onChange={(info) => {
                setImage(info.fileList[0]?.originFileObj || null);
                form.setFieldsValue({ image: info.fileList[0] || null });
              }}
              fileList={
                image ? [{ uid: "-1", name: "image", status: "done" }] : []
              }
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Danh mục cha" name="parentId">
            <Select
              defaultValue={parentId}
              style={{ width: "100%" }}
              placeholder="Chọn danh mục cha"
              allowClear
            >
              <Option value="">Không có</Option>
              {renderDestinations(destinationsTree)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* Create Modal */}
      <Modal
        title="Thêm mới địa điểm"
        open={isModalCreateOpen}
        onOk={handleSubmit}
        onCancel={() => {
          form.resetFields();
          setName("");
          setCode("");
          setDescription("");
          setImage(null);
          setParentId(null);
          setIsModalCreateOpen(false);
        }}
        loading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mã"
            name="code"
            rules={[{ required: true, message: "Vui lòng nhập mã" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Hình ảnh" name="image" valuePropName="file">
            <Upload
              name="image"
              listType="picture"
              beforeUpload={() => false}
              onChange={(info) => {
                setImage(info.fileList[0]?.originFileObj || null);
                form.setFieldsValue({ image: info.fileList[0] || null });
              }}
              fileList={
                image ? [{ uid: "-1", name: "image", status: "done" }] : []
              }
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Danh mục cha" name="parentId">
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn danh mục cha"
              allowClear
            >
              <Option value="">Không có</Option>
              {renderDestinations(destinationsTree)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Destination;
