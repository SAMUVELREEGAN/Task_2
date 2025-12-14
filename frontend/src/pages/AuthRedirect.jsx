import { Navigate } from "react-router-dom"

export default function AuthRedirect({ children }) {
  const token = localStorage.getItem("accessToken")

  // token irundha login page ku pogakoodathu
  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
