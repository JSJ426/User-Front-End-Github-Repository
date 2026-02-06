// src/api/board.ts
import { requestJson } from './http';

// 통합 API 명세서(사용자) 기준
// GET    /boards
// GET    /boards/{boardId}
// POST   /boards
// PATCH  /boards/{boardId}
// DELETE /boards/{boardId}

// 명세 예시가 NOTICE / NEW_MENU 등을 사용하므로, 가능한 enum 형태로 전송
export type BoardCategory =
  | 'NOTICE'
  | 'NEW_MENU'
  | 'SUGGESTION'
  | 'REQUEST'
  | 'COMPLAINT'
  | 'ETC';

export type BoardListItem = {
  id: number;
  schoolId: number;
  category: BoardCategory | string;
  title: string;
  authorId: number;
  authorType: 'DIETITIAN' | 'STUDENT' | string;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
  hasAttachment?: boolean;
};

export type BoardListResponse = {
  status: string;
  message: string;
  data?: {
    current_page: number;
    page_size: number;
    total_pages: number;
    total_items: number;
    items: BoardListItem[];
  };
};

export type BoardDetail = {
  id: number;
  schoolId: number;
  category: BoardCategory | string;
  title: string;
  content: string;
  authorId: number;
  authorType: 'DIETITIAN' | 'STUDENT' | string;
  authorName?: string;
  viewCount: number;
  createdAt: string;
  updatedAt?: string;
  attachments?: Array<{
    fileId: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>;
  isMine?: boolean;
  isEditable?: boolean;
};

export type BoardDetailResponse = {
  status: string;
  message: string;
  data?: BoardDetail;
};

export type BoardCreateBody = {
  category: BoardCategory | string;
  title: string;
  content: string;
  // 명세에 포함되지만 토큰 기반으로 서버가 추론할 수도 있어 optional 처리
  authorId?: number;
  authorType?: 'STUDENT' | 'DIETITIAN' | string;
  attachments?: Array<{
    fileName: string;
    s3Path: string;
    fileType: string;
  }>;
};

export type BoardCreateResponse = {
  status?: string;
  message?: string;
  // 명세 예시는 data가 아닌 루트에 게시글을 반환하기도 해서 느슨하게
  data?: any;
  id?: number;
};

export type BoardUpdateBody = {
  category?: BoardCategory | string;
  title?: string;
  content?: string;
  attachments?: BoardCreateBody['attachments'];
};

export async function fetchBoardList() {
  return (await requestJson('GET', '/boards')) as BoardListResponse;
}

export async function fetchBoardDetail(boardId: number) {
  return (await requestJson('GET', `/boards/${boardId}`)) as BoardDetailResponse;
}

export async function createBoard(body: BoardCreateBody) {
  return (await requestJson('POST', '/boards', { body })) as BoardCreateResponse;
}

export async function updateBoard(boardId: number, body: BoardUpdateBody) {
  return (await requestJson('PATCH', `/boards/${boardId}`, { body })) as BoardCreateResponse;
}

export async function deleteBoard(boardId: number) {
  return (await requestJson('DELETE', `/boards/${boardId}`)) as {
    status: string;
    message: string;
  };
}
