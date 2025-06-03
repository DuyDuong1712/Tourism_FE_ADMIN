// src/slice/adminSlice.js

import {
  createSlice
} from '@reduxjs/toolkit';

const initialState = {
  admin: {
    id: null,
    userName: '',
    fullName: '',
    avatar: '',
    role: '',
  },
  permissions: [],
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    //Thêm thông tin admin vào Redux store.
    setAdminInfo: (state, action) => {
      state.admin.id = action.payload.id;
      state.admin.userName = action.payload.userName;
      state.admin.fullName = action.payload.fullName;
      state.admin.avatar = action.payload.avatar;
      state.admin.role = action.payload.role;
    },
    //Thêm danh sách quyền vào Redux store.
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    //Xóa sạch thông tin admin và danh sách quyền (thường dùng khi đăng xuất).
    clearAdminInfo: (state) => {
      state.admin = {
        id: null,
        userName: '',
        fullName: '',
        avatar: '',
        role: '',
      };
      state.permissions = [];
    },
  },
});

export const {
  setAdminInfo,
  setPermissions,
  clearAdminInfo
} = adminSlice.actions;

export default adminSlice.reducer;