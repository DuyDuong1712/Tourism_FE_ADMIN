/* eslint-disable no-unused-vars */
import { useSelector } from "react-redux";
import { useState } from "react";
import "./style.scss";
import { NavLink } from "react-router-dom";
import Logo from "../../assets/images/logo.png";
import Dashboardicon from "../../assets/images/16139673.png";
import Category from "../../assets/images/Category.png";
import Depature from "../../assets/images/depature.png";
import Destination from "../../assets/images/destination.png";
import Order from "../../assets/images/order.png";
import Role from "../../assets/images/role.png";
import Tour from "../../assets/images/tour.png";
import Transportations from "../../assets/images/transportations.png";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const title = "Trang chủ";

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  //Lấy danh sách permissions từ Redux store
  const permissions = useSelector((state) => state.admin.permissions);

  //Dữ liệu menu (navData)
  /**
        id: id duy nhất cho item.

        label: tên menu hiển thị.

        icon: icon hình ảnh đại diện cho menu.

        to: đường dẫn chuyển đến khi click.

        permission: quyền cần có để thấy menu này.
   */
  // const navData = [
  //   {
  //     id: 1,
  //     label: "Dashboard",
  //     icon: <img src={Dashboardicon} alt="" className="icon" />,
  //     to: "/dashboard",
  //     permission: "READ_DASHBOARD",
  //   },
  //   {
  //     id: 2,
  //     label: "Tours",
  //     icon: <img src={Tour} alt="" className="icon" />,
  //     to: "/tour",
  //     permission: "READ_TOUR",
  //   },
  //   {
  //     id: 3,
  //     label: "Category",
  //     icon: <img src={Category} alt="" className="icon" />,
  //     to: "/categories",
  //     permission: "READ_CATEGORY",
  //   },
  //   {
  //     id: 4,
  //     label: "Depature",
  //     icon: <img src={Depature} alt="" className="icon" />,
  //     to: "/departures",
  //     permission: "READ_DEPARTURE",
  //   },
  //   {
  //     id: 5,
  //     label: "Destination",
  //     icon: <img src={Destination} alt="" className="icon" />,
  //     to: "/destinations",
  //     permission: "READ_DESTINATION",
  //   },
  //   {
  //     id: 6,
  //     label: "Transportations",
  //     icon: <img src={Transportations} alt="" className="icon" />,
  //     to: "/transportations",
  //     permission: "READ_TRANSPORTATION",
  //   },
  //   {
  //     id: 7,
  //     label: "Order",
  //     icon: <img src={Order} alt="" className="icon" />,
  //     to: "/orders",
  //     permission: "READ_ORDER",
  //   },
  //   {
  //     id: 8,
  //     label: "Roles",
  //     icon: <img src={Role} alt="" className="icon" />,
  //     to: "/roles",
  //     permission: "READ_ROLES",
  //   },
  //   {
  //     id: 9,
  //     label: "Permissions",
  //     icon: <img src={Role} alt="" className="icon" />,
  //     to: "/permissions",
  //     permission: "READ_PERMISSIONS",
  //   },
  //   {
  //     id: 10,
  //     label: "Account",
  //     icon: <img src={Role} alt="" className="icon" />,
  //     to: "/accounts",
  //     permission: "READ_ADMIN",
  //   },
  // ];

  const navData = [
    {
      id: 1,
      label: "Dashboard",
      icon: <img src={Dashboardicon} alt="" className="icon" />,
      to: "/dashboard",
    },
    {
      id: 2,
      label: "Tours",
      icon: <img src={Tour} alt="" className="icon" />,
      to: "/tour",
    },
    {
      id: 3,
      label: "Category",
      icon: <img src={Category} alt="" className="icon" />,
      to: "/categories",
    },
    {
      id: 4,
      label: "Depature",
      icon: <img src={Depature} alt="" className="icon" />,
      to: "/departures",
    },
    {
      id: 5,
      label: "Destination",
      icon: <img src={Destination} alt="" className="icon" />,
      to: "/destinations",
    },
    {
      id: 6,
      label: "Transportations",
      icon: <img src={Transportations} alt="" className="icon" />,
      to: "/transportations",
    },
    {
      id: 7,
      label: "Order",
      icon: <img src={Order} alt="" className="icon" />,
      to: "/orders",
    },
    {
      id: 8,
      label: "Roles",
      icon: <img src={Role} alt="" className="icon" />,
      to: "/roles",
    },
    {
      id: 9,
      label: "Permissions",
      icon: <img src={Role} alt="" className="icon" />,
      to: "/permissions",
    },
    {
      id: 10,
      label: "Account",
      icon: <img src={Role} alt="" className="icon" />,
      to: "/accounts",
    },
  ];

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  //Hàm xử lý class active cho menu
  //Dùng để gán class CSS active nếu trang hiện tại đúng với link sidebar (dùng cho style menu đang được chọn).
  const getClassActive = ({ isActive }) => {
    return isActive ? "active" : "";
  };

  return (
    // <div className={`${isCollapsed ? "collapsed" : ""}`}>
    //   <div className="sidebar">
    //     <NavLink to="/" className="sidebar__header flex-aline-center">
    //       <img
    //         src={Logo}
    //         alt="logo hit with gradient border"
    //         className="sidebar__header--logo"
    //       />
    //       <strong className="sidebar__header--title">{title}</strong>
    //     </NavLink>

    //     <nav className="sidebar__nav">
    //       <ul>
    //         {/* Phân quyền */}
    //         {/* {navData.map(
    //         (navItem) =>
    //           hasPermission(navItem.permission) && (
    //             <li className="sidebar__nav--item" key={navItem.id}>
    //               <NavLink
    //                 key={navItem.id}
    //                 to={navItem.to}
    //                 className={({ isActive }) =>
    //                   `flex-aline-center ${getClassActive({ isActive })}`
    //                 }
    //               >
    //                 {navItem.icon}
    //                 <strong>{navItem.label}</strong>
    //               </NavLink>
    //             </li>
    //           )
    //       )} */}
    //         {navData.map((navItem) => (
    //           <li className="sidebar__nav--item" key={navItem.id}>
    //             <NavLink
    //               to={navItem.to}
    //               className={({ isActive }) =>
    //                 `flex-aline-center ${getClassActive({ isActive })}`
    //               }
    //             >
    //               {navItem.icon}
    //               <strong>{navItem.label}</strong>
    //             </NavLink>
    //           </li>
    //         ))}
    //       </ul>
    //     </nav>
    //   </div>
    // </div>

    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button className="sidebar__toggle" onClick={toggleSidebar}>
        {isCollapsed ? "→" : "←"}
      </button>
      <NavLink to="/dashboard" className="sidebar__header flex-aline-center">
        <img
          src={Logo}
          alt="logo hit with gradient border"
          className="sidebar__header--logo"
        />
        {!isCollapsed && (
          <strong className="sidebar__header--title">{title}</strong>
        )}
      </NavLink>

      <nav className="sidebar__nav">
        <ul>
          {/* Phân quyền */}
          {/* {navData.map(
            (navItem) =>
              hasPermission(navItem.permission) && (
                <li className="sidebar__nav--item" key={navItem.id}>
                  <NavLink
                    key={navItem.id}
                    to={navItem.to}
                    className={({ isActive }) =>
                      `flex-aline-center ${getClassActive({ isActive })}`
                    }
                  >
                    {navItem.icon}
                    <strong>{navItem.label}</strong>
                  </NavLink>
                </li>
              )
          )} */}
          {navData.map((navItem) => (
            <li className="sidebar__nav--item" key={navItem.id}>
              <NavLink
                to={navItem.to}
                className={({ isActive }) =>
                  `flex-aline-center ${getClassActive({ isActive })}`
                }
              >
                {navItem.icon}
                {!isCollapsed && <strong>{navItem.label}</strong>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
