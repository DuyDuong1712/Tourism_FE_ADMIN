import axios from "axios";

// const baseUrl =
//     import.meta.env.VITE_APP_URL_BE;
const baseUrl = "http://localhost:8080/travel/api/auth";

// Tạo instance axios riêng để có thể thêm interceptor
const axiosInstance = axios.create();

// Thêm interceptor để tự động refresh token
//Interceptor này được gọi trước khi request được gửi đi, dùng để:
// Gắn Authorization: Bearer < token > vào header.
// Nếu token sắp hết hạn(còn < 5 phút), thì gọi API / refresh để lấy token mới.
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            // Kiểm tra token có sắp hết hạn không (ví dụ: còn 5 phút)
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            // Nếu token còn 5 phút nữa hết hạn thì refresh
            if (expirationTime - currentTime < 5 * 60 * 1000) {
                try {
                    const response = await axios.post(`${baseUrl}/refresh`, {
                        token: token
                    });
                    const newToken = response.data.data.token;
                    localStorage.setItem("token", newToken);
                    config.headers.Authorization = `Bearer ${newToken}`;
                } catch (error) {
                    console.error('Lỗi khi refresh token:', error);
                    localStorage.removeItem("token");
                    window.location.href = '/login';
                }
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const login = async (data) => {
    try {
        const {
            username,
            password
        } = data;

        // Gọi API với axios và đợi phản hồi
        const response = await axiosInstance.post(`${baseUrl}/login`, {
            username,
            password,
        });

        // Lưu token vào localStorage nếu đăng nhập thành công
        const token = response.data.data.token;
        if (token) {
            await localStorage.setItem("token", token);
        }

        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Đã có lỗi khi đăng nhập. Vui lòng thử lại!');
    }
};

export const logout = async () => {
    try {
        const token = localStorage.getItem("token");
        await axiosInstance.post(`${baseUrl}/logout`, {
            token
        });
        localStorage.removeItem("token"); // Xóa token khỏi localStorage
        console.log('Đăng xuất thành công');
    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
        throw new Error('Đã có lỗi khi đăng xuất. Vui lòng thử lại!');
    }
};

// Export axiosInstance để có thể sử dụng ở các file khác
export { axiosInstance };