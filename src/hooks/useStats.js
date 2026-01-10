import { useState, useEffect } from "react";
import axios from "axios";

export function useStats(baseUrl, token, refreshTrigger) {
  const [stats, setStats] = useState({
    users: 0,
    events: 0,
    programmes: 0,
    jobs: 0, // ✅ Initialize jobs count
    totalRegistrations: 0,
  });

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const config = { headers: { "auth-token": token } };

        // Run all fetch requests in parallel
        const [usersRes, eventsRes, progsRes, jobsRes, regsRes] =
          await Promise.all([
            axios.get(`${baseUrl}/api/admin/users`, config),
            axios.get(`${baseUrl}/api/events`, config),
            axios.get(`${baseUrl}/api/admin/programmes`, config),
            axios.get(`${baseUrl}/api/jobs`, config), // ✅ Fetch Jobs
            axios.get(`${baseUrl}/api/admin/registrations`, config),
          ]);

        // Helper to safely get array length regardless of response format
        const getCount = (res) => {
          if (Array.isArray(res.data)) return res.data.length;
          if (res.data.data && Array.isArray(res.data.data))
            return res.data.data.length;
          if (res.data.count) return res.data.count;
          return 0;
        };

        setStats({
          users: getCount(usersRes),
          events: getCount(eventsRes),
          programmes: getCount(progsRes),
          jobs: getCount(jobsRes), // ✅ Store Jobs Count
          totalRegistrations: getCount(regsRes),
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, [baseUrl, token, refreshTrigger]);

  return stats;
}
