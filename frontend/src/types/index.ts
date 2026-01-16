export enum MachineStatus {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',
  FAILURE = 'FAILURE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum AnnotationType {
  LINE = 'LINE',
  RECTANGLE = 'RECTANGLE',
  TEXT = 'TEXT',
  CIRCLE = 'CIRCLE',
  ARROW = 'ARROW',
}

export enum UserRole {
  OPERATOR = 'OPERATOR',
  MAINTENANCE = 'MAINTENANCE',
  ENGINEER = 'ENGINEER',
  ADMIN = 'ADMIN',
}

export enum EventType {
  MACHINE_STATUS_CHANGE = 'MACHINE_STATUS_CHANGE',
  ANNOTATION_CREATED = 'ANNOTATION_CREATED',
  ANNOTATION_UPDATED = 'ANNOTATION_UPDATED',
  ANNOTATION_DELETED = 'ANNOTATION_DELETED',
  MESSAGE_SENT = 'MESSAGE_SENT',
  USER_CONNECTED = 'USER_CONNECTED',
  USER_DISCONNECTED = 'USER_DISCONNECTED',
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  machines: Machine[];
}

export interface Machine {
  id: string;
  name: string;
  code: string;
  status: MachineStatus;
  schemaImageUrl?: string;
  productionLineId: string;
  productionLine?: ProductionLine;
  annotations?: Annotation[];
}

export interface Annotation {
  id: string;
  type: AnnotationType;
  content: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    points?: number[];
    text?: string;
    color?: string;
    strokeWidth?: number;
  };
  machineId: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  machineId: string;
  userId: string;
  userName?: string;
  user?: User;
  createdAt: string;
}