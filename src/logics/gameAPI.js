import {
  initializeAuth,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getReactNativePersistence,
} from "firebase/auth";
import {
  getFirestore,
  addDoc,
  updateDoc,
  getCountFromServer,
  serverTimestamp,
  collection,
  doc,
  query,
  where,
  and,
  or,
} from "firebase/firestore";
import { firebaseApp } from "../utils/firebase";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const auth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(firebaseApp);
const gameColl = collection(db, "games");
const gameDoc = (gameID) => doc(gameColl, gameID);

export const subscribeAuth = async (setUser) => {
  return onAuthStateChanged(auth, (user) => setUser(user));
};

export const signup = async ({ name, email, password }) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: name });
  console.log(auth.currentUser);
};

export const login = async ({ email, password }) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  console.log(result);
};

export const logout = async () => {
  await signOut(auth);
  console.log(auth.currentUser);
};

export const addGame = async (userID) => {
  return await addDoc(gameColl, {
    userID: userID,
    createdAt: serverTimestamp(),
    playerAnswer: "",
    computerAnswer: "",
  });
};

export const updateGameAnswer = async ({
  gameID,
  playerAnswer,
  computerAnswer,
}) => {
  await updateDoc(gameDoc(gameID), {
    playerAnswer: playerAnswer,
    computerAnswer: computerAnswer,
  });
};

export const getGameHistory = async () => {
  const queryScore = (player, computer) => {
    return and(
      where("playerAnswer", "==", player),
      where("computerAnswer", "==", computer)
    );
  };
  const queryPlayer = query(
    gameColl,
    or(
      queryScore("rock", "scissors"),
      queryScore("paper", "rock"),
      queryScore("scissors", "paper")
    )
  );
  const queryComputer = query(
    gameColl,
    or(
      queryScore("scissors", "rock"),
      queryScore("rock", "paper"),
      queryScore("paper", "scissors")
    )
  );
  const win = await getCountFromServer(queryPlayer);
  const lose = await getCountFromServer(queryComputer);
  console.log("win: ", win.data().count);
  console.log("lose: ", lose.data().count);
};
