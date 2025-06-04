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
import { useNavigate } from "react-router-dom";
import {
  UploadOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { get, postForm } from "../../utils/axios-http/axios-http";
import "./style.scss";
const { TextArea } = Input;
const { RangePicker } = DatePicker;

function CreateNew() {
  const [form] = Form.useForm();
  const { Option } = Select;
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [transportations, setTransportations] = useState([]);
  const [description, setDescription] = useState("");
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
      const categoriesData = await get("categories");
      const departuresData = await get("departures");
      const destinationsData = await get("destinations");
      const transportationsData = await get("transportations");
      setCategories(categoriesData.data || []);
      setDepartures(departuresData.data || []);
      setDestinations(buildTree(destinationsData.data) || []);
      setTransportations(transportationsData.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  // Khi nhấn nút tạo tour
  const onFinish = async () => {
    setLoading(true);
    const values = form.getFieldValue();
    const formData = new FormData();

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
        vehicle: values.vehicle || "",
        promotion: values.promotion || "",
        suitableObject: values.suitableObject || "",
      }),
    );

    // Thêm lịch trình vào FormData (nếu có)
    formData.append("schedule", JSON.stringify(values.schedule || []));

    // Thêm chi tiết tour
    const tourDetailFormat = values.tour_detail.map((item) => ({
      ...item,
      dayStart: item.dateRange[0],
      dayReturn: item.dateRange[1],
    }));
    formData.append("tour_detail", JSON.stringify(tourDetailFormat || []));

    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });

    // Log FormData
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await postForm("tours", formData);
      if (response) {
        message.success("Tạo mới tour thành công!");
        setLoading(false);
        form.resetFields();
        navigate("/tour");
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error);
      message.error("Tạo mới tour thất bại, vui lòng thử lại!");
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
      <Spin
        indicator={<LoadingOutlined spin />}
        spinning={loading}
        size="large"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="creatnew-form"
        >
          {/* Title */}
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tên tour" }]}
          >
            <Input placeholder="Nhập tên tour" />
          </Form.Item>

          {/* Category ID */}
          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
          >
            <Select placeholder="Chọn category">
              {categories
                .filter((category) => category.inActive)
                .map((category) => (
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
              {departures
                .filter((departure) => departure.inActive)
                .map((departure) => (
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
            <Select
              style={{ width: 200, marginBottom: 20 }}
              placeholder="Chọn điểm đến"
              allowClear
            >
              <Option value="">Tất cả</Option>
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
              {transportations
                .filter((t) => t.inActive)
                .map((transportation) => (
                  <Option key={transportation.id} value={transportation.id}>
                    {transportation.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          {/* Title */}
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
          <div className="form-list-title">Thông tin: </div>
          <Form.Item name="information">
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
                <p>Ưu đãi: </p>
                <Form.Item name="promotion">
                  <Input className="input" placeholder="Nhập thông tin" />
                </Form.Item>
              </div>
            </div>
          </Form.Item>

          {/* Schedule */}
          <div className="form-list-title">Lịch trình: </div>
          <div className="form-list">
            {/* //Đây là thành phần dùng để xử lý mảng giá trị trong Form (ví dụ: nhiều ngày lịch trình). */}
            {/* name="schedule": tên trường mảng trong form, sẽ tạo ra một mảng */}
            {/* schedule = [{(day, title, information)}, ...]. */}
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
              {/* fields: danh sách các trường hiện có trong mảng schedule. Mỗi field có key và name. 
              add(): thêm một phần tử mới vào mảng.
              remove(name): xóa phần tử tại vị trí name. */}
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name }, index) => (
                    <div key={key} className="schedule-item">
                      <Form.Item
                        label="Ngày"
                        name={[name, "day"]}
                        rules={[
                          { required: true, message: "Vui lòng nhập ngày" },
                        ]}
                        initialValue={index + 1}
                      >
                        <InputNumber placeholder="Nhập" />
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
                          autoSize={{
                            minRows: 3,
                            maxRows: 6,
                          }}
                          placeholder="Nhập thông tin"
                        />
                      </Form.Item>

                      {fields.length > 1 && (
                        <Button type="link" onClick={() => remove(name)} danger>
                          Xóa
                        </Button>
                      )}
                    </div>
                  ))}
                  {/* Thêm một ngày lịch trình mới, mặc định các giá trị sẽ là
                  undefined hoặc rỗng. */}
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
              name="tour_detail"
              label="Thông tin chi tiết từng tour"
              initialValue={[
                {
                  adultPrice: "",
                  childrenPrice: "",
                  childPrice: "",
                  babyPrice: "",
                  singleRoomSupplementPrice: "",
                  stock: "10",
                  discount: "0",
                  dayStart: "",
                  dayReturn: "",
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
                          rules={[
                            {
                              required: false,
                              message: "Vui lòng nhập giá trẻ em",
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
                      </div>
                      <div className="item">
                        <Form.Item
                          label="Giá trẻ nhỏ"
                          name={[name, "childPrice"]}
                          rules={[
                            {
                              required: false,
                              message: "Vui lòng nhập giá trẻ nhỏ",
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
                          label="Giá trẻ sơ sinh"
                          name={[name, "babyPrice"]}
                          rules={[
                            {
                              required: false,
                              message: "Vui lòng nhập giá trẻ sơ sinh",
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
                      </div>
                      <div className="item">
                        <Form.Item
                          label="Phụ thu phòng đơn"
                          name={[name, "singleRoomSupplementPrice"]}
                          rules={[
                            {
                              required: false,
                              message: "Vui lòng nhập giá phụ thu phòng đơn",
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
                          label="Giảm giá"
                          name={[name, "discount"]}
                          rules={[
                            {
                              required: false,
                              message: "Vui lòng nhập phần trăm giảm giá",
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

                        {/* Ngày đi */}
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
                    ></Button>
                  </Space>
                </>
              )}
            </Form.List>
          </div>

          {/* Images */}
          <Form.Item
            label=""
            name={[name, "image"]}
            rules={[{ required: true, message: "Vui lòng tải lên ảnh" }]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              maxCount={9}
              beforeUpload={() => false}
              accept="image/*"
              multiple
            >
              <div>
                <UploadOutlined />
                <div>Chọn ảnh</div>
              </div>
            </Upload>
          </Form.Item>

          <Button loading={loading} type="primary" htmlType="submit">
            Tạo Tour
          </Button>
        </Form>
      </Spin>
    </div>
  );
}

export default CreateNew;
