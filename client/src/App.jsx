import { Navigate, useRoutes } from "react-router"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Profile from "./pages/Profile"
import { Toaster } from 'react-hot-toast'
import { useContext } from "react"
import { AuthContext } from "../context/contexts"

const App = () => {

  const { authUser } = useContext(AuthContext)

  const routes = [
    {
      path: '/',
      element: authUser ? <Home /> : <Navigate to="/login" />,
    },
    {
      path: '/login',
      element: !authUser ? <Login /> : <Navigate to="/" />,
    },
    {
      path: '/profile',
      element: authUser ? <Profile /> : <Navigate to="/login" />,
    }
  ]

  const routeElements = useRoutes(routes);

  return (
    <div className="bg-[url('/bgImage.svg')] bg-contain">
      <Toaster />
      {routeElements}
    </div>
  )
}

export default App
