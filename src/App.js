import React from "react";
import { HashRouter as Router, Routes, Route, RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import Home from "./pages/Home"
import Onboarding from "./pages/OnboardingPage";
import Indoor from "./pages/IndoorPage";
import Outdoor from "./pages/OutdoorPage";
import OutdoorEditPage from "./pages/OutdoorEditPage";
import MyMeadowCalendar from "./pages/CalendarPage";
import IndoorEdit from "./pages/IndoorEditPage";
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import Profile from "./pages/Profile"
import Header from './components/Header'
import AuthProvider from "./components/AuthProvider";
import ThemeProvider from './components/ThemeProvider'

import "@fontsource/inter"; // Defaults to weight 400
import "@fontsource/inter/400.css"; // Specify weight
import "@fontsource/inter/400-italic.css"; // Specify weight and style

import './style/home.css';
import 'bootstrap/dist/css/bootstrap.css';

const AppLayout = () => {
  return (
    <>
      <AuthProvider>
        <ThemeProvider>
          <div className='main position-relative d-flex flex-column overflow-hidden'>
            <Header />
            <Outlet />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/sign-up',
        element: <SignUp />
      },
      {
        path: '/profile/:id',
        element: <Profile />
      },
      {
        path: '/create',
        element: <Onboarding />,
      },
      {
        path: '/indoor',
        element: <Indoor />,
      },
      {
        path: '/indoor/:id',
        element: <Indoor />,
      },
      {
        path: '/indoor/:id/edit',
        element: <IndoorEdit />,
      },
      {
        path: '/outdoor',
        element: <Outdoor />,
      },
      {
        path: '/outdoor/:id',
        element: <Outdoor />,
      },
      {
        path: '/outdoor/:id/edit',
        element: <OutdoorEditPage />,
      },
      {
        path: '/calendar/:id',
        element: <MyMeadowCalendar />
      },
    ]
  }
])

function App() {

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

export default App;
