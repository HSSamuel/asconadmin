import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// ✅ 1. Added 'trigger' parameter to allow auto-refresh
export function usePaginatedFetch(url, token, trigger = 0) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(url, {
        headers: { "auth-token": token },
        params: {
          page,
          limit: 20,
          search: search || "",
        },
      });

      const responseBody = res.data;

      // ✅ 2. FIX: Check for 'programmes' and 'events' specifically
      if (responseBody.programmes) {
        setData(responseBody.programmes); // <--- Finds your Programmes now!
        setTotalPages(responseBody.pages);
      } else if (responseBody.users) {
        setData(responseBody.users);
        setTotalPages(responseBody.pages);
      } else if (responseBody.events) {
        setData(responseBody.events);
        setTotalPages(responseBody.pages);
      } else if (responseBody.data) {
        // Fallback for single items or generic data
        setData(Array.isArray(responseBody.data) ? responseBody.data : []);
        setTotalPages(responseBody.pages || 1);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url, token, page, search]);

  // ✅ 3. FIX: Add 'trigger' to dependency array so it refreshes on submit
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchData, trigger]);

  return {
    data,
    loading,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    refresh: fetchData,
  };
}
