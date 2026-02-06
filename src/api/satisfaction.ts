// src/api/satisfaction.ts
import { requestJson } from './http';

export type ReviewCreateBody = {
  date: string;
  meal_type: 'LUNCH' | 'DINNER';
  rating: number;
  content?: string;
};

export type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
  details?: any;
};

export type ReviewResponse = {
  id: number;
  student_id: number;
  school_id: number;
  date: string;
  meal_type: string;
  rating: number;
  content: string | null;
  created_at: string;
};

export async function createSatisfaction(body: ReviewCreateBody) {
  return await requestJson<ApiResponse<ReviewResponse>>('POST', '/reviews', { body });
}
