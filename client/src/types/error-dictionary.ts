export interface ErrorDictionary {
  id: number;
  errorCode: string;
  errorInfo: string;
  errorDetail: string;
  severity: string;
  ancestry: string;
  resource: string;
  resourceId: string;
  resourceDescription: string;
  type: string;
  alarm: string;
  alarmDate: string;
  conditionLog: string;
  patternConditionLog: string;
  patternResource: string;
  status: number;
  solutionSuggest: string;
}

export interface ErrorDictionaryFormData {
  errorCode?: string;
  errorInfo?: string;
  errorDetail?: string;
  severity?: string;
  ancestry?: string;
  resource?: string;
  resourceId?: string;
  resourceDescription?: string;
  type?: string;
  alarm?: string;
  alarmDate?: string;
  conditionLog?: string;
  patternConditionLog?: string;
  patternResource?: string;
  status?: number;
  solutionSuggest?: string;
}

export interface ErrorDictionaryPaginatedResponse {
  data: ErrorDictionary[];
  total: number;
  page: number;
  size: number;
}
