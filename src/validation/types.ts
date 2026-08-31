export type IssueSeverity = "error" | "warning" | "info";
export interface ValidationIssue { code: string; severity: IssueSeverity; message: string; path?: string; overlay?: string; suggestion?: string; }
export interface ValidationResult { valid: boolean; issues: ValidationIssue[]; }
