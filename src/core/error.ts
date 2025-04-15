export interface ApiError<T = unknown> {
  code: string;
  message: string;
  shortMessage: string;
  details?: T;
}
