import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  message,
  Space,
  DatePicker,
  InputNumber,
  Spin,
} from "antd";
const { RangePicker } = DatePicker;
const { TextArea } = Input;
import "./style.scss";
import { useParams, useNavigate } from "react-router-dom";
import {
  UploadOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { get, patchForm } from "../../utils/axios-http/axios-http";
import moment from "moment";

function EditTour() {
  const { tourId } = useParams();
  const [form] = Form.useForm();
  const { Option } = Select;
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

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

  const fetchApi = async () => {
    try {
      setLoading(true);
      const [
        tourResponse,
        categoriesData,
        departuresData,
        destinationsData,
        transportationsData,
      ] = await Promise.all([
        get(`tours/${tourId}`),
        get("categories"),
        get("departures"),
        get("destinations"),
        get("transportations"),
      ]);

      const tourDetail = tourResponse.data;

      setCategories(categoriesData.data || []);
      setDepartures(departuresData.data || []);
      setDestinations(buildTree(destinationsData.data) || []);
      setTransportations(transportationsData.data || []);

      // Format tourDetails
      const tourDetailFormat =
        tourDetail.tourDetails?.map((item) => ({
          ...item,
          dateRange: [moment(item.dayStart), moment(item.dayReturn)],
        })) || [];

      // Gán giá trị vào form
      form.setFieldsValue({
        title: tourDetail.title,
        categoryId: tourDetail.catagoryId, // Giữ nguyên key từ API
        departureId: tourDetail.departureId,
        destinationId: tourDetail.destinationId,
        transportationId: tourDetail.transportId,
        description: tourDetail.description,
        schedule: tourDetail.tourSchedules || [],
        tourDetail: tourDetailFormat,
        attractions: tourDetail.tourInformation?.attractions || "",
        cuisine: tourDetail.tourInformation?.cuisine || "",
        suitableObject: tourDetail.tourInformation?.suitableObject || "",
        idealTime: tourDetail.tourInformation?.idealTime || "",
        vehicle: tourDetail.tourInformation?.vehicle || "",
        promotion: tourDetail.tourInformation?.promotion || "",
      });

      // Xử lý images
      const images =
        tourDetail.images?.map((image) => ({
          uid: image.id,
          url: image.imageUrl, // Sử dụng imageUrl từ API
        })) || [];

      setFileList(images);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error.message, error.stack);
      message.error("Không thể tải dữ liệu tour, vui lòng thử lại!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, [tourId]);

  //Cập nhật tour
  const onFinish = async () => {
    try {
      const values = form.getFieldsValue();
      const formData = new FormData();
      setLoading(true);

      // Thêm các trường dữ liệu thông thường vào FormData
      formData.append("title", values.title || "");
      formData.append("isFeatured", values.isFeatured ?? false);
      formData.append("categoryId", values.categoryId || "");
      formData.append("destinationId", values.destinationId || "");
      formData.append("departureId", values.departureId || "");
      formData.append("transportationId", values.transportationId || "");
      formData.append("description", values.description || "");

      // Thêm thông tin lồng nhau vào FormData
      formData.append(
        "information",
        JSON.stringify({
          attractions: values.attractions || "",
          cuisine: values.cuisine || "",
          idealTime: values.idealTime || "",
          suitableObject: values.suitableObject || "",
          vehicle: values.vehicle || "",
          promotion: values.promotion || "",
        }),
      );

      // Thêm lịch trình vào FormData
      formData.append("schedule", JSON.stringify(values.schedule || []));

      // Thêm chi tiết tour
      const tourDetailFormat =
        values.tourDetail?.map((detail) => ({
          ...detail,
          dayStart: detail.dateRange[0]?.toISOString(),
          dayReturn: detail.dateRange[1]?.toISOString(),
          dateRange: undefined, // Xóa dateRange khỏi object
        })) || [];
      formData.append("tour_detail", JSON.stringify(tourDetailFormat || []));

      // Thêm images vào FormData
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("images", file.originFileObj);
        }
        if (file.url != "") {
          formData.append("images", file.url);
        }
      });

      // Log FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await patchForm(`tours/${tourId}`, formData);
      if (response) {
        message.success("Cập nhật tour thành công!");
        form.resetFields();
        navigate("/tour");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật tour:", error.message, error.stack);
      message.error("Cập nhật tour thất bại, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const currencyFormatter = (value) => {
    if (!value) return "";
    return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ₫`;
  };
  const currencyParser = (value) => {
    return value.replace(/[^\d]/g, "");
  };

  return (
    <div className="form-container">
      <Spin indicator={<LoadingOutlined spin />} spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Title */}
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập title" }]}
          >
            <Input placeholder="Nhập title" />
          </Form.Item>
          {/* Category ID */}
          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Departure ID */}
          <Form.Item
            label="Điểm khởi hành"
            name="departureId"
            rules={[
              { required: true, message: "Vui lòng chọn điểm khởi hành" },
            ]}
          >
            <Select placeholder="Chọn điểm khởi hành">
              {departures.map((departure) => (
                <Option key={departure.id} value={departure.id}>
                  {departure.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Destination ID */}
          <Form.Item
            label="Điểm đến"
            name="destinationId"
            rules={[{ required: true, message: "Vui lòng chọn điểm đến" }]}
          >
            <Select placeholder="Chọn điểm đến">
              {renderDestinations(destinations)}
            </Select>
          </Form.Item>
          {/* Transportation ID */}
          <Form.Item
            label="Phương tiện"
            name="transportationId"
            rules={[{ required: true, message: "Vui lòng chọn phương tiện" }]}
          >
            <Select placeholder="Chọn phương tiện">
              {transportations.map((transportation) => (
                <Option key={transportation.id} value={transportation.id}>
                  {transportation.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {/* Description */}
          <Form.Item
            label="Mô tả tour"
            name="description"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mô tả chi tiết về tour",
              },
            ]}
          >
            <TextArea
              autoSize={{
                minRows: 4,
                maxRows: 7,
              }}
              placeholder="Nhập mô tả tour"
            />
          </Form.Item>
          {/* Information */}
          <Form.Item label="Thông tin: " name="information">
            <div className="form-information">
              <div className="if-input">
                <p>Điểm tham quan: </p>
                <Form.Item name="attractions">
                  <Input className="input" placeholder="Nhập thông tin" />
                </Form.Item>
              </div>
              <div className="if-input">
                <p>Ẩm thực: </p>
                <Form.Item name="cuisine">
                  <Input className="input" placeholder="Nhập thông tin" />
                </Form.Item>
              </div>
              <div className="if-input">
                <p>Thời gian thích hợp: </p>
                <Form.Item name="idealTime">
                  <Input className="input" placeholder="Nhập thông tin" />
                </Form.Item>
              </div>
              <div className="if-input">
                <p>Đối tượng thích hợp: </p>
                <Form.Item name="suitableObject">
                  <Input className="input" placeholder="Nhập thông tin" />
                </Form.Item>
              </div>
              <div className="if-input">
                <p>Phương tiện: </p>
                <Form.Item name="vehicle">
                  <Input className="input" placeholder="Nhập thông tin" />
                </Form.Item>
              </div>
              <div className="if-input">
                <p>Khuyến mại: </p>
                <Form.Item name="promotion">
                  <Input className="input" placeholder="Nhập thông tin" />
                </Form.Item>
              </div>
            </div>
          </Form.Item>
          {/* Schedule */}
          <div className="form-list-title">Lịch trình: </div>
          <div className="form-list">
            <Form.List
              name="schedule"
              initialValue={[{ title: "", information: "" }]}
              rules={[
                {
                  validator: async (_, schedule) => {
                    if (!schedule || schedule.length < 1) {
                      return Promise.reject(new Error("Chưa có lịch trình"));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <div key={key} className="schedule-item">
                      <Form.Item
                        label="Ngày"
                        name={[name, "day"]}
                        rules={[
                          { required: true, message: "Vui lòng nhập ngày" },
                        ]}
                        initialValue={name + 1}
                      >
                        <Input
                          placeholder="Nhập ngày"
                          disabled
                          value={name + 1}
                        />
                      </Form.Item>
                      <Form.Item
                        label="Tiêu đề"
                        name={[name, "title"]}
                        rules={[
                          { required: true, message: "Vui lòng nhập title" },
                        ]}
                      >
                        <Input placeholder="Nhập title" />
                      </Form.Item>
                      <Form.Item
                        label="Thông tin"
                        name={[name, "information"]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập thông tin",
                          },
                        ]}
                      >
                        <TextArea
                          autoSize={{ minRows: 3, maxRows: 6 }}
                          placeholder="Nhập thông tin"
                        />
                      </Form.Item>
                      <Space>
                        {fields.length > 1 && (
                          <Button
                            type="link"
                            onClick={() => remove(name)}
                            danger
                          >
                            Xóa
                          </Button>
                        )}
                      </Space>
                    </div>
                  ))}
                  <Space>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<UploadOutlined />}
                    >
                      Thêm lịch trình
                    </Button>
                  </Space>
                </>
              )}
            </Form.List>
          </div>
          {/* Tour Detail */}
          <div className="form-list-title">Chi tiết tour: </div>
          <div className="form-list tour-list">
            <Form.List
              name="tourDetail"
              initialValue={[
                {
                  adultPrice: "",
                  childrenPrice: "",
                  childPrice: "",
                  babyPrice: "",
                  singleRoomSupplementPrice: "",
                  stock: "",
                  discount: "",
                  dateRange: [],
                },
              ]}
              rules={[
                {
                  validator: async (_, tourDetail) => {
                    if (!tourDetail || tourDetail.length < 1) {
                      return Promise.reject(
                        new Error("Chưa có thông tin tour"),
                      );
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }) => (
                    <div key={key} className="tour-item">
                      <div className="item">
                        <Form.Item
                          label="Giá người lớn"
                          name={[name, "adultPrice"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập giá người lớn",
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            max={100000000}
                            step={1000}
                            formatter={currencyFormatter}
                            parser={currencyParser}
                            style={{ marginRight: 10, width: 300 }}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Giá trẻ em"
                          name={[name, "childrenPrice"]}
                        >
                          <InputNumber
                            min={0}
                            max={100000000}
                            step={1000}
                            formatter={currencyFormatter}
                            parser={currencyParser}
                            style={{ marginRight: 10, width: 300 }}
                          />
                        </Form.Item>
                      </div>
                      <div className="item">
                        <Form.Item
                          label="Giá trẻ nhỏ"
                          name={[name, "childPrice"]}
                        >
                          <InputNumber
                            min={0}
                            max={100000000}
                            step={1000}
                            formatter={currencyFormatter}
                            parser={currencyParser}
                            style={{ marginRight: 10, width: 300 }}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Giá trẻ sơ sinh"
                          name={[name, "babyPrice"]}
                        >
                          <InputNumber
                            min={0}
                            max={100000000}
                            step={1000}
                            formatter={currencyFormatter}
                            parser={currencyParser}
                            style={{ marginRight: 10, width: 300 }}
                          />
                        </Form.Item>
                      </div>
                      <div className="item">
                        <Form.Item
                          label="Phụ thu phòng đơn"
                          name={[name, "singleRoomSupplementPrice"]}
                        >
                          <InputNumber
                            min={0}
                            max={100000000}
                            step={1000}
                            formatter={currencyFormatter}
                            parser={currencyParser}
                            style={{ marginRight: 10, width: 300 }}
                          />
                        </Form.Item>
                        <Form.Item label="Giảm giá" name={[name, "discount"]}>
                          <InputNumber
                            min={0}
                            max={100}
                            step={1}
                            style={{ marginRight: 10, width: 300 }}
                          />
                        </Form.Item>
                      </div>
                      <div className="item">
                        <Form.Item
                          label="Stock"
                          name={[name, "stock"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số lượng",
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            max={1000}
                            step={1}
                            style={{ marginRight: 10, width: 300 }}
                          />
                        </Form.Item>
                        <Form.Item
                          label="Chọn khoảng thời gian"
                          name={[name, "dateRange"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn khoảng thời gian",
                            },
                          ]}
                        >
                          <RangePicker showTime />
                        </Form.Item>
                      </div>
                      <Space>
                        {fields.length > 1 && (
                          <Button
                            type="link"
                            onClick={() => remove(name)}
                            danger
                          >
                            Xóa
                          </Button>
                        )}
                      </Space>
                    </div>
                  ))}
                  <Space>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      icon={<PlusOutlined />}
                    >
                      Thêm chi tiết tour
                    </Button>
                  </Space>
                </>
              )}
            </Form.List>
          </div>
          {/* Images */}
          <Form.Item label="Tải ảnh">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              maxCount={9}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div>Chọn ảnh</div>
              </div>
            </Upload>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </Form>
      </Spin>
    </div>
  );
}

export default EditTour;
