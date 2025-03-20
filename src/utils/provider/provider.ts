import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  setDoc,
} from "firebase/firestore";
import { firestore } from "../../config/firebase/firebase";

class FirestoreProvider {
  [x: string]: any;
  constructor() {
    this.db = firestore;
  }

 // Função get: Recupera documentos, pode filtrar por chave/valor ou buscar por ID
async get(collectionName: string, id?: string, filter = null) {
  if (id) {
    // Busca diretamente pelo ID do documento
    const docRef = doc(this.db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null; // Documento não encontrado
    }
  }

  const colRef = collection(this.db, collectionName);
  let q;

  if (filter) {
    const { key, value } = filter;
    q = query(colRef, where(key, "==", value));
  } else {
    q = query(colRef);
  }

  const querySnapshot = await getDocs(q);
  const docs: { id: string }[] = [];
  querySnapshot.forEach((docSnapshot) => {
    docs.push({ id: docSnapshot.id, ...docSnapshot.data() });
  });

  return docs;
}


  async create(collectionName: string, data: any, customId?: string) {
    const colRef = collection(this.db, collectionName);

    if (customId) {
      const docRef = doc(colRef, customId);
      await setDoc(docRef, data);
      return { id: customId, ...data };
    } else {
      const docRef = await addDoc(colRef, data);
      return { id: docRef.id, ...data };
    }
  }

  // Função update: Atualiza um documento baseado no ID
  async update(collectionName: string, id: string, data: any) {
    const docRef = doc(this.db, collectionName, id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      throw new Error(`Documento com id ${id} não encontrado.`);
    }

    await updateDoc(docRef, data);
    return { id, ...data };
  }

  // Função delete: Deleta um documento baseado no ID
  async delete(collectionName: string, id: string) {
    const docRef = doc(this.db, collectionName, id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      throw new Error(`Documento com id ${id} não encontrado.`);
    }

    await deleteDoc(docRef);
    return { id };
  }

  // Função getMany: Recupera múltiplos documentos baseados em um filtro
  async getMany(collectionName: string, filters = []) {
    const colRef = collection(this.db, collectionName);
    let q = query(colRef);

    filters.forEach((filter) => {
      const { key, value } = filter;
      q = query(q, where(key, "==", value));
    });

    const querySnapshot = await getDocs(q);
    const docs: any = [];
    querySnapshot.forEach((docSnapshot) => {
      docs.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });

    return docs;
  }

  // Função createMany: Cria múltiplos documentos
  async createMany(collectionName: string, dataArray: any[]) {
    const batch = writeBatch(this.db);
    const colRef = collection(this.db, collectionName);

    dataArray.forEach((data: any) => {
      const docRef = doc(colRef);
      batch.set(docRef, data);
    });

    await batch.commit();
    return dataArray;
  }

  // Função updateMany: Atualiza múltiplos documentos
  async updateMany(collectionName: string, dataArray: any) {
    const batch = writeBatch(this.db);

    for (const { id, ...data } of dataArray) {
      const docRef = doc(this.db, collectionName, id);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        throw new Error(`Documento com id ${id} não encontrado.`);
      }

      batch.update(docRef, data);
    }

    await batch.commit();
    return dataArray;
  }

  // Função deleteMany: Deleta múltiplos documentos
  async deleteMany(collectionName: string, ids: any[]) {
    const batch = writeBatch(this.db);

    ids.forEach((id: string) => {
      const docRef = doc(this.db, collectionName, id);
      batch.delete(docRef);
    });

    await batch.commit();
    return ids;
  }
}

export default FirestoreProvider;
