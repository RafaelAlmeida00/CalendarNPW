import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "../../config/firebase/firebase";
import FirestoreProvider from "../provider/provider";

export const GetTokenAndVerify = async () => {
  return new Promise((resolve) => {
    const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const decodedToken = await user.getIdTokenResult();
          console.log(decodedToken);
          const id = decodedToken.claims.user_id as string;

          if (!id) return resolve(false);
          const provider = new FirestoreProvider();
          const userRef = await provider.get("users", id);
          console.log(userRef);
          return resolve(userRef || false);
        } catch (error) {
          console.error("Token verification failed:", error);
          return resolve(false);
        }
      } else {
        return resolve(false);
      }
    });
  });
};

export const DeleteToken = () => {
  localStorage.removeItem("token");
};

export const Login = async (email: string, password: string) => {
  const auth = getAuth();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    ); // Retorna a Promise
    const user = userCredential.user;
    const token = await user.getIdToken();
    console.log(user);
    console.log(token);
    return token;
  } catch (error: any) {
    console.error("Erro no login: ", error.message);
    throw error; // Lança o erro para ser tratado onde a função for chamada
  }
};

export const SignUp = async (
  email: any,
  password: any,
  additionalData: any
) => {
  const auth = getAuth();

  // Retorna a Promise para permitir o tratamento do erro onde a função for chamada
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Salvar informações do usuário no Firestore
    await setDoc(doc(firestore, "users", user.uid), {
      email: user.email,
      ...additionalData,
    });

    console.log("Usuário criado e salvo no Firestore!");
  } catch (error: any) {
    console.error("Erro ao criar usuário: ", error.message);
    throw error; // Lança o erro para ser tratado onde a função for chamada
  }
};

export const SendLoginEmail = (email: any) => {
  const auth = getAuth();

  sendPasswordResetEmail(auth, email)
    .then(() => {
      console.log("E-mail de login enviado!");
    })
    .catch((error: { message: any }) => {
      console.error("Erro ao enviar o e-mail: ", error.message);
    });
};

export function verificarEmail(email: string) {
  // Regex para emails pessoais
  const regexPessoal =
    /^[a-zA-Z0-9._%+-]+@(gmail\.com|hotmail\.com|yahoo\.com)$/;
  // Regex para emails corporativos
  const regexCorporativo =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|int|co|uk|br|jp|mx|ar|us)$/;

  if (regexPessoal.test(email)) {
    return "Pessoal";
  } else if (regexCorporativo.test(email)) {
    return "Corporativo";
  } else {
    return "Indeterminado";
  }
}
