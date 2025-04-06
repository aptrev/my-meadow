import { getFirestore } from "firebase/firestore";
import app from '../firebase/FirebaseConfig.js'

const db = getFirestore(app);

export default db;