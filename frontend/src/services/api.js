// src/services/api.js
import { getExaminerAPI } from "../config/api.js";

const API_BASE = getExaminerAPI();

const api = {
  // ✅ Fetch all quizzes/exams
  getExams: async () => {
    try {
      const res = await fetch(`${API_BASE}`);
      if (!res.ok) throw new Error("Failed to fetch exams");
      return await res.json();
    } catch (error) {
      console.error("Error fetching exams:", error);
      return [];
    }
  },

  // ✅ Create new exam
  createExam: async (data) => {
    try {
      const res = await fetch(`${API_BASE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create exam");
      return await res.json();
    } catch (error) {
      console.error("Error creating exam:", error);
      return { success: false, message: error.message };
    }
  },

  // ✅ Start an exam
  startExam: async (code) => {
    try {
      const res = await fetch(`${API_BASE}/${code}/start`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to start exam");
      return await res.json();
    } catch (error) {
      console.error("Error starting exam:", error);
      return { success: false, message: error.message };
    }
  },

  // ✅ End an exam
  endExam: async (code) => {
    try {
      const res = await fetch(`${API_BASE}/${code}/end`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to end exam");
      return await res.json();
    } catch (error) {
      console.error("Error ending exam:", error);
      return { success: false, message: error.message };
    }
  },

  // ✅ Delete an exam
  deleteExam: async (code) => {
    try {
      const res = await fetch(`${API_BASE}/${code}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete exam");
      return await res.json();
    } catch (error) {
      console.error("Error deleting exam:", error);
      return { success: false, message: error.message };
    }
  },

  // ✅ Get exam results
  getResults: async (code) => {
    try {
      console.log("Fetching results for code:", code);
      const res = await fetch(`${API_BASE}/${code}/results`);
      if (!res.ok) {
        throw new Error(`Failed to fetch results: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      console.log("📊 API response for results:", data);
      
      // Handle the response format from backend
      if (data.results && Array.isArray(data.results)) {
        return data.results;
      } else if (Array.isArray(data)) {
        return data;
      } else {
        console.warn("Unexpected response format:", data);
        return [];
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      throw error; // Re-throw to let the component handle it
    }
  },
};

export default api;
