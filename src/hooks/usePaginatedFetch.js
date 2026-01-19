import { useState, useEffect, useCallback } from "react";
import axios from "axios";

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

      // ✅ FIX: Smart Detection of Data Array
      // The backend might return 'users', 'programmes', 'events', or 'data'
      const responseBody = res.data;

      if (Array.isArray(responseBody.users)) {
        setData(responseBody.users);
      } else if (Array.isArray(responseBody.programmes)) {
        setData(responseBody.programmes); // <--- Now catches your Programmes!
      } else if (Array.isArray(responseBody.events)) {
        setData(responseBody.events);
      } else if (Array.isArray(responseBody.data)) {
        setData(responseBody.data);
      } else {
        // Fallback: If the response itself is an array
        setData(Array.isArray(responseBody) ? responseBody : []);
      }

      setTotalPages(responseBody.pages || 1);
    } catch (err) {
      console.error("Fetch Error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url, token, page, search]);

  // ✅ FIX: Now listens to 'trigger' (refreshTrigger)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchData, trigger]); // <--- Added trigger here

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
