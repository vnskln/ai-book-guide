import { useState, useCallback, useEffect, useRef } from "react";
import type { RecommendationResponseDto } from "@/types";
import { RecommendationStatus } from "@/types";
import {
  RecommendationViewStatus,
  RecommendationActionStatus,
  type RecommendationViewState,
  type RecommendationActionState,
} from "../types/recommendations";
import { logger } from "../utils/logger";

export function useRecommendations() {
  const abortControllerRef = useRef<AbortController | null>(null);

  const [viewState, setViewState] = useState<RecommendationViewState>({
    status: RecommendationViewStatus.IDLE,
    currentRecommendation: null,
    error: null,
    history: {
      data: [],
      pagination: { total: 0, page: 1, limit: 10, total_pages: 0 },
      isLoading: false,
      error: null,
    },
  });

  const [actionState, setActionState] = useState<RecommendationActionState>({
    status: RecommendationActionStatus.IDLE,
    error: null,
  });

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setViewState((prev) => ({
        ...prev,
        status: RecommendationViewStatus.IDLE,
        error: null,
      }));
    }
  }, []);

  const checkPendingRecommendations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append("status", RecommendationStatus.PENDING);
      params.append("limit", "1");

      const response = await fetch(`/api/recommendations?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.data.length > 0) {
        const pendingRecommendation = data.data[0];
        setViewState((prev) => ({
          ...prev,
          currentRecommendation: pendingRecommendation,
        }));
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to check pending recommendations", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }, []);

  const generateRecommendation = useCallback(async () => {
    try {
      // Check for pending recommendations first
      const hasPendingRecommendation = await checkPendingRecommendations();
      if (hasPendingRecommendation) {
        return;
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      abortControllerRef.current = new AbortController();

      // Create timeout that will abort the controller
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
          setViewState((prev) => ({
            ...prev,
            status: RecommendationViewStatus.TIMEOUT,
            error: "Request timed out after 30 seconds",
          }));
        }
      }, 30000); // 30 seconds

      setViewState((prev) => ({ ...prev, status: RecommendationViewStatus.LOADING, error: null }));

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
      });

      // Clear timeout since request completed
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: RecommendationResponseDto = await response.json();
      setViewState((prev) => ({
        ...prev,
        status: RecommendationViewStatus.IDLE,
        currentRecommendation: data,
      }));
    } catch (error) {
      // Don't update state if the request was aborted due to component unmount
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      setViewState((prev) => ({
        ...prev,
        status: RecommendationViewStatus.ERROR,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    } finally {
      abortControllerRef.current = null;
    }
  }, [checkPendingRecommendations]);

  const updateRecommendationStatus = useCallback(async (id: string, status: RecommendationStatus) => {
    try {
      setActionState({ status: RecommendationActionStatus.LOADING, error: null });

      const response = await fetch(`/api/recommendations?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      await response.json();
      setActionState({ status: RecommendationActionStatus.SUCCESS, error: null });

      setViewState((prev) => ({
        ...prev,
        currentRecommendation: null,
      }));

      await fetchHistory();
    } catch (error) {
      setActionState({
        status: RecommendationActionStatus.ERROR,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }, []);

  const fetchHistory = useCallback(async (page = 1) => {
    try {
      setViewState((prev) => ({
        ...prev,
        history: { ...prev.history, isLoading: true, error: null },
      }));

      const params = new URLSearchParams();
      params.append("page", page.toString());

      const response = await fetch(`/api/recommendations?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setViewState((prev) => ({
        ...prev,
        history: {
          data: data.data,
          pagination: data.pagination,
          isLoading: false,
          error: null,
        },
      }));
    } catch (error) {
      setViewState((prev) => ({
        ...prev,
        history: {
          ...prev.history,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      }));
    }
  }, []);

  const acceptRecommendation = useCallback(
    async (id: string) => {
      await updateRecommendationStatus(id, RecommendationStatus.ACCEPTED);
    },
    [updateRecommendationStatus]
  );

  const rejectRecommendation = useCallback(
    async (id: string) => {
      await updateRecommendationStatus(id, RecommendationStatus.REJECTED);
    },
    [updateRecommendationStatus]
  );

  useEffect(() => {
    // Check for pending recommendations when component mounts
    checkPendingRecommendations();
    // Fetch history
    fetchHistory();
  }, [checkPendingRecommendations, fetchHistory]);

  useEffect(() => {
    return () => {
      // Cleanup any pending request when the hook unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    viewState,
    actionState,
    generateRecommendation,
    acceptRecommendation,
    rejectRecommendation,
    fetchHistory,
    cancelGeneration,
  };
}
