import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
const firebaseConfig = {
    apiKey: "AIzaSyAh17Vfids1iNfZx3VgsHrmOrC81c9SSns",
    authDomain: "study-habit-tracker-78b96.firebaseapp.com",
    projectId: "study-habit-tracker-78b96",
    storageBucket: "study-habit-tracker-78b96.firebasestorage.app",
    messagingSenderId: "1042991377143",
    appId: "1:1042991377143:web:367144ef9d61691bb4c1f2",
    measurementId: "G-2MF795SK2N"
};


const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const generteTOken = async () => {
    const permission = await Notification.requestPermission()
    console.log(permission);

    if (permission === 'granted') {
        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,

        })
        return token

    }


}