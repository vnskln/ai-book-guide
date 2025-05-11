import { useState, useCallback, useEffect, useRef } from "react";
import type { RecommendationResponseDto, RecommendationStatus } from "@/types";
import {
  RecommendationViewStatus,
  RecommendationActionStatus,
  type RecommendationViewState,
  type RecommendationActionState,
} from "../types/recommendations";

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

  const generateRecommendation = useCallback(async () => {
    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController
      abortControllerRef.current = new AbortController();

      setViewState((prev) => ({ ...prev, status: RecommendationViewStatus.LOADING, error: null }));

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
      });

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
      // Don't update state if the request was aborted
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
  }, []);

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
      await updateRecommendationStatus(id, "accepted" as RecommendationStatus);
    },
    [updateRecommendationStatus]
  );

  const rejectRecommendation = useCallback(
    async (id: string) => {
      await updateRecommendationStatus(id, "rejected" as RecommendationStatus);
    },
    [updateRecommendationStatus]
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

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
