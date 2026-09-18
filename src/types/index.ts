export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type MachineType = 'Centrifugal Compressor' | 'Industrial Pump' | 'Electric Motor' | 'CNC Machine' | 'Robotics Arm';
export type MachineCategory = 'Motors' | 'Pumps' | 'Compressors' | 'CNC' | 'Robotics';
export type LocationArea = 'Production Line 1' | 'Production Line 2' | 'Assembly Line 1' | 'Assembly Line 2' | 'Cooling Area' | 'Packaging Line';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  category: MachineCategory;
  location: LocationArea;
  healthScore: number; // 0 - 100
  riskLevel: RiskLevel;
  riskScore: number; // 0 - 100
  status: HealthStatus;
  failureProbability: number; // percentage e.g. 72
  temperature: number; // in °C
  vibration: number; // in mm/s
  pressure: number; // in bar
  rpm: number; // in RPM
  current: number; // in Amperes
  operatingHours: number;
  lastMaintenance: string;
  nextMaintenance: string;
  lastReading: string;
  recommendedAction: string;
  primaryDriver: string;
  evidence: string[];
  manufacturer: string;
  installationDate: string;
  criticality: 'A (High Impact)' | 'B (Medium Impact)' | 'C (Low Impact)';
}

export interface SensorDataPoint {
  timestamp: string;
  timeLabel: string;
  temperature: number;
  vibration: number;
  pressure: number;
  rpm: number;
  current: number;
  baselineVibration: number;
  warningVibration: number;
  criticalVibration: number;
  baselineTemperature: number;
  warningTemperature: number;
  criticalTemperature: number;
  baselinePressure: number;
  warningPressure: number;
  criticalPressure: number;
}

export interface SensorAnomaly {
  id: string;
  timestamp: string;
  machineId: string;
  machineName: string;
  sensor: 'Vibration' | 'Temperature' | 'Pressure' | 'RPM' | 'Current';
  observed: string;
  expected: string;
  deviation: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface FailureRecord {
  id: string;
  machineId: string;
  machineName: string;
  machineType: MachineType;
  failureType: 'Bearing' | 'Thermal Overload' | 'Imbalance' | 'Seal Degradation' | 'Insulation Breakdown' | 'Gear Wear';
  detectedDate: string;
  downtimeHours: number;
  maintenanceAction: string;
  technician: string;
  costEstimate: string;
  status: 'Closed' | 'Investigating' | 'In Progress';
}

export interface MaintenanceTask {
  id: string;
  machineId: string;
  machineName: string;
  machineType: MachineType;
  location: LocationArea;
  maintenanceType: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  dueDate: string;
  daysRemaining: number;
  assignedTo: string;
  estimatedDowntime: string;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Overdue';
  description: string;
}

export interface MachineEvent {
  id: string;
  time: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface MachineMaintenanceHistory {
  date: string;
  maintenance: string;
  technician: string;
  duration: string;
  result: 'Pass' | 'Resolved' | 'Parts Replaced' | 'Calibrated';
}

export interface RiskFactor {
  factor: string;
  contribution: number; // e.g. 45%
  value: string;
  baseline: string;
  status: 'normal' | 'elevated' | 'critical';
}

export interface RiskItem {
  machineId: string;
  machineName: string;
  machineType: MachineType;
  location: LocationArea;
  riskScore: number;
  riskLevel: RiskLevel;
  primaryDriver: string;
  supportingEvidence: string[];
  recommendedAction: string;
  factors: RiskFactor[];
}

export interface RecommendationItem {
  id: string;
  machineId: string;
  machineName: string;
  machineType: MachineType;
  priority: 'High' | 'Medium' | 'Low';
  recommendation: string;
  reason: string;
  expectedImpact: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  suggestedWindow: string;
  estimatedDowntime: string;
  generatedDate: string;
}

export interface AlertItem {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  machineId: string;
  machineName: string;
  location: LocationArea;
  event: string;
  timestamp: string;
  status: 'Detected' | 'Reviewed' | 'Resolved';
  action: string;
  metric: string;
  details: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  status: 'Connected' | 'Degraded' | 'Syncing';
  lastIngestion: string;
  rows: string;
  rowCount: number;
  coverage: string;
  quality: number; // percentage
  frequency: string;
  type: string;
}

export interface QualityMetric {
  overallQuality: number;
  completeness: number;
  validity: number;
  consistency: number;
  duplicateRate: number;
  missingValuesCount: number;
  invalidReadingsCount: number;
  duplicateRecordsCount: number;
  outlierRecordsCount: number;
}

export interface DatasetQuality {
  dataset: string;
  records: string;
  completeness: number;
  validity: number;
  consistency: number;
  outliers: number;
  status: 'Good' | 'Attention' | 'Degraded';
}

export interface AnalysisRunItem {
  id: string;
  started: string;
  completed: string;
  dataset: string;
  records: string;
  status: 'Completed' | 'Running' | 'Failed';
  duration: string;
  trigger: 'Scheduled (Cron)' | 'Manual' | 'Threshold Event';
  findings: string;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Maintenance Manager' | 'Reliability Engineer' | 'Analyst' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastActive: string;
  created: string;
}

export interface AuditEventItem {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  result: 'Success' | 'Warning' | 'Failed';
  details: string;
}

export interface ThresholdSettings {
  tempWarning: number;
  tempCritical: number;
  vibWarning: number;
  vibCritical: number;
  pressureWarning: number;
  pressureCritical: number;
  rpmWarning: number;
  rpmCritical: number;
}
