import React, { useEffect, useState } from "react";
import "./style.scss";
import { Table, Collapse } from "antd";
import { get } from "../../utils/axios-http/axios-http";
import { useParams } from "react-router-dom";
import Diadiem from "../../assets/images/diadiem.png";
import Amthuc from "../../assets/images/amthuc.png";
import Doituong from "../../assets/images/doituong.png";
import Thoigian from "../../assets/images/thoigian.png";
import Phuongtien from "../../assets/images/phuongtien.png";
import Khuyenmai from "../../assets/images/khuyenmai.png";
const { Panel } = Collapse;

function TourDetail() {
  const [tourDetail, setTourDetail] = useState(null);
  const { tourID } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await get(`tours/${tourID}/details`);
        setTourDetail(response.data);
        console.log("Tour ID:", tourID);
      } catch (error) {
        console.error("Error fetching tour details:", error);
      }
    };
    fetchData();
  }, [tourID]);

  const columns = [
    {
      title: "Mã tour",
      dataIndex: "code",
      key: "code",
      align: "center",
      render: () => tourID || "N/A", // Giả sử tourID là mã tour, vì không có trường code trong dữ liệu
    },
    {
      title: "Tên tour",
      dataIndex: "title",
      key: "title",
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "inActive",
      key: "inActive",
      align: "center",
      render: (inActive) => (inActive ? "Hoạt động" : "Không hoạt động"),
    },
    {
      title: "Nổi bật",
      dataIndex: "isFeatured",
      key: "isFeatured",
      align: "center",
      render: (isFeatured) => (isFeatured ? "Có" : "Không"),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      align: "center",
    },
    {
      title: "Điểm đến",
      dataIndex: "destination",
      key: "destination",
      align: "center",
    },
    {
      title: "Phương tiện",
      dataIndex: "transportation",
      key: "transportation",
      align: "center",
    },
    {
      title: "Điểm khởi hành",
      dataIndex: "departure",
      key: "departure",
      align: "center",
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      align: "center",
      render: (createdBy) => createdBy ?? "N/A", // Dữ liệu không cung cấp, đặt mặc định
    },
  ];

  const tourDetailsColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Giá người lớn",
      dataIndex: "adultPrice",
      key: "adultPrice",
      render: (price) =>
        price ? price.toLocaleString("vi-VN") + " VND" : "0 VND",
    },
    {
      title: "Giá trẻ em",
      dataIndex: "childrenPrice",
      key: "childrenPrice",
      render: (price) =>
        price ? price.toLocaleString("vi-VN") + " VND" : "0 VND",
    },
    {
      title: "Giá trẻ nhỏ",
      dataIndex: "childPrice",
      key: "childPrice",
      render: (price) =>
        price ? price.toLocaleString("vi-VN") + " VND" : "0 VND",
    },
    {
      title: "Giá em bé",
      dataIndex: "babyPrice",
      key: "babyPrice",
      render: (price) =>
        price ? price.toLocaleString("vi-VN") + " VND" : "0 VND",
    },
    {
      title: "Phụ phí phòng đơn",
      dataIndex: "singleRoomSupplementPrice",
      key: "singleRoomSupplementPrice",
      render: (price) =>
        price ? price.toLocaleString("vi-VN") + " VND" : "0 VND",
    },
    {
      title: "Số lượng chỗ",
      dataIndex: "stock",
      key: "stock",
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
      title: "Ngày khởi hành",
      dataIndex: "dayStart",
      key: "dayStart",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Ngày trở về",
      dataIndex: "dayReturn",
      key: "dayReturn",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
  ];

  if (!tourDetail) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tourdetail-container">
      <div className="tourdetail-content">
        <Table
          columns={columns}
          dataSource={[tourDetail]}
          rowKey={(record) => record.id || tourID}
          pagination={false}
          className="dashboard-table"
        />
        <div className="tour-information">
          <h1>Thông tin thêm về chuyến đi</h1>
          <div className="tour-information-item">
            <div className="item">
              <img src={Diadiem} alt="Điểm tham quan" />
              <h2>Điểm tham quan</h2>
              <p>
                {tourDetail.tourInformation?.attractions || "Chưa có thông tin"}
              </p>
            </div>
            <div className="item">
              <img src={Amthuc} alt="Ẩm thực" />
              <h2>Ẩm thực</h2>
              <p>
                {tourDetail.tourInformation?.cuisine || "Chưa có thông tin"}
              </p>
            </div>
            <div className="item">
              <img src={Doituong} alt="Đối tượng thích hợp" />
              <h2>Đối tượng thích hợp</h2>
              <p>
                {tourDetail.tourInformation?.suitableObject ||
                  "Chưa có thông tin"}
              </p>
            </div>
            <div className="item">
              <img src={Thoigian} alt="Thời gian lý tưởng" />
              <h2>Thời gian lý tưởng</h2>
              <p>
                {tourDetail.tourInformation?.idealTime || "Chưa có thông tin"}
              </p>
            </div>
            <div className="item">
              <img src={Phuongtien} alt="Phương tiện" />
              <h2>Phương tiện</h2>
              <p>
                {tourDetail.tourInformation?.vehicle || "Chưa có thông tin"}
              </p>
            </div>
            <div className="item">
              <img src={Khuyenmai} alt="Khuyến mãi" />
              <h2>Khuyến mãi</h2>
              <p>
                {tourDetail.tourInformation?.promotion || "Chưa có thông tin"}
              </p>
            </div>
          </div>
        </div>
        <div className="tour-schedule">
          <h1>Lịch Trình</h1>
          <Collapse accordion style={{ width: "90%", margin: "auto" }}>
            {tourDetail.tourSchedules?.length > 0 ? (
              tourDetail.tourSchedules.map((item) => (
                <Panel header={`Ngày ${item.day}: ${item.title}`} key={item.id}>
                  <p>{item.information || "Chưa có thông tin"}</p>
                </Panel>
              ))
            ) : (
              <p>Chưa có lịch trình</p>
            )}
          </Collapse>
        </div>
        <div className="tour-images">
          <h1>Hình ảnh chuyến đi</h1>
          <div className="image-gallery">
            {tourDetail.images?.length > 0 ? (
              tourDetail.images.map((image) => (
                <div className="image-item" key={image.id}>
                  <img
                    src={image.imageUrl}
                    alt={image.name || "Hình ảnh tour"}
                  />
                  <p>{image.name || "Hình ảnh tour"}</p>
                </div>
              ))
            ) : (
              <p>Chưa có hình ảnh</p>
            )}
          </div>
        </div>
        <div className="tour-details-table" style={{ textAlign: "center" }}>
          <h1>Chi tiết tour</h1>
          <Table
            columns={tourDetailsColumns}
            dataSource={tourDetail.tourDetails || []}
            rowKey="id"
            pagination={false}
            className="dashboard-table"
          />
        </div>
      </div>
    </div>
  );
}

export default TourDetail;
