import { initializeApp } from "firebase/app";
import { getDatabase, set, ref,get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBtOl8CY4q5LRlu1_G1n3FLn56VdHj3jJw",
  authDomain: "news-sentiment-79aaa.firebaseapp.com",
  databaseURL: "https://news-sentiment-79aaa-default-rtdb.firebaseio.com",
  projectId: "news-sentiment-79aaa",
  storageBucket: "news-sentiment-79aaa.firebasestorage.app",
  messagingSenderId: "340640264436",
  appId: "1:340640264436:web:6f3b9d88905be3090aeea1"
};

const app = initializeApp(firebaseConfig);
const firebase = initializeApp(firebaseConfig);

export default firebase;

export const database = getDatabase(app);

export function register(registerData) {
  try {
    const dbb = getDatabase();
    set(ref(dbb, "NewsSentimentAnalysis/users/" + registerData.phoneNumber), {
      name: registerData.name,
      phoneNumber: registerData.phoneNumber,
      email: registerData.email,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
      userType: registerData.userType,
      secretKey:registerData.secretKey
    });
    return true;
  } catch (error) {
    return false;
  }
}

export const login = async (loginData) => {
  const { phoneNumber } = loginData;
  
  try {
    const db = getDatabase();
    const userRef = ref(db, `NewsSentimentAnalysis/users/${phoneNumber}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      // User exists
      const userData = snapshot.val();
      console.log("User found:", userData);
      return true; // User is registered
    } else {
      console.log("No user found with this phone number");
      return false; // User is not registered
    }
  } catch (error) {
    console.error("Error checking user:", error.message);
    return false; // Error occurred
  }
};
