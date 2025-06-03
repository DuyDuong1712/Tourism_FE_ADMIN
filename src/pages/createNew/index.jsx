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
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUploadChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const fetchApi = async () => {
    try {
      setLoading(true);
      const categoriesData = await get("category/get-all-category");
      const departuresData = await get("departure/get-all-departure");
      const destinationsData = await get("destination/get-tree");
      const transportationsData = await get(
        "transportation/get-all-transportation"
      );
      setCategories(categoriesData.categories || []);
      setDepartures(departuresData.departures || []);
      setDestinations(destinationsData || []);
      setTransportations(transportationsData.transportations || []);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const onFinish = async () => {
    setLoading(true);
    const values = form.getFieldValue();
    const formData = new FormData();

    // Thêm các trường dữ liệu thông thường vào FormData
    formData.append("title", values.title || "");
    formData.append("isFeatured", values.isFeatured || false);
    formData.append("categoryId", values.categoryId || "");
    formData.append("destinationId", values.destinationId || "");
    formData.append("departureId", values.departureId || "");
    formData.append("transportationId", values.transportationId || "");

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
      })
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

    try {
      const response = await postForm("tours/create", formData);
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
  const renderDestinations = (items, level = 0) => {
    return items.map((destination) => (
      <>
        <Option key={destination.id} value={destination.id}>
          {`${"---".repeat(level)} ${destination.title}`}
        </Option>
        {destination.children && destination.children.length > 0 && (
          <>{renderDestinations(destination.children, level + 1)}</>
        )}
      </>
    ));
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
            rules={[{ required: true, message: "Vui lòng nhập title" }]}
          >
            <Input placeholder="Nhập title" />
          </Form.Item>

          {/* Category ID */}
          <Form.Item
            label="Danh mục"
            name="categoryId"
            rules={[{ required: true, message: "Vui lòng chọn category" }]}
          >
            <Select placeholder="Chọn category">
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.title}
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
                  {departure.title}
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
                  {transportation.title}
                </Option>
              ))}
            </Select>
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
                        new Error("Chưa có thông tin tour")
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
