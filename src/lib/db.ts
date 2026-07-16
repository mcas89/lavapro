import { firestore, firebaseAuth } from "./firebase";
import { 
  collection, 
  doc, 
  addDoc as fsAddDoc, 
  updateDoc as fsUpdateDoc, 
  deleteDoc as fsDeleteDoc,
  getDocs as fsGetDocs,
  getDoc as fsGetDoc,
  setDoc as fsSetDoc
} from "firebase/firestore";

export type DocumentData = { id?: string; [key: string]: any };

class FirestoreDatabase {
  private getPath(collectionName: string) {
    const uid = firebaseAuth.currentUser?.uid;
    if (!uid) {
      throw new Error("Usuário não autenticado. Acesso negado ao banco de dados.");
    }
    return `tenants/${uid}/${collectionName}`;
  }

  // Obter todos os documentos (Uso único, não reativo)
  async getCollection<T extends DocumentData>(collectionName: string): Promise<T[]> {
    const querySnapshot = await fsGetDocs(collection(firestore, this.getPath(collectionName)));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  }

  // Obter um documento específico
  async getDoc<T extends DocumentData>(collectionName: string, id: string): Promise<T | undefined> {
    const docRef = doc(firestore, this.getPath(collectionName), id);
    const docSnap = await fsGetDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return undefined;
  }

  // Adicionar um novo documento com ID automático
  async addDoc<T extends DocumentData>(collectionName: string, data: Omit<T, "id">): Promise<T> {
    const colRef = collection(firestore, this.getPath(collectionName));
    const docRef = await fsAddDoc(colRef, data);
    return { id: docRef.id, ...data } as unknown as T;
  }

  // Definir um documento com ID específico (Sobrescreve se existir, cria se não)
  async setDoc<T extends DocumentData>(collectionName: string, id: string, data: Omit<T, "id">): Promise<void> {
    const docRef = doc(firestore, this.getPath(collectionName), id);
    await fsSetDoc(docRef, data);
  }

  // Atualizar um documento
  async updateDoc<T extends DocumentData>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(firestore, this.getPath(collectionName), id);
    await fsUpdateDoc(docRef, data as any);
  }

  // Deletar um documento
  async deleteDoc(collectionName: string, id: string): Promise<void> {
    const docRef = doc(firestore, this.getPath(collectionName), id);
    await fsDeleteDoc(docRef);
  }

}

// Instância Singleton exportada
export const db = new FirestoreDatabase();
