import { useContext } from "react";
import { AuthContext } from "../components/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import '../style/home.css';
import 'bootstrap/dist/css/bootstrap.css';
import AppContainer from "../components/AppContainer/AppContainer";
import logo from '../assets/images/logos/logo-sign-in.PNG';

import "../App.css";

const Login = () => {
  const { loginUser, loading, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // If authentication is still loading, display a loading indicator
  // if (loading) {
  //   return (
  //     <span className="loading loading-dots loading-lg flex item-center mx-auto"></span>
  //   );
  // }

  // If the user is already authenticated, redirect to the home page
  if (user) {
    navigate("/");
  }

  // Handle form submission for user login
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    loginUser(email, password)
      .then((result) => {
        navigate("/");
      })
      .catch((error) => console.log(error.message));

    e.target.reset();
  };

  // Render the login form
  return (
    <AppContainer>
      <div className="login-background d-flex justify-content-center align-items-center">
        <div className="login-box text-center shadow-sm">
          <img src={logo} alt="MyMeadow Logo" className="logo-img mb-3" />
          <h5 className="mb-4">Please sign in to continue</h5>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group text-start mb-3">
              <label>Email</label>
              <input
                type="text"
                name="email"
                className="form-control rounded"
                placeholder="Enter your email"
              />
            </div>
            <div className="form-group text-start mb-3">
              <label>Password</label>
              <input
                type="password"
                name="password"
                className="form-control rounded"
                placeholder="Enter your password"
              />
            </div>
            <button className="btn btn-dark rounded-pill mt-3 mb-3">Sign In</button>
            <Link to="/sign-up" className="d-block small">Forgot password?</Link>
            <p className='sign-up-cta'>Don't have an account? <Link to='/sign-up'>Sign Up Now!</Link></p>
          </form>
        </div>
      </div>
    </AppContainer>
  );
};

export default Login;