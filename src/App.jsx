import { useRoutes, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./pages/login";
import MainLayout from "./layouts/main-layout";
import Dashboard from "./pages/dashboard";
import Tour from "./pages/tour";
import Role from "./pages/roles";
import TourDetail from "./pages/tourDetail";
import CreateNew from "./pages/createNew";
import Category from "./pages/category";
import Destination from "./pages/destination";
import Departure from "./pages/departure";
import Order from "./pages/order";
import Transportation from "./pages/transportation";
import Permissions from "./pages/permissions";
import Account from "./pages/account";
import PrivateRoute from "./components/privateRoute";
import EditTour from "./pages/editTour/";
import checkPermission from "./utils/axios-http/checkPermission";
import OrderDetail from "./pages/order/detail";
import OrderEdit from "./pages/order/edit";

function App() {
  //PHÂN QUYỀN
  const routes = useRoutes([
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },
    {
      path: "login",
      element: <Login />,
    },
    {
      element: <PrivateRoute />,
      children: [
        {
          // Phân theo permission
          // element: <MainLayout />,
          // children: [
          //   {
          //     path: "/dashboard",
          //     element: <Dashboard />,
          //   },
          //   {
          //     path: "/tour",
          //     element: checkPermission("READ_TOUR") ? <Tour /> : <Dashboard />,
          //   },
          //   {
          //     path: "/categories",
          //     element: checkPermission("READ_CATEGORY") ? (
          //       <Category />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/departures",
          //     element: checkPermission("READ_DEPARTURE") ? (
          //       <Departure />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/destinations",
          //     element: checkPermission("READ_DESTINATION") ? (
          //       <Destination />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/transportations",
          //     element: checkPermission("READ_TRANSPORTATION") ? (
          //       <Transportation />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/orders",
          //     element: checkPermission("READ_ORDER") ? (
          //       <Order />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/orders/detail/:orderId",
          //     element: checkPermission("READ_ORDER") ? (
          //       <OrderDetail />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/orders/edit/:orderId",
          //     element: checkPermission("UPDATE_ORDER") ? (
          //       <OrderEdit />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/roles",
          //     element: checkPermission("READ_ROLES") ? <Role /> : <Dashboard />,
          //   },
          //   {
          //     path: "/permissions",
          //     element: checkPermission("READ_PERMISSIONS") ? (
          //       <Permissions />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/accounts",
          //     element: checkPermission("READ_ADMIN") ? (
          //       <Account />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/tour-detail/:tourID",
          //     element: checkPermission("READ_TOUR") ? (
          //       <TourDetail />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/create-new",
          //     element: checkPermission("CREATE_TOUR") ? (
          //       <CreateNew />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          //   {
          //     path: "/edit-tour/:tourId",
          //     element: checkPermission("UPDATE_TOUR") ? (
          //       <EditTour />
          //     ) : (
          //       <Dashboard />
          //     ),
          //   },
          // ],
          element: <MainLayout />,
          children: [
            {
              path: "/dashboard",
              element: <Dashboard />,
            },
            {
              path: "/tour",
              element: <Tour />,
            },
            {
              path: "/categories",
              element: <Category />,
            },
            {
              path: "/departures",
              element: <Departure />,
            },
            {
              path: "/destinations",
              element: <Destination />,
            },
            {
              path: "/transportations",
              element: <Transportation />,
            },
            {
              path: "/orders",
              element: <Order />,
            },
            {
              path: "/orders/detail/:orderId",
              element: <OrderDetail />,
            },
            {
              path: "/orders/edit/:orderId",
              element: <OrderEdit />,
            },
            {
              path: "/roles",
              element: <Role />,
            },
            {
              path: "/permissions",
              element: <Permissions />,
            },
            {
              path: "/accounts",
              element: <Account />,
            },
            {
              path: "/tour-detail/:tourID",
              element: <TourDetail />,
            },
            {
              path: "/create-new",
              element: <CreateNew />,
            },
            {
              path: "/edit-tour/:tourId",
              element: <EditTour />,
            },
          ],
        },
      ],
    },
  ]);


  return <>{routes}</>;
}

export default App;
