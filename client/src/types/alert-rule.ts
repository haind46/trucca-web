/**
 * Alert Rule Types & Interfaces
 */

export interface AlertRule {
  id: number;
  code: string;
  name: string;
  description?: string;
  systemLevel?: {
    id: number;
    level: string;
    description: string;
  };
  severity?: {
    id: string;
    severityCode: string;
    severityName: string;
    colorCode: string;
  };
  alertChannels: string; // "SMS,CALL,ECHAT"
  status: number; // 1=active, 0=inactive
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface AlertRuleFormData {
  code?: string;
  name: string;
  description?: string;
  systemLevelId?: number;
  severityId?: string;
  alertChannels?: string;
  status?: number;
  createdBy?: string;
  roleIds?: number[];
  contactIds?: number[];
  groupContactIds?: number[];
}

export interface AlertRuleRole {
  id: number;
  alertRule: {
    id: number;
    code: string;
    name: string;
  };
  role: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
  };
  createdAt: string;
  createdBy: string;
}

export interface AlertRuleContact {
  id: number;
  alertRule: {
    id: number;
    code: string;
    name: string;
  };
  contact: {
    id: number;
    fullName: string;
    email?: string;
    phone?: string;
    isActive: boolean;
  };
  createdAt: string;
  createdBy: string;
}

export interface AlertRuleGroupContact {
  id: number;
  alertRule: {
    id: number;
    code: string;
    name: string;
  };
  groupContact: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
  };
  createdAt: string;
  createdBy: string;
}

export interface PaginatedAlertRules {
  data: AlertRule[];
  total: number;
  page: number;
  size: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
}
