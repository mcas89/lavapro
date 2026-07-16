import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { firestore, firebaseAuth } from "@/lib/firebase";
import { type DocumentData } from "@/lib/db";

/**
 * Hook para buscar dados de uma coleção do Firestore em TEMPO REAL.
 * Toda vez que houver alteração no Firestore, os componentes serão atualizados magicamente.
 */
export function useCollection<T extends DocumentData>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
      if (!user) {
        setData([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const q = query(collection(firestore, `tenants/${user.uid}/${collectionName}`));

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        setData(documents);
        setLoading(false);
      }, (error) => {
        console.error("Erro ao buscar coleção em tempo real:", collectionName, error);
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [collectionName]);

  return { data, loading };
}
