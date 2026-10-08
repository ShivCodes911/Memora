import axios from "axios";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "../config";
import type { Content } from "../types/content";

export function useContent() {
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading]   = useState(true);

    function refresh() {
        axios.get(`${BACKEND_URL}/api/v1/content/`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        })
        .then((response) => {
            setContents(response.data.content || []);
        })
        .catch((err) => {
            console.error("Failed to fetch contents:", err);
        })
        .finally(() => {
            setLoading(false);
        });
    }

    useEffect(() => {
        refresh();
        const interval = setInterval(() => {
            refresh();
        }, 3 * 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return { contents, refresh, loading };
}