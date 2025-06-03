import profile from "../../assets/images/profilePicture.png";
import { Dropdown, Button, message } from "antd";
import DropDown from "../../assets/svgs/drop-down.svg";
import DropUp from "../../assets/svgs/drop-up.svg";
import Exit from "../../assets/svgs/exit.svg";
import "./style.scss";
import { useEffect, useState } from "react";
import { logout } from "../../api/auth";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { get } from "../../utils/axios-http/axios-http";

 
const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const admin = useSelector((state) => state.admin.admin);
  

  const handlelogout = async () => {
    try {
      await logout();
      message.success("Đã đăng xuất");
      navigate("/login");
    } catch (error) {
      console.log(error);
      message.error("Đăng xuất thất bại");
    }
  };

  const menuItems = [
    {
      key: "1",
      label: "Đăng xuất",
      icon: <img src={Exit} alt="" />,
      onClick: handlelogout,
    },
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <header className="header">
      <div className="header__content">
        <div className="header__content--jamb"></div>
        <div className="header__content--profile">
          <img
            src={admin.avatar}
            alt="Profile picture"
            width={57}
            height={57}
            onClick={toggleDropdown}
          />
        </div>
        <div className="header__content--dropdown">
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
            open={isDropdownOpen}
            onOpenChange={(e) => setIsDropdownOpen(e)}
          >
            <Button className="header__btn" type="text">
              <div className="header__btn--infor">
                <p className="header__username">{admin.fullName}</p>
                <p className="header__role">{admin.roleName}</p>
              </div>
              <div className="header__icon">
                {isDropdownOpen ? (
                  <img src={DropUp} alt="" />
                ) : (
                  <img src={DropDown} alt="" />
                )}
              </div>
            </Button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};
export default Header;
