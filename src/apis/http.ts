import axios from 'axios';
import type { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim();

export const http = axios.create(baseURL ? { baseURL } : {});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    // TODO(확인 필요): API 오류 명세가 정해지면 공통 오류 매핑을 추가한다.
    return Promise.reject(error);
  }
);

export const isHttpError = (error: unknown): error is AxiosError => axios.isAxiosError(error);
