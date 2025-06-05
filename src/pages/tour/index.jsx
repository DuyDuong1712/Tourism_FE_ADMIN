import React, { useEffect, useState, useCallback } from "react";
import {
  message,
  Space,
  Table,
  Tag,
  Button,
  Select,
  DatePicker,
  Input,
  Popconfirm,
} from "antd";
import { deleteMethod, get, patch } from "../../utils/axios-http/axios-http";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  DashOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";

import moment from "moment";

const { Option } = Select;
const { Search } = Input;

function Tour() {
  const [tour, setTour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [typeButtonOne, setTypeButtonOne] = useState("");
  const [typeButtonTwo, setTypeButtonTwo] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [valueCheckbox, setValueCheckbox] = useState("");
  const [filters, setFilters] = useState({
    destinationId: "",
    departureId: "",
    transportationId: "",
    categoryId: "",
    inActive: "",
    isFeatured: "",
    name: "",
  });

  const navigate = useNavigate();

  // Lấy quyền từ Redux Store
  const permissions = useSelector((state) => state.admin.permissions);

  // Kiểm tra quyền
  const canCreate = permissions.includes("CREATE_TOUR");
  const canUpdate = permissions.includes("UPDATE_TOUR");
  const canDelete = permissions.includes("DELETE_TOUR");

  // Hàm xây dựng cây phân cấp cho điểm đến
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

  // Hàm render danh sách phân cấp cho điểm đến
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

  const fetchDataTour = async () => {
    try {
      setLoading(true);
      const [
        response,
        categoriesData,
        departuresData,
        destinationsData,
        transportationsData,
      ] = await Promise.all([
        get("tours/filter", filters),
        get("categories"),
        get("departures"),
        get("destinations"),
        get("transportations"),
      ]);

      setCategories(categoriesData.data || []);
      setDepartures(departuresData.data || []);
      setDestinations(buildTree(destinationsData.data) || []);
      setTransportations(transportationsData.data || []);
      setTour(response.data || []);

      console.log(response.data);
      console.log(categoriesData.data);
      console.log(departuresData.data);
      console.log(destinationsData.data);
      console.log(transportationsData.data);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu tour!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataTour();
  }, [filters]);

  const handleStatusChange = async (tourId, inActive) => {
    setLoading(true);
    try {
      await patch(`tours/${tourId}/status`, {
        inActive: !inActive,
      });
      message.success("Cập nhật trạng thái tour thành công!");
      fetchDataTour();
    } catch (error) {
      message.error("Cập nhật trạng thái tour thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedChange = async (tourId, isFeatured) => {
    setLoading(true);
    try {
      await patch(`tours/${tourId}/featured`, { isFeatured: !isFeatured });
      message.success("Cập nhật tour nổi bật thành công!");
      fetchDataTour();
    } catch (error) {
      message.error("Cập nhật tour nổi bật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setTypeButtonOne("");
    setTypeButtonTwo("");
    setFilters({
      destinationId: "",
      departureId: "",
      transportationId: "",
      categoryId: "",
      inActive: "",
      isFeatured: "",
      name: "",
    });
    fetchDataTour();
  };

  const removeTour = async (tourID) => {
    try {
      await deleteMethod(`tours/${tourID}`);
      message.success("Xóa tour thành công");
      setTour((prevTours) => prevTours.filter((item) => item.id !== tourID));
    } catch (error) {
      message.error("Xóa tour thất bại");
    }
  };

  const handleCheckboxChange = (tourId, checked) => {
    if (checked) {
      setSelectedRowKeys((prev) => [...prev, tourId]);
    } else {
      setSelectedRowKeys((prev) => prev.filter((id) => id !== tourId));
    }
  };

  const handleChangeMultiple = async () => {
    try {
      setLoading(true);
      const option = {
        valueChange: valueCheckbox,
        tourIds: selectedRowKeys,
      };
      await patch("tours/update-multiple", option);
      message.success("Cập nhật tour thành công!");
      setLoading(false);
      setSelectedRowKeys([]);
      fetchDataTour();
    } catch (error) {
      console.log(error);
      message.error("Cập nhật tour thất bại!");
    }
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) => <span>{index + 1}</span>,
    },
    {
      title: "Tên tour",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Ảnh",
      dataIndex: "tourImages",
      key: "tourImages",
      render: (tourImages) => (
        <img
          src={tourImages[0] || "https://via.placeholder.com/50"}
          alt="tour"
          style={{ width: 50, height: 50 }}
        />
      ),
    },
    {
      title: "Thông tin",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Trạng thái",
      key: "inActive",
      dataIndex: "inActive",
      render: (inActive, record) => (
        <Tag
          color={inActive ? "green" : "red"}
          onClick={() => handleStatusChange(record.id, inActive)}
          className="button-change-status"
        >
          {inActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Nổi bật",
      dataIndex: "isFeatured",
      key: "isFeatured",
      render: (isFeatured, record) => (
        <Tag
          color={isFeatured ? "green" : "red"}
          onClick={() => handleFeaturedChange(record.id, isFeatured)}
          className="button-change-status"
        >
          {isFeatured ? "Nổi bật" : "Không nổi bật"}
        </Tag>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Khởi hành",
      dataIndex: "departure",
      key: "departure",
    },
    {
      title: "Điểm đến",
      dataIndex: "destination",
      key: "destination",
    },
    {
      title: "Phương tiện",
      dataIndex: "transportation",
      key: "transportation",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            onClick={() => navigate(`/tour-detail/${record.id}`)}
            type="primary"
            icon={<EyeOutlined />}
            style={{ marginRight: 1 }}
          ></Button>

          <Button
            onClick={() => navigate(`/tour-view-detail/${record.id}`)}
            type="default"
            icon={<DashOutlined />}
            style={{ marginLeft: 1 }}
          />
          {canUpdate && (
            <Button
              onClick={() => navigate(`/edit-tour/${record.id}`)}
              type="default"
              icon={<EditOutlined />}
              style={{ marginLeft: 1 }}
            />
          )}

          {canDelete && (
            <Popconfirm
              title="Bạn có chắc chắn xóa tour này chứ ?"
              okText="Có"
              cancelText="Hủy"
              onConfirm={() => removeTour(record.id)}
            >
              <Button
                type="danger"
                icon={<DeleteOutlined />}
                style={{ marginLeft: 1 }}
                danger
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="tour-container">
      <div style={{ marginBottom: 20 }}>
        {canCreate && (
          <Button
            onClick={() => navigate("/create-new")}
            style={{ background: "blue", color: "white", marginRight: 10 }}
          >
            Tạo mới
          </Button>
        )}

        <Button
          onClick={clearFilters}
          style={{ marginRight: 10, marginLeft: "10px" }}
        >
          Quay lại Quản lý Tour
        </Button>
        <Search
          placeholder="Nhập tour muốn tìm kiếm"
          onSearch={(value) => setFilters({ ...filters, title: value })}
          style={{ width: 200, marginRight: 10, marginLeft: "10px" }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Chọn điểm đến"
          onChange={(value) => setFilters({ ...filters, destinationId: value })}
        >
          <Option value="">Tất cả</Option>
          {renderDestinations(destinations)}
        </Select>

        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Chọn điểm khởi hành"
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, departureId: value }))
          }
        >
          <Option value="">Tất cả</Option>
          {departures.map((departure) => (
            <Option key={departure.id} value={departure.id}>
              {departure.name}
            </Option>
          ))}
        </Select>

        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Loại phương tiện"
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, transportationId: value }))
          }
        >
          <Option value="">Tất cả</Option>
          {transportations.map((transport) => (
            <Option key={transport.id} value={transport.id}>
              {transport.name}
            </Option>
          ))}
        </Select>

        <Select
          style={{ width: 200 }}
          placeholder="Danh mục"
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, categoryId: value }))
          }
        >
          <Option value="">Tất cả</Option>
          {categories.map((category) => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>
        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Trạng thái"
          onChange={(value) => setFilters({ ...filters, inActive: value })}
        >
          <Option value={true}>Hoạt động</Option>
          <Option value={false}>Không hoạt động</Option>
        </Select>

        {/* Add Select for Featured */}
        <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Nổi bật"
          onChange={(value) => setFilters({ ...filters, isFeatured: value })}
        >
          <Option value={true}>Nổi bật</Option>
          <Option value={false}>Không nổi bật</Option>
        </Select>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={tour}
        loading={loading}
        className="dashboard-table"
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
}

export default Tour;
