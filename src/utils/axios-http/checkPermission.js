import {
  useSelector
} from "react-redux";
import {
  useMemo
} from "react";

const useCheckPermission = (code) => {
  const permissions = useSelector((state) => state.admin.permissions);
  // const hasPermission = useMemo(() => {

  // }, [permissions, permissionName]);

  // return hasPermission;
  return permissions.includes(code);
};

export default useCheckPermission;