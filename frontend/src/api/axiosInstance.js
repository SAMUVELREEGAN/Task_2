import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8000", // backend url
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor – attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem("refreshToken")

        const res = await axios.post(
          "http://localhost:8000/refresh",
          { token: refreshToken }
        )

        localStorage.setItem("accessToken", res.data.accessToken)

        originalRequest.headers.Authorization =
          "Bearer " + res.data.accessToken

        return api(originalRequest)
      } catch (err) {
        localStorage.clear()
        window.location.href = "/"
      }
    }

    return Promise.reject(error)
  }
)

export default api
