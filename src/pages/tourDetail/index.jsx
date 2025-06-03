import React, { useEffect, useState } from 'react'
import './style.scss'
import { Table, Collapse } from 'antd';
import { get } from '../../utils/axios-http/axios-http';
import { useParams } from 'react-router-dom';
import Diadiem from '../../assets/images/diadiem.png'
import Amthuc from '../../assets/images/amthuc.png'
import Doituong from '../../assets/images/doituong.png'
import Thoigian from '../../assets/images/thoigian.png'
import Phuongtien from '../../assets/images/phuongtien.png'
import Khuyenmai from '../../assets/images/khuyenmai.png'
const { Panel } = Collapse;

function TourDetail() {
    const [tourDetail, setTourDetail] = useState();
    const { tourID } = useParams();
    useEffect(() => {
        const fetchData = async () => {
            const respone = await get(`tours/detail/${tourID}`);
            setTourDetail(respone);
            console.log(tourID);

        };
        fetchData();
    }, [tourID]);

    const columns = [
        {
            title: 'Tên tour',
            dataIndex: ['tour', 'title'],
            key: 'title',
        },
        {
            title: 'Mã tour',
            dataIndex: ['tour', 'code'],
            key: 'code',
        },
        {
            title: 'Trạng thái',
            dataIndex: ['tour', 'status'],
            key: 'status',
            render: (status) => (status ? 'Hoạt động' : 'Không hoạt động'),
        },
        {
            title: 'Slug',
            dataIndex: ['tour', 'slug'],
            key: 'slug',
        },
        {
            title: 'Nổi bật',
            dataIndex: ['tour', 'isFeatured'],
            key: 'isFeatured',
            render: (isFeatured) => (isFeatured ? 'Có' : 'Không'),
        },
        {
            title: 'Điểm đến',
            dataIndex: ['destination', 'title'],
            key: 'destinationId',
        },
        {
            title: 'Phương tiện',
            dataIndex: ['transportation', 'title'],
            key: 'transportationId',
        },
        {
            title: 'Điểm khởi hành',
            dataIndex: ['departure', 'title'],
            key: 'departureId',
        },
        {
            title: 'Người tạo',
            dataIndex: ['tour', 'createdBy'],
            key: 'createdBy',
        },
    ];
    const tourDetailsColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Giá người lớn',
            dataIndex: 'adultPrice',
            key: 'adultPrice',
            render: (price) => price.toLocaleString() + ' VND',
        },
        {
            title: 'Giá trẻ em',
            dataIndex: 'childrenPrice',
            key: 'childrenPrice',
            render: (price) => price.toLocaleString() + ' VND',
        },
        {
            title: 'Giá trẻ nhỏ',
            dataIndex: 'childPrice',
            key: 'childPrice',
            render: (price) => price.toLocaleString() + ' VND',
        },
        {
            title: 'Giá em bé',
            dataIndex: 'babyPrice',
            key: 'babyPrice',
            render: (price) => price.toLocaleString() + ' VND',
        },
        {
            title: 'Phụ phí phòng đơn',
            dataIndex: 'singleRoomSupplementPrice',
            key: 'singleRoomSupplementPrice',
            render: (price) => price.toLocaleString() + ' VND',
        },
        {
            title: 'Số lượng chỗ',
            dataIndex: 'stock',
            key: 'stock',
        },
        {
            title: 'Ngày khởi hành',
            dataIndex: 'dayStart',
            key: 'dayStart',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Ngày trở về',
            dataIndex: 'dayReturn',
            key: 'dayReturn',
            render: (date) => new Date(date).toLocaleDateString(),
        },
    ];

    return (
        <div className='tourdetail-container'>
            <div className="tourdetail-content">
                <Table
                    columns={columns}
                    dataSource={tourDetail ? [tourDetail] : []}
                    rowKey={(record) => record.tour.id}
                    pagination={false}
                    className='dashboard-table'
                />
                <div className="tour-information">
                    <h1>Thông tin thêm về chuyến đi</h1>
                    <div className="tour-information-item">
                        <div className="item">
                            <img src={Diadiem} alt="" />
                            <h2>Điểm tham quan</h2>
                            <p>{tourDetail?.information?.attractions}</p>
                        </div>
                        <div className="item">
                            <img src={Amthuc} alt="" />
                            <h2>Ẩm thực</h2>
                            <p>{tourDetail?.information?.cuisine}</p>
                        </div>
                        <div className="item">
                            <img src={Doituong} alt="" />
                            <h2>Đối tượng thích hợp</h2>
                            <p>{tourDetail?.information?.suitableObject}</p>
                        </div>
                        <div className="item">
                            <img src={Thoigian} alt="" />
                            <h2>Thời gian lý tưởng</h2>
                            <p>{tourDetail?.information?.idealTime}</p>
                        </div>
                        <div className="item">
                            <img src={Phuongtien} alt="" />
                            <h2>Phương tiện</h2>
                            <p>{tourDetail?.information?.vehicle}</p>
                        </div>
                        <div className="item">
                            <img src={Khuyenmai} alt="" />
                            <h2>Khuyến mãi</h2>
                            <p>{tourDetail?.information?.promotion}</p>
                        </div>
                    </div>
                </div>
                {/* Lịch Trình */}
                <div className="tour-schedule">
                    <h1>Lịch Trình</h1>
                    <Collapse accordion style={{ width: '90%', margin: 'auto' }}>
                        {tourDetail?.schedule?.map((item) => (
                            <Panel header={`Ngày ${item.day}: ${item.title}`} key={item.id}>
                                <p>{item.information}</p>
                            </Panel>
                        ))}
                    </Collapse>
                </div>
                <div className="tour-images">
                    <h1>Hình ảnh chuyến đi</h1>
                    <div className="image-gallery">
                        {tourDetail?.images?.map((image) => (
                            <div className="image-item" key={image.id}>
                                <img src={image.source} alt={image.name} />
                                <p>{image.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="tour-details-table" style={{ textAlign: 'center' }}>
                    <h1>Chi tiết tour</h1>
                    <Table
                        columns={tourDetailsColumns}
                        dataSource={tourDetail?.tourDetails}
                        rowKey="id"
                        pagination={false}
                        className='dashboard-table'
                    />
                </div>
            </div>
        </div>
    )
}

export default TourDetail;