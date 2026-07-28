export interface FieldOption {
  value: string | number;
  label: string;
}

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'url'
  | 'date'
  | 'time'
  | 'select'
  | 'checkbox'
  | 'file'
  | 'password';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  fullWidth?: boolean;
  helpText?: string;
  // Only include this field in the create form, not the edit form (e.g. password)
  createOnly?: boolean;
  defaultValue?: string | number | boolean;
}

export interface ColumnConfig<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}
