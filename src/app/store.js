import {
  configureStore
} from '@reduxjs/toolkit'
import adminReducer from "../slice/adminSlice";

export default configureStore({
  reducer: {
    admin: adminReducer,
  }
})