import { useContext, useState } from "react";
import { AuthContext } from "../components/AuthProvider";
import { updateProfile } from "firebase/auth";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import db from '../firebase/FirebaseDB'
import { Link, useNavigate } from "react-router-dom";
import AppContainer from "../components/AppContainer/AppContainer";
import logo from '../assets/images/logos/logo-sign-in.PNG';

const init_garden = {
  id: null,
  location: 'outdoor',
  name: 'Start Designing',
  width: 10,
  height: 10,
  dimensions_units: 'ft',
  stage: {
    width: 700,
    height: 700
  },
  plots: [],
  plants: []
}

const SignUp = () => {
  const { createUser, user, loading } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  // If authentication is still loading, display a loading indicator
  if (loading) {
    return (
      <span className="loading loading-dots loading-lg flex item-center mx-auto"></span>
    );
  }

  // If the user is already authenticated, redirect to the home page
  if (user) {
    navigate("/");
  }

  // Add extended profile to database.
  const createProfile = async (name, email, password, result) => {
    try {
      const gardensRef = await addDoc(collection(db, 'gardens'), init_garden)
      await setDoc(gardensRef, { id: gardensRef.id })

      const userRef = doc(db, 'users', result.user.uid);

      await setDoc(userRef, {
        uid: result.user.uid,
        display_name: name,
        email: email,
        date_created: Date.now(),
        photoUrl: null,
        gardens: [gardensRef.id]
      });

      console.log("Document written with ID: ", userRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  // Handle form submission for user registration
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    createUser(email, password)
      .then((result) => {
        // Update user profile with display name
        updateProfile(result.user, {
          displayName: name,
        });

        // Add extended profile to database.
        createProfile(name, email, password, result);

        navigate("/");
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
    e.target.reset();
  };

  // Render the sign-up form
  return (
    <AppContainer>
      <div className="login-background d-flex justify-content-center align-items-center">
        <div className="login-box text-center shadow-sm">
          <img src={logo} alt="MyMeadow Logo" className="logo-img mb-3" />
          <h5 className="mb-4">Create your account</h5>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group text-start mb-3">
              <label>Name</label>
              <input
                type="text"
                name="name"
                className="form-control rounded"
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group text-start mb-3">
              <label>Email</label>
              <input
                type="email"
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
            <button className="btn btn-dark rounded-pill mt-3 mb-3">Sign Up</button>
            <p className='sign-up-cta'>Have have an account? <Link to='/login'>Login Here</Link>.</p>
          </form>
        </div>
      </div>
    </AppContainer>
  );
};

export default SignUp;