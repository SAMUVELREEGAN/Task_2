export default function Dashboard() {
  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("login_id")

    window.location.href = "/"
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <p>coomple</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
