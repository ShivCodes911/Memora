import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { BACKEND_URL } from "../config";
import type { Collection } from "../types/collection";

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const refreshCollections = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/collections/`, getAuthHeader());
      const list: Collection[] = response.data?.data?.collection || response.data?.collection || [];
      setCollections(list);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollection = async (title: string, icon = "📁"): Promise<Collection> => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/collections/`,
      { title, icon },
      getAuthHeader()
    );
    const newCol: Collection = response.data?.collection || response.data?.data?.collection;
    await refreshCollections();
    return newCol;
  };

  const updateCollection = async (id: string, title?: string, icon?: string): Promise<void> => {
    await axios.patch(
      `${BACKEND_URL}/api/v1/collections/${id}`,
      { title, icon },
      getAuthHeader()
    );
    await refreshCollections();
  };

  const deleteCollection = async (id: string): Promise<void> => {
    await axios.delete(`${BACKEND_URL}/api/v1/collections/${id}`, getAuthHeader());
    await refreshCollections();
  };

  const shareCollection = async (id: string, share: boolean): Promise<string | null> => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/collections/${id}/share`,
      { share },
      getAuthHeader()
    );
    await refreshCollections();
    return response.data?.link || null;
  };

  useEffect(() => {
    refreshCollections();
  }, [refreshCollections]);

  return {
    collections,
    loading,
    refreshCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    shareCollection,
  };
}
