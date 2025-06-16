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
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

import moment from "moment";

const { Option } = Select;
const { Search } = Input;

function TourIdDetail() {
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
    fromDate: "",
    transportationId: "",
    categoryId: "",
    inActive: "",
    isFeatured: "",
    // sortOrder: "",
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
      <React.Fragment key={destination.id}>
        <Option key={destination.id} value={destination.id}>
          {`${"---".repeat(level)} ${destination.name}`}
        </Option>
        {destination.children &&
          destination.children.length > 0 &&
          renderDestinations(destination.children, level + 1)}
      </React.Fragment>
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
        get("tours/tours-with-details", filters),
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
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu tour!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataTour();
  }, [filters]);

  const handleStatusChange = async (tourDetailId, status) => {
    setLoading(true);
    try {
      await patch(`tours/details/${tourDetailId}`, {
        status: status,
      });
      message.success("Cập nhật trạng thái tour thành công!");
      fetchDataTour();
    } catch (error) {
      message.error("Cập nhật trạng thái tour thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiringTours = async () => {
    setTypeButtonOne("");
    setTypeButtonTwo("primary");
    setLoading(true);
    try {
      const response = await get("tours/details/expired-soon", filters);
      setTour(response.data || []);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu tour sắp hết hạn!");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpiredTours = async () => {
    setTypeButtonOne("primary");
    setTypeButtonTwo("");
    setLoading(true);
    try {
      const response = await get("tours/details/expired", filters);
      setTour(response.data || []);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu tour đã hết hạn!");
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
      fromDate: "",
      transportationId: "",
      categoryId: "",
      inActive: "",
      isFeatured: "",
      sortOrder: "",
      title: "",
    });
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
      title: "Trạng thái",
      dataIndex: "inActive",
      key: "inActive",
      render: (inActive) => (
        <Tag
          color={inActive ? "green" : "red"}
          className="button-change-inActive"
        >
          {inActive ? "Hoạt động" : "Không hoạt động"}
        </Tag>
      ),
    },

    {
      title: "Nổi bật",
      dataIndex: "isFeatured",
      key: "isFeatured",
      render: (isFeatured) => (
        <Tag
          color={isFeatured ? "green" : "red"}
          className="button-change-inActive"
        >
          {isFeatured ? "Nổi bật" : "Không nổi bật"}
        </Tag>
      ),
    },
    {
      title: "Tiến trình",
      key: "status",
      dataIndex: "status",
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(record.tourDetailId, value)}
        >
          <Option value="SCHEDULED">Lên lịch</Option>
          <Option value="IN_PROGRESS">Đang diễn ra</Option>
          <Option value="COMPLETED">Hoàn thành</Option>
          <Option value="CANCELLED">Đã hủy</Option>
        </Select>
      ),
    },
    {
      title: "Giá",
      key: "price",
      render: (_, record) => (
        <div>
          <div>
            <strong>Người lớn:</strong> {record.adultPrice.toLocaleString()} đ
          </div>
          <div>
            <strong>Trẻ em:</strong> {record.childrenPrice.toLocaleString()} đ
          </div>
          <div>
            <strong>Trẻ nhỏ:</strong> {record.childPrice.toLocaleString()} đ
          </div>
          <div>
            <strong>Em bé:</strong> {record.babyPrice.toLocaleString()} đ
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Tổng số chỗ",
      dataIndex: "slots",
      key: "slots",
    },
    {
      title: "Số chỗ đã đặt",
      dataIndex: "bookedSlots",
      key: "bookedSlots",
    },
    {
      title: "Số chỗ còn lại",
      dataIndex: "remainingSlots",
      key: "remainingSlots",
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
      title: "Ngày khởi hành",
      dataIndex: "dayStart",
      key: "dayStart",
      render: (dayStart) => moment(dayStart).format("DD-MM-YYYY"),
    },
    {
      title: "Ngày trở lại",
      dataIndex: "dayReturn",
      key: "dayReturn",
      render: (dayReturn) => moment(dayReturn).format("DD-MM-YYYY"),
    },
  ];

  return (
    <div className="tour-container">
      <div style={{ marginBottom: 20 }}>
        {/* <Select
          style={{ marginRight: 10, width: 200 }}
          placeholder="Chọn"
          onChange={(value) => setValueCheckbox(value)}
        >
          <Select.Option value="inActive-true">Hoạt động</Select.Option>
          <Select.Option value="inActive-false">Không hoạt động</Select.Option>
          <Select.Option value="isFeatured-true">Nổi bật</Select.Option>
          <Select.Option value="isFeatured-false">Không nổi bật</Select.Option>
          <Select.Option value="delete-true">Xóa</Select.Option>
        </Select> */}
        <Button
          onClick={() => navigate(`/tour`)}
          type="primary"
          style={{ marginLeft: 1 }}
        >
          Xem danh sách tour
        </Button>

        <Button
          onClick={fetchExpiringTours}
          type={typeButtonTwo ? "primary" : ""}
          style={{ marginRight: 10, marginLeft: "20px" }}
        >
          Tour sắp hết hạn
        </Button>
        <Button
          onClick={fetchExpiredTours}
          type={typeButtonOne ? "primary" : ""}
          style={{ marginRight: 10, marginLeft: "10px" }}
        >
          Tour hết hạn
        </Button>
        <Button
          onClick={clearFilters}
          style={{ marginRight: 10, marginLeft: "10px" }}
        >
          Làm mới
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

        <DatePicker
          placeholder="Ngày đi"
          style={{ marginRight: 10 }}
          onChange={(date, dateString) =>
            setFilters((prev) => ({ ...prev, fromDate: dateString }))
          }
        />

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

        {/* Add Select for Price */}
        {/* <Select
          style={{ width: 200, marginRight: 10 }}
          placeholder="Giá"
          onChange={(value) => setFilters({ ...filters, sortOrder: value })}
        >
          <Option value="">Tất cả</Option>
          <Option value="asc">Tăng dần</Option>
          <Option value="desc">Giảm dần</Option>
        </Select> */}
      </div>

      <Table
        rowKey="tourDetailId"
        columns={columns}
        dataSource={tour}
        loading={loading}
        className="dashboard-table"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}

export default TourIdDetail;
