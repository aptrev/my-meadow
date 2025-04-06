import { useContext } from "react";
import { AuthContext } from "../components/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import '../style/home.css';
import 'bootstrap/dist/css/bootstrap.css';
import AppContainer from "../components/AppContainer";

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
        <div className="hero-content flex-col">
          <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div className="card-body">
              <form onSubmit={handleFormSubmit}>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="input input-bordered"
                  />
                </div>
                <div className="form-control mt-6">
                  <button className="btn btn-primary">Login</button>
                </div>
              </form>
            </div>
            <Link to='/sign-up'>Don't have a log in, Sign Up</Link>
          </div>
        </div>
    </AppContainer>
  );
};

export default Login;