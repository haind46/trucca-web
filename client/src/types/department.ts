// Department types based on API_Department.md

export interface Department {
  id: number;
  name: string;
  deptCode: string;
  description: string | null;
  createdAt: string;
}

export interface DepartmentRequest {
  name: string;
  deptCode: string;
  description?: string;
}

export interface PaginatedDepartments {
  content: Department[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface DepartmentApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  keyWord?: string;
  sort_dir?: 'asc' | 'desc';
  sort_key?: 'id' | 'name' | 'dept_code' | 'created_at';
}
