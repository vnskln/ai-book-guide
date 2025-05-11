import type { RecommendationResponseDto } from "@/types";

export enum RecommendationViewStatus {
  IDLE = "idle",
  LOADING = "loading",
  ERROR = "error",
  TIMEOUT = "timeout",
}

export enum RecommendationActionStatus {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
}

export interface RecommendationViewState {
  status: RecommendationViewStatus;
  currentRecommendation: RecommendationResponseDto | null;
  error: string | null;
  history: {
    data: RecommendationResponseDto[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
    isLoading: boolean;
    error: string | null;
  };
}

export interface RecommendationActionState {
  status: RecommendationActionStatus;
  error: string | null;
}

export interface RecommendationCardProps {
  recommendation: RecommendationResponseDto;
  isCompact?: boolean;
}

export interface RecommendationActionsProps {
  recommendationId: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isLoading: boolean;
}
