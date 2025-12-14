import { useState } from "react"
import api from "../api/axiosInstance"
import { useNavigate } from "react-router-dom"

export default function Otp() {
  const [otp, setOtp] = useState("")
  const navigate = useNavigate()

  const handleVerifyOtp = async () => {
    if (!otp) return alert("Enter OTP")

    try {
      const loginId = localStorage.getItem("login_id")

      const payload =
        loginId.includes("@")
          ? { email: loginId, otp }
          : { ph_num: loginId, otp }

      const res = await api.post("/verify-otp", payload)

      localStorage.setItem("accessToken", res.data.accessToken)
      localStorage.setItem("refreshToken", res.data.refreshToken)

      navigate("/dashboard")
    } catch (err) {
      alert(err.response?.data?.message || "OTP failed")
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>OTP Verification</h2>

      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <br /><br />

      <button onClick={handleVerifyOtp}>Verify</button>
    </div>
  )
}
