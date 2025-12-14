import { useState } from "react"
import api from "../api/axiosInstance"
import { useNavigate } from "react-router-dom"

export default function Login() {
  const [loginValue, setLoginValue] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!loginValue || !password) {
      return alert("All fields required")
    }

    try {
      const payload = { password }

      if (loginValue.includes("@")) {
        payload.email = loginValue
      } else {
        payload.ph_num = loginValue
      }

      await api.post("/login", payload)

      localStorage.setItem("login_id", loginValue)

      navigate("/otp")
    } catch (err) {
      alert(err.response?.data?.message || "Login failed")
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <input
        placeholder="Email or Phone Number"
        value={loginValue}
        onChange={(e) => setLoginValue(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  )
}
