import { getAuth } from "firebase/auth";
import app from '../firebase/FirebaseConfig.js'

const auth = getAuth(app);

export default auth;