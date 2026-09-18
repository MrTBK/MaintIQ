import {
  Machine,
  SensorDataPoint,
  SensorAnomaly,
  FailureRecord,
  MaintenanceTask,
  MachineEvent,
  MachineMaintenanceHistory,
  RiskItem,
  RecommendationItem,
  AlertItem,
  DataSourceItem,
  QualityMetric,
  DatasetQuality,
  AnalysisRunItem,
  UserItem,
  AuditEventItem,
  ThresholdSettings
} from '../types';

export const PLANT_INFO = {
  plantName: 'Tunis Production Plant',
  datasetName: 'Industrial Maintenance History',
  analysisSnapshot: 'Sep 18, 2026 · 03:42',
  operationalStatus: 'System Operational',
  fleetTotal: 128,
  healthyCount: 94,
  warningCount: 21,
  criticalCount: 7,
  activeMaintenanceCount: 12,
  openFailuresCount: 4,
  downtimeExposureHours: 184,
};

// Comprehensive list of key machines representing the fleet
export const MACHINES_DATA: Machine[] = [
  {
    id: 'M-042',
    name: 'Centrifugal Compressor 02',
    type: 'Centrifugal Compressor',
    category: 'Compressors',
    location: 'Production Line 2',
    healthScore: 42,
    riskLevel: 'Critical',
    riskScore: 87,
    status: 'Critical',
    failureProbability: 72,
    temperature: 78.4,
    vibration: 6.8,
    pressure: 8.9,
    rpm: 3450,
    current: 142.5,
    operatingHours: 8421,
    lastMaintenance: 'Aug 21, 2026',
    nextMaintenance: 'Sep 20, 2026',
    lastReading: '8 min ago',
    recommendedAction: 'Inspect bearing assembly',
    primaryDriver: 'Vibration & Thermal',
    evidence: [
      '+31% vibration vs machine baseline (6.8 vs 4.9 mm/s)',
      '+14% temperature vs baseline (78.4°C vs 68.8°C)',
      '+18% operating load sustained over 14 operating hours',
      '3 similar historical patterns preceded bearing failure'
    ],
    manufacturer: 'Atlas Industrial Turbines',
    installationDate: 'Mar 2022',
    criticality: 'A (High Impact)'
  },
  {
    id: 'M-017',
    name: 'Industrial Feed Pump B',
    type: 'Industrial Pump',
    category: 'Pumps',
    location: 'Cooling Area',
    healthScore: 68,
    riskLevel: 'Medium',
    riskScore: 58,
    status: 'Warning',
    failureProbability: 38,
    temperature: 64.2,
    vibration: 4.8,
    pressure: 6.2,
    rpm: 1780,
    current: 54.0,
    operatingHours: 12410,
    lastMaintenance: 'Jul 14, 2026',
    nextMaintenance: 'Oct 02, 2026',
    lastReading: '11 min ago',
    recommendedAction: 'Check vibration trend & impeller balance',
    primaryDriver: 'Hydraulic Cavitation',
    evidence: [
      '+19% harmonic vibration amplitude at 120Hz',
      'Discharge pressure variance ±12% during peak flow',
      'Impeller service hours exceeded 3,500 continuous runtime'
    ],
    manufacturer: 'FlowServe Dynamics',
    installationDate: 'Nov 2020',
    criticality: 'B (Medium Impact)'
  },
  {
    id: 'M-088',
    name: 'Main Drive Motor 01',
    type: 'Electric Motor',
    category: 'Motors',
    location: 'Assembly Line 1',
    healthScore: 61,
    riskLevel: 'High',
    riskScore: 76,
    status: 'Warning',
    failureProbability: 64,
    temperature: 72.8,
    vibration: 5.7,
    pressure: 1.0,
    rpm: 2980,
    current: 198.2,
    operatingHours: 6190,
    lastMaintenance: 'Jun 30, 2026',
    nextMaintenance: 'Sep 24, 2026',
    lastReading: '4 min ago',
    recommendedAction: 'Schedule inspection & insulation resistance test',
    primaryDriver: 'Stator Overheating',
    evidence: [
      'Winding temperature elevated by +11°C during nominal load',
      'Current phase imbalance detected at 3.8% (tolerance 2.0%)',
      'Drive-end bearing vibration in warning threshold'
    ],
    manufacturer: 'Siemens Industrial Drives',
    installationDate: 'Jan 2023',
    criticality: 'A (High Impact)'
  },
  {
    id: 'M-021',
    name: 'High-Torque Extruder Motor',
    type: 'Electric Motor',
    category: 'Motors',
    location: 'Production Line 1',
    healthScore: 74,
    riskLevel: 'Medium',
    riskScore: 52,
    status: 'Warning',
    failureProbability: 34,
    temperature: 69.1,
    vibration: 5.1,
    pressure: 1.1,
    rpm: 1480,
    current: 112.4,
    operatingHours: 9840,
    lastMaintenance: 'May 10, 2026',
    nextMaintenance: 'Sep 20, 2026',
    lastReading: '15 min ago',
    recommendedAction: 'Bearing inspection & regreasing',
    primaryDriver: 'Mechanical Wear',
    evidence: [
      'Bearing lubrication cycle due within 48 hours',
      'Minor axial vibration drift (+8% vs 30-day baseline)'
    ],
    manufacturer: 'ABB Motion Systems',
    installationDate: 'Sep 2021',
    criticality: 'B (Medium Impact)'
  },
  {
    id: 'M-076',
    name: 'Centrifugal Slurry Pump',
    type: 'Industrial Pump',
    category: 'Pumps',
    location: 'Cooling Area',
    healthScore: 79,
    riskLevel: 'Low',
    riskScore: 31,
    status: 'Healthy',
    failureProbability: 18,
    temperature: 58.6,
    vibration: 3.9,
    pressure: 5.4,
    rpm: 1440,
    current: 48.2,
    operatingHours: 7320,
    lastMaintenance: 'Jun 12, 2026',
    nextMaintenance: 'Sep 22, 2026',
    lastReading: '6 min ago',
    recommendedAction: 'Routine lubrication replenishment',
    primaryDriver: 'Scheduled Maintenance',
    evidence: ['Routine schedule triggered by 2,000 runtime hours threshold'],
    manufacturer: 'Sulzer Process Pumps',
    installationDate: 'Feb 2022',
    criticality: 'C (Low Impact)'
  },
  {
    id: 'M-091',
    name: 'CNC 5-Axis Milling Unit',
    type: 'CNC Machine',
    category: 'CNC',
    location: 'Assembly Line 2',
    healthScore: 82,
    riskLevel: 'Low',
    riskScore: 28,
    status: 'Healthy',
    failureProbability: 14,
    temperature: 52.3,
    vibration: 2.8,
    pressure: 6.8,
    rpm: 12000,
    current: 38.6,
    operatingHours: 4950,
    lastMaintenance: 'Jul 28, 2026',
    nextMaintenance: 'Sep 24, 2026',
    lastReading: '19 min ago',
    recommendedAction: 'Spindle alignment and runout calibration',
    primaryDriver: 'Geometric Precision',
    evidence: ['Tool holder vibration within normal limits'],
    manufacturer: 'DMG Mori Precision',
    installationDate: 'Oct 2023',
    criticality: 'A (High Impact)'
  },
  {
    id: 'M-104',
    name: 'Robotic Pick & Place Gantry',
    type: 'Robotics Arm',
    category: 'Robotics',
    location: 'Packaging Line',
    healthScore: 91,
    riskLevel: 'Low',
    riskScore: 16,
    status: 'Healthy',
    failureProbability: 9,
    temperature: 46.1,
    vibration: 2.1,
    pressure: 5.8,
    rpm: 420,
    current: 24.1,
    operatingHours: 3820,
    lastMaintenance: 'Aug 04, 2026',
    nextMaintenance: 'Oct 15, 2026',
    lastReading: '3 min ago',
    recommendedAction: 'Perform quarterly cable drag chain inspection',
    primaryDriver: 'None - Nominal',
    evidence: ['All joint encoders reporting zero deviation and low backlash'],
    manufacturer: 'KUKA Robotics Corp',
    installationDate: 'May 2024',
    criticality: 'B (Medium Impact)'
  },
  {
    id: 'M-005',
    name: 'Reciprocating Booster Compressor',
    type: 'Centrifugal Compressor',
    category: 'Compressors',
    location: 'Production Line 1',
    healthScore: 38,
    riskLevel: 'Critical',
    riskScore: 89,
    status: 'Critical',
    failureProbability: 78,
    temperature: 82.1,
    vibration: 7.2,
    pressure: 11.4,
    rpm: 1250,
    current: 165.8,
    operatingHours: 11840,
    lastMaintenance: 'Jul 02, 2026',
    nextMaintenance: 'Sep 19, 2026',
    lastReading: '2 min ago',
    recommendedAction: 'Emergency valve plate overhaul and discharge cooling check',
    primaryDriver: 'Valve Leakage & Thermal Strain',
    evidence: [
      'Discharge valve temperature exceeded 82°C critical trip threshold',
      'High amplitude pressure pulsations (+26% variance)',
      'Crosshead pin vibration spectrum exhibiting impact harmonics'
    ],
    manufacturer: 'Burckhardt Compression',
    installationDate: 'Apr 2020',
    criticality: 'A (High Impact)'
  },
  {
    id: 'M-031',
    name: 'Hydraulic Pack Station 04',
    type: 'Industrial Pump',
    category: 'Pumps',
    location: 'Assembly Line 1',
    healthScore: 88,
    riskLevel: 'Low',
    riskScore: 22,
    status: 'Healthy',
    failureProbability: 11,
    temperature: 55.4,
    vibration: 2.6,
    pressure: 180.0,
    rpm: 1800,
    current: 68.3,
    operatingHours: 6420,
    lastMaintenance: 'Sep 17, 2026',
    nextMaintenance: 'Nov 17, 2026',
    lastReading: '12 min ago',
    recommendedAction: 'Filter delta-P monitoring (nominal)',
    primaryDriver: 'Post-Maintenance Run-in',
    evidence: ['Full hydraulic fluid replacement and pump recalibration completed yesterday'],
    manufacturer: 'Bosch Rexroth Hydraulics',
    installationDate: 'Aug 2021',
    criticality: 'B (Medium Impact)'
  },
  {
    id: 'M-064',
    name: 'CNC Vertical Lathe VL-03',
    type: 'CNC Machine',
    category: 'CNC',
    location: 'Production Line 2',
    healthScore: 54,
    riskLevel: 'High',
    riskScore: 73,
    status: 'Warning',
    failureProbability: 59,
    temperature: 71.0,
    vibration: 5.9,
    pressure: 4.5,
    rpm: 4500,
    current: 82.5,
    operatingHours: 9110,
    lastMaintenance: 'Jun 19, 2026',
    nextMaintenance: 'Sep 21, 2026',
    lastReading: '7 min ago',
    recommendedAction: 'Inspect spindle front bearing preload & thermal jacket',
    primaryDriver: 'Spindle Bearing Degradation',
    evidence: [
      'Spindle front bearing cage frequency detected via envelope analysis',
      'Thermal drift of chuck center exceeds 35 microns'
    ],
    manufacturer: 'Mazak Corporation',
    installationDate: 'Dec 2021',
    criticality: 'A (High Impact)'
  },
  {
    id: 'M-112',
    name: 'Secondary Chilled Water Circulator',
    type: 'Industrial Pump',
    category: 'Pumps',
    location: 'Cooling Area',
    healthScore: 92,
    riskLevel: 'Low',
    riskScore: 14,
    status: 'Healthy',
    failureProbability: 8,
    temperature: 48.0,
    vibration: 2.3,
    pressure: 4.8,
    rpm: 1450,
    current: 36.4,
    operatingHours: 5200,
    lastMaintenance: 'Aug 15, 2026',
    nextMaintenance: 'Nov 15, 2026',
    lastReading: '22 min ago',
    recommendedAction: 'Regular surveillance (nominal state)',
    primaryDriver: 'None - Steady State',
    evidence: ['Vibration velocity 2.3 mm/s RMS is below the warning threshold'],
    manufacturer: 'Grundfos Industry',
    installationDate: 'Mar 2023',
    criticality: 'C (Low Impact)'
  },
  {
    id: 'M-125',
    name: 'High-Speed Case Packer Arm',
    type: 'Robotics Arm',
    category: 'Robotics',
    location: 'Packaging Line',
    healthScore: 70,
    riskLevel: 'Medium',
    riskScore: 49,
    status: 'Warning',
    failureProbability: 32,
    temperature: 63.8,
    vibration: 4.5,
    pressure: 6.0,
    rpm: 950,
    current: 41.2,
    operatingHours: 4120,
    lastMaintenance: 'Jul 22, 2026',
    nextMaintenance: 'Oct 08, 2026',
    lastReading: '14 min ago',
    recommendedAction: 'Inspect Wrist Axis J4 harmonic drive backlash',
    primaryDriver: 'Gear Backlash Drift',
    evidence: ['Position error shows 0.4mm overshoot during rapid deceleration'],
    manufacturer: 'Fanuc Robotics',
    installationDate: 'Jan 2024',
    criticality: 'B (Medium Impact)'
  }
];

// 30-day vibration trend (bundled snapshot)
export const VIBRATION_TREND_30_DAYS = [
  { day: 'Day 1', date: 'Aug 19', actual: 4.7, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 3', date: 'Aug 21', actual: 4.8, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 5', date: 'Aug 23', actual: 4.6, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 7', date: 'Aug 25', actual: 4.9, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 9', date: 'Aug 27', actual: 4.8, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 11', date: 'Aug 29', actual: 5.0, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 13', date: 'Aug 31', actual: 5.1, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 15', date: 'Sep 02', actual: 5.2, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 17', date: 'Sep 04', actual: 5.1, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 19', date: 'Sep 06', actual: 5.3, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 21', date: 'Sep 08', actual: 5.4, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 23', date: 'Sep 10', actual: 5.7, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 25', date: 'Sep 12', actual: 5.9, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 27', date: 'Sep 14', actual: 6.2, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 28', date: 'Sep 15', actual: 6.4, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 29', date: 'Sep 16', actual: 6.6, baseline: 4.9, threshold: 5.5 },
  { day: 'Day 30', date: 'Sep 18', actual: 6.8, baseline: 4.9, threshold: 5.5 }
];

// Time series history for M-042 (Centrifugal Compressor)
export const M042_SENSOR_HISTORY: SensorDataPoint[] = [
  { timestamp: '00:00', timeLabel: '00:00', temperature: 69.2, vibration: 4.9, pressure: 8.2, rpm: 3420, current: 128, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 },
  { timestamp: '02:00', timeLabel: '02:00', temperature: 69.8, vibration: 5.0, pressure: 8.3, rpm: 3430, current: 129, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 },
  { timestamp: '04:00', timeLabel: '04:00', temperature: 70.4, vibration: 5.2, pressure: 8.3, rpm: 3425, current: 131, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 },
  { timestamp: '06:00', timeLabel: '06:00', temperature: 71.5, vibration: 5.4, pressure: 8.4, rpm: 3440, current: 133, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 },
  { timestamp: '08:00', timeLabel: '08:00', temperature: 73.1, vibration: 5.6, pressure: 8.5, rpm: 3450, current: 136, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 },
  { timestamp: '08:41', timeLabel: '08:41', temperature: 74.0, vibration: 5.8, pressure: 8.6, rpm: 3455, current: 138, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 },
  { timestamp: '10:12', timeLabel: '10:12', temperature: 75.6, vibration: 6.1, pressure: 8.7, rpm: 3460, current: 139, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 },
  { timestamp: '12:00', timeLabel: '12:00', temperature: 76.8, vibration: 6.3, pressure: 8.8, rpm: 3458, current: 140, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 },
  { timestamp: '12:27', timeLabel: '12:27', temperature: 77.2, vibration: 6.5, pressure: 8.8, rpm: 3462, current: 141, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 },
  { timestamp: '14:03', timeLabel: '14:03', temperature: 78.4, vibration: 6.8, pressure: 8.9, rpm: 3450, current: 142, baselineVibration: 4.9, warningVibration: 5.5, criticalVibration: 6.5, baselineTemperature: 68.8, warningTemperature: 75.0, criticalTemperature: 85.0, baselinePressure: 8.0, warningPressure: 9.5, criticalPressure: 11.0 }
];

// Recent Sensor Events for M-042
export const M042_EVENTS: MachineEvent[] = [
  { id: 'EVT-01', time: '08:41', description: 'Vibration exceeded warning threshold (5.5 mm/s → 5.8 mm/s)', severity: 'warning' },
  { id: 'EVT-02', time: '10:12', description: 'Bearing sleeve temperature increased above baseline threshold (75.6°C)', severity: 'warning' },
  { id: 'EVT-03', time: '12:27', description: 'Repeated vibration anomaly detected in high-frequency band (2.4 kHz)', severity: 'critical' },
  { id: 'EVT-04', time: '14:03', description: 'Failure risk reassessed from Medium → High (Critical state confirmed)', severity: 'critical' }
];

// Maintenance History for M-042
export const M042_MAINTENANCE_HISTORY: MachineMaintenanceHistory[] = [
  { date: 'Aug 21, 2026', maintenance: 'Quarterly Seal & Lubrication Overhaul', technician: 'K. Ben Salem', duration: '3.5 h', result: 'Resolved' },
  { date: 'May 14, 2026', maintenance: 'Rotor Dynamic Balancing', technician: 'M. Cherif', duration: '5.0 h', result: 'Calibrated' },
  { date: 'Jan 10, 2026', maintenance: 'Thrust Bearing Replacement', technician: 'A. Trabelsi', duration: '8.2 h', result: 'Parts Replaced' },
  { date: 'Sep 03, 2025', maintenance: 'Vibration Transducer Recalibration', technician: 'K. Ben Salem', duration: '2.0 h', result: 'Pass' }
];

// Failure Intelligence Data
export const FAILURES_DATA: FailureRecord[] = [
  { id: 'F-2026-041', machineId: 'M-042', machineName: 'Centrifugal Compressor 02', machineType: 'Centrifugal Compressor', failureType: 'Bearing', detectedDate: 'Sep 12, 2026', downtimeHours: 6.5, maintenanceAction: 'Bearing Replacement & Shaft Re-alignment', technician: 'A. Trabelsi', costEstimate: '$4,200', status: 'Closed' },
  { id: 'F-2026-038', machineId: 'M-088', machineName: 'Main Drive Motor 01', machineType: 'Electric Motor', failureType: 'Thermal Overload', detectedDate: 'Sep 02, 2026', downtimeHours: 4.2, maintenanceAction: 'Stator Cooling Duct Clearance', technician: 'M. Cherif', costEstimate: '$1,850', status: 'Closed' },
  { id: 'F-2026-035', machineId: 'M-005', machineName: 'Reciprocating Booster Compressor', machineType: 'Centrifugal Compressor', failureType: 'Seal Degradation', detectedDate: 'Aug 27, 2026', downtimeHours: 9.0, maintenanceAction: 'High-Pressure Piston Ring Renewal', technician: 'A. Trabelsi', costEstimate: '$5,400', status: 'Closed' },
  { id: 'F-2026-031', machineId: 'M-017', machineName: 'Industrial Feed Pump B', machineType: 'Industrial Pump', failureType: 'Imbalance', detectedDate: 'Aug 14, 2026', downtimeHours: 3.5, maintenanceAction: 'Impeller De-slagging & Static Balancing', technician: 'K. Ben Salem', costEstimate: '$1,200', status: 'Closed' },
  { id: 'F-2026-029', machineId: 'M-064', machineName: 'CNC Vertical Lathe VL-03', machineType: 'CNC Machine', failureType: 'Gear Wear', detectedDate: 'Jul 29, 2026', downtimeHours: 8.0, maintenanceAction: 'Reduction Gearbox Pinion Replacement', technician: 'S. Mansouri', costEstimate: '$6,100', status: 'Closed' },
  { id: 'F-2026-024', machineId: 'M-021', machineName: 'High-Torque Extruder Motor', machineType: 'Electric Motor', failureType: 'Insulation Breakdown', detectedDate: 'Jul 11, 2026', downtimeHours: 11.5, maintenanceAction: 'Motor Rewind & Varnish Dip', technician: 'M. Cherif', costEstimate: '$7,800', status: 'Closed' },
  { id: 'F-2026-019', machineId: 'M-042', machineName: 'Centrifugal Compressor 02', machineType: 'Centrifugal Compressor', failureType: 'Bearing', detectedDate: 'Jun 22, 2026', downtimeHours: 5.5, maintenanceAction: 'Drive-End Angular Contact Bearing Replacement', technician: 'A. Trabelsi', costEstimate: '$3,900', status: 'Closed' }
];

export const FAILURES_BY_TYPE = [
  { name: 'Bearing', count: 18, percentage: 43 },
  { name: 'Thermal Overload', count: 9, percentage: 21 },
  { name: 'Seal Degradation', count: 7, percentage: 17 },
  { name: 'Imbalance', count: 5, percentage: 12 },
  { name: 'Gear Wear', count: 3, percentage: 7 }
];

export const FAILURES_BY_MACHINE_TYPE = [
  { type: 'Compressors', failures: 16, downtime: 124 },
  { type: 'Motors', failures: 12, downtime: 86 },
  { type: 'Pumps', failures: 8, downtime: 52 },
  { type: 'CNC Machines', failures: 4, downtime: 38 },
  { type: 'Robotics', failures: 2, downtime: 18 }
];

export const FAILURES_OVER_TIME = [
  { month: 'Apr 2026', count: 6, downtime: 44 },
  { month: 'May 2026', count: 7, downtime: 58 },
  { month: 'Jun 2026', count: 9, downtime: 66 },
  { month: 'Jul 2026', count: 8, downtime: 54 },
  { month: 'Aug 2026', count: 7, downtime: 51 },
  { month: 'Sep 2026', count: 5, downtime: 45 }
];

// Maintenance Schedule & Tasks
export const INITIAL_MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'WO-2026-0920',
    machineId: 'M-042',
    machineName: 'Centrifugal Compressor 02',
    machineType: 'Centrifugal Compressor',
    location: 'Production Line 2',
    maintenanceType: 'Bearing Inspection & Replacement',
    priority: 'High',
    dueDate: 'Sep 20, 2026',
    daysRemaining: 2,
    assignedTo: 'Maintenance Team A',
    estimatedDowntime: '4 h',
    status: 'Upcoming',
    description: 'Inspect bearing assembly for flaking/spalling and verify radial play.'
  },
  {
    id: 'WO-2026-0921',
    machineId: 'M-021',
    machineName: 'High-Torque Extruder Motor',
    machineType: 'Electric Motor',
    location: 'Production Line 1',
    maintenanceType: 'Bearing inspection & regreasing',
    priority: 'High',
    dueDate: 'Sep 20, 2026',
    daysRemaining: 2,
    assignedTo: 'Maintenance Team B',
    estimatedDowntime: '2.5 h',
    status: 'Upcoming',
    description: 'Scheduled bearing inspection due in 2 days per predictive maintenance cycle.'
  },
  {
    id: 'WO-2026-0922',
    machineId: 'M-076',
    machineName: 'Centrifugal Slurry Pump',
    machineType: 'Industrial Pump',
    location: 'Cooling Area',
    maintenanceType: 'Mechanical Seal Lubrication',
    priority: 'Medium',
    dueDate: 'Sep 22, 2026',
    daysRemaining: 4,
    assignedTo: 'Lubrication Crew 1',
    estimatedDowntime: '1.5 h',
    status: 'Upcoming',
    description: 'Replenish ISO VG 46 synthetic oil and flush sight glass.'
  },
  {
    id: 'WO-2026-0924',
    machineId: 'M-091',
    machineName: 'CNC 5-Axis Milling Unit',
    machineType: 'CNC Machine',
    location: 'Assembly Line 2',
    maintenanceType: 'Motor inspection & dynamic runout',
    priority: 'Low',
    dueDate: 'Sep 24, 2026',
    daysRemaining: 6,
    assignedTo: 'Precision Tooling Team',
    estimatedDowntime: '3 h',
    status: 'Upcoming',
    description: 'Precision spindle taper and drawbar retention force test.'
  },
  {
    id: 'WO-2026-0915',
    machineId: 'M-005',
    machineName: 'Reciprocating Booster Compressor',
    machineType: 'Centrifugal Compressor',
    location: 'Production Line 1',
    maintenanceType: 'Discharge Valve Teardown',
    priority: 'Critical',
    dueDate: 'Sep 17, 2026',
    daysRemaining: -1,
    assignedTo: 'Heavy Mechanics Team',
    estimatedDowntime: '6 h',
    status: 'Overdue',
    description: 'Valve leak identified; discharge temperature exceeded 82°C limit.'
  },
  {
    id: 'WO-2026-0916',
    machineId: 'M-064',
    machineName: 'CNC Vertical Lathe VL-03',
    machineType: 'CNC Machine',
    location: 'Production Line 2',
    maintenanceType: 'Spindle Preload Recalibration',
    priority: 'High',
    dueDate: 'Sep 16, 2026',
    daysRemaining: -2,
    assignedTo: 'Specialist Lathe Tech',
    estimatedDowntime: '5 h',
    status: 'Overdue',
    description: 'High harmonic vibration in lathe spindle during heavy turning cut.'
  },
  {
    id: 'WO-2026-0917',
    machineId: 'M-088',
    machineName: 'Main Drive Motor 01',
    machineType: 'Electric Motor',
    location: 'Assembly Line 1',
    maintenanceType: 'Thermal Imaging & Stator Fan Cleanout',
    priority: 'High',
    dueDate: 'Sep 18, 2026',
    daysRemaining: 0,
    assignedTo: 'Electrical Team Alpha',
    estimatedDowntime: '3 h',
    status: 'In Progress',
    description: 'Investigating 72.8°C hotspot on terminal connection box.'
  },
  {
    id: 'WO-2026-0918',
    machineId: 'M-017',
    machineName: 'Industrial Feed Pump B',
    machineType: 'Industrial Pump',
    location: 'Cooling Area',
    maintenanceType: 'Impeller Cavitation Check',
    priority: 'Medium',
    dueDate: 'Sep 18, 2026',
    daysRemaining: 0,
    assignedTo: 'Pump Specialist Group',
    estimatedDowntime: '2 h',
    status: 'In Progress',
    description: 'Suction strainer backwash and pressure differential measurement.'
  },
  {
    id: 'WO-2026-0912',
    machineId: 'M-031',
    machineName: 'Hydraulic Pack Station 04',
    machineType: 'Industrial Pump',
    location: 'Assembly Line 1',
    maintenanceType: 'Hydraulic Oil Flush & Filter Replacement',
    priority: 'Low',
    dueDate: 'Sep 17, 2026',
    daysRemaining: 0,
    assignedTo: 'Fluid Systems Crew',
    estimatedDowntime: '2.5 h',
    status: 'Completed',
    description: 'Complete change of 200L hydraulic mineral oil and filter cartridge replacement.'
  },
  {
    id: 'WO-2026-0910',
    machineId: 'M-104',
    machineName: 'Robotic Pick & Place Gantry',
    machineType: 'Robotics Arm',
    location: 'Packaging Line',
    maintenanceType: 'Servo Brake Torque Test',
    priority: 'Low',
    dueDate: 'Sep 15, 2026',
    daysRemaining: 0,
    assignedTo: 'Automation Specialist',
    estimatedDowntime: '1 h',
    status: 'Completed',
    description: 'Static holding torque verified on all 6 axes within manufacturer specs.'
  }
];

// Risk Intelligence List
export const RISKS_DATA: RiskItem[] = [
  {
    machineId: 'M-005',
    machineName: 'Reciprocating Booster Compressor',
    machineType: 'Centrifugal Compressor',
    location: 'Production Line 1',
    riskScore: 89,
    riskLevel: 'Critical',
    primaryDriver: 'Valve Leakage & Thermal Strain',
    supportingEvidence: [
      'Discharge temperature exceeded 82°C critical trip threshold (+21% above baseline)',
      'High amplitude pressure pulsations (+26% variance in discharge header)',
      'Crosshead pin vibration spectrum exhibiting impact harmonics'
    ],
    recommendedAction: 'Emergency valve plate overhaul and discharge cooling check',
    factors: [
      { factor: 'Thermal Exceedance', contribution: 40, value: '82.1°C', baseline: '68.0°C', status: 'critical' },
      { factor: 'Vibration Amplitude', contribution: 35, value: '7.2 mm/s', baseline: '4.8 mm/s', status: 'critical' },
      { factor: 'Discharge Pressure Pulse', contribution: 25, value: '11.4 bar (±26%)', baseline: '9.0 bar', status: 'elevated' }
    ]
  },
  {
    machineId: 'M-042',
    machineName: 'Centrifugal Compressor 02',
    machineType: 'Centrifugal Compressor',
    location: 'Production Line 2',
    riskScore: 87,
    riskLevel: 'Critical',
    primaryDriver: 'Vibration',
    supportingEvidence: [
      'Vibration +31% vs machine baseline (6.8 vs 4.9 mm/s)',
      'Temperature +14% vs baseline (78.4°C vs 68.8°C)',
      '3 similar historical failures exhibited identical frequency signature'
    ],
    recommendedAction: 'Inspect bearing assembly during next maintenance window',
    factors: [
      { factor: 'Overall Vibration', contribution: 45, value: '6.8 mm/s', baseline: '4.9 mm/s', status: 'critical' },
      { factor: 'Bearing Temperature', contribution: 30, value: '78.4°C', baseline: '68.8°C', status: 'elevated' },
      { factor: 'Historical Pattern Match', contribution: 25, value: '3 prior matches', baseline: '0 matches', status: 'critical' }
    ]
  },
  {
    machineId: 'M-088',
    machineName: 'Main Drive Motor 01',
    machineType: 'Electric Motor',
    location: 'Assembly Line 1',
    riskScore: 76,
    riskLevel: 'High',
    primaryDriver: 'Stator Overheating & Current Imbalance',
    supportingEvidence: [
      'Winding temperature elevated by +11°C during nominal load (72.8°C)',
      'Current phase imbalance detected at 3.8% (tolerance 2.0%)',
      'Drive-end bearing vibration in warning threshold'
    ],
    recommendedAction: 'Schedule inspection & insulation resistance test',
    factors: [
      { factor: 'Stator Winding Heat', contribution: 40, value: '72.8°C', baseline: '61.5°C', status: 'elevated' },
      { factor: 'Phase Imbalance', contribution: 35, value: '3.8%', baseline: '< 1.5%', status: 'critical' },
      { factor: 'Vibration Level', contribution: 25, value: '5.7 mm/s', baseline: '4.2 mm/s', status: 'elevated' }
    ]
  },
  {
    machineId: 'M-064',
    machineName: 'CNC Vertical Lathe VL-03',
    machineType: 'CNC Machine',
    location: 'Production Line 2',
    riskScore: 73,
    riskLevel: 'High',
    primaryDriver: 'Spindle Bearing Degradation',
    supportingEvidence: [
      'Spindle front bearing cage frequency detected via envelope analysis',
      'Thermal drift of chuck center exceeds 35 microns'
    ],
    recommendedAction: 'Inspect spindle front bearing preload & thermal jacket',
    factors: [
      { factor: 'Vibration Spike', contribution: 50, value: 'Peak 4.2 mm/s', baseline: '< 2.0 mm/s', status: 'critical' },
      { factor: 'Thermal Expansion', contribution: 30, value: '71.0°C', baseline: '58.0°C', status: 'elevated' },
      { factor: 'Operating Time', contribution: 20, value: '9,110 h', baseline: '8,000 h limit', status: 'elevated' }
    ]
  },
  {
    machineId: 'M-017',
    machineName: 'Industrial Feed Pump B',
    machineType: 'Industrial Pump',
    location: 'Cooling Area',
    riskScore: 58,
    riskLevel: 'Medium',
    primaryDriver: 'Hydraulic Cavitation',
    supportingEvidence: [
      '+19% harmonic vibration amplitude at 120Hz',
      'Discharge pressure variance ±12% during peak flow'
    ],
    recommendedAction: 'Check vibration trend and suction pressure filter',
    factors: [
      { factor: 'Suction Differential', contribution: 50, value: '±12% variance', baseline: '±3% variance', status: 'elevated' },
      { factor: 'Impeller Runtime', contribution: 30, value: '12,410 h', baseline: '10,000 h', status: 'elevated' },
      { factor: 'Fluid Temperature', contribution: 20, value: '64.2°C', baseline: '58.0°C', status: 'normal' }
    ]
  },
  {
    machineId: 'M-021',
    machineName: 'High-Torque Extruder Motor',
    machineType: 'Electric Motor',
    location: 'Production Line 1',
    riskScore: 52,
    riskLevel: 'Medium',
    primaryDriver: 'Mechanical Wear',
    supportingEvidence: [
      'Bearing lubrication cycle due within 48 hours',
      'Minor axial vibration drift (+8% vs 30-day baseline)'
    ],
    recommendedAction: 'Bearing inspection & regreasing',
    factors: [
      { factor: 'Lubrication Due Date', contribution: 55, value: '2 days overdue', baseline: '0 days', status: 'elevated' },
      { factor: 'Axial Vibration', contribution: 45, value: '5.1 mm/s', baseline: '4.6 mm/s', status: 'normal' }
    ]
  }
];

// Maintenance Recommendations
export const INITIAL_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: 'REC-001',
    machineId: 'M-042',
    machineName: 'Centrifugal Compressor 02',
    machineType: 'Centrifugal Compressor',
    priority: 'High',
    recommendation: 'Inspect bearing assembly during next maintenance window.',
    reason: 'Vibration has remained above the machine baseline for 8 hours (6.8 mm/s vs 4.9 mm/s baseline) and temperature is trending upward.',
    expectedImpact: 'Bearing inspection suggested by vibration trend.',
    status: 'Pending',
    suggestedWindow: 'Next planned shift shutdown (Within 48 hours)',
    estimatedDowntime: '4.0 h',
    generatedDate: 'Sep 18, 2026 · 03:42'
  },
  {
    id: 'REC-002',
    machineId: 'M-005',
    machineName: 'Reciprocating Booster Compressor',
    machineType: 'Centrifugal Compressor',
    priority: 'High',
    recommendation: 'Perform emergency discharge valve plate inspection & cooling line backflush.',
    reason: 'Discharge temperature sustained above 82°C trip threshold with high pulsation variance (+26%).',
    expectedImpact: 'Inspection suggested by temperature trend.',
    status: 'Pending',
    suggestedWindow: 'Immediate scheduled lockout (Next 12 hours)',
    estimatedDowntime: '6.0 h',
    generatedDate: 'Sep 18, 2026 · 02:15'
  },
  {
    id: 'REC-003',
    machineId: 'M-088',
    machineName: 'Main Drive Motor 01',
    machineType: 'Electric Motor',
    priority: 'High',
    recommendation: 'Measure winding insulation resistance (Megger test) and balance electrical phases.',
    reason: 'Current phase imbalance of 3.8% alongside stator temperature rise to 72.8°C indicates winding degradation.',
    expectedImpact: 'Mitigates risk of motor burnout and $14,000 rewinding expense.',
    status: 'Pending',
    suggestedWindow: 'Weekend maintenance schedule',
    estimatedDowntime: '3.0 h',
    generatedDate: 'Sep 17, 2026 · 22:30'
  },
  {
    id: 'REC-004',
    machineId: 'M-017',
    machineName: 'Industrial Feed Pump B',
    machineType: 'Industrial Pump',
    priority: 'Medium',
    recommendation: 'Perform acoustic leak detection on suction pipe and flush intake strainer.',
    reason: 'Mild hydraulic cavitation detected at 120Hz harmonic with pressure fluctuations.',
    expectedImpact: 'Extends impeller wear life by an estimated 2,800 operating hours.',
    status: 'Approved',
    suggestedWindow: 'Routine maintenance block (Sep 22)',
    estimatedDowntime: '1.5 h',
    generatedDate: 'Sep 17, 2026 · 16:10'
  },
  {
    id: 'REC-005',
    machineId: 'M-064',
    machineName: 'CNC Vertical Lathe VL-03',
    machineType: 'CNC Machine',
    priority: 'High',
    recommendation: 'Tighten front spindle bearing locknut to 180 Nm and verify lubricant cleanliness.',
    reason: 'Vibration above warning threshold on recent readings.',
    expectedImpact: 'Preserves machining tolerance within ±5 microns and prevents spindle seizure.',
    status: 'Pending',
    suggestedWindow: 'Next tooling changeover',
    estimatedDowntime: '3.5 h',
    generatedDate: 'Sep 18, 2026 · 01:05'
  },
  {
    id: 'REC-006',
    machineId: 'M-076',
    machineName: 'Centrifugal Slurry Pump',
    machineType: 'Industrial Pump',
    priority: 'Low',
    recommendation: 'Execute standard lubrication replenishment cycle.',
    reason: 'Machine has accumulated 2,000 runtime hours since last lubrication event.',
    expectedImpact: 'Maintains baseline seal reliability across continuous operation.',
    status: 'Approved',
    suggestedWindow: 'Sep 22, 2026',
    estimatedDowntime: '1.0 h',
    generatedDate: 'Sep 16, 2026 · 08:00'
  }
];

// Alerts List
export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-1082',
    severity: 'High',
    machineId: 'M-042',
    machineName: 'Centrifugal Compressor 02',
    location: 'Production Line 2',
    event: 'Vibration anomaly detected (6.8 mm/s exceeded 6.5 mm/s critical threshold)',
    timestamp: '2h ago (Sep 18, 01:42)',
    status: 'Detected',
    action: 'Inspect bearing assembly',
    metric: 'Vibration: 6.8 mm/s (+38.8% vs expected)',
    details: 'Radial vibration probe at drive-end registered continuous high amplitude for over 120 minutes.'
  },
  {
    id: 'ALT-1081',
    severity: 'Medium',
    machineId: 'M-017',
    machineName: 'Industrial Feed Pump B',
    location: 'Cooling Area',
    event: 'Temperature trend deviation (+14% vs baseline)',
    timestamp: '4h ago (Sep 17, 23:42)',
    status: 'Reviewed',
    action: 'Check cooling loop flow',
    metric: 'Temperature: 64.2°C (baseline: 56.0°C)',
    details: 'Cooling jacket discharge temperature drift observed during steady operating load.'
  },
  {
    id: 'ALT-1080',
    severity: 'High',
    machineId: 'M-088',
    machineName: 'Main Drive Motor 01',
    location: 'Assembly Line 1',
    event: 'Failure risk increased from Medium to High',
    timestamp: '6h ago (Sep 17, 21:42)',
    status: 'Detected',
    action: 'Schedule inspection',
    metric: 'Risk Score: 76 (Threshold: 70)',
    details: 'Multiple concurrent sensor trends (current imbalance + winding heat) triggered risk recalculation.'
  },
  {
    id: 'ALT-1079',
    severity: 'High',
    machineId: 'M-005',
    machineName: 'Reciprocating Booster Compressor',
    location: 'Production Line 1',
    event: 'Discharge temperature exceeded safety critical limit (82.1°C vs 80.0°C)',
    timestamp: '7h ago (Sep 17, 20:30)',
    status: 'Reviewed',
    action: 'Inspect compressor valve plates',
    metric: 'Temperature: 82.1°C',
    details: 'Emergency high temperature interlock warning logged by supervisory system.'
  },
  {
    id: 'ALT-1078',
    severity: 'Medium',
    machineId: 'M-064',
    machineName: 'CNC Vertical Lathe VL-03',
    location: 'Production Line 2',
    event: 'Spindle vibration harmonic drift detected',
    timestamp: '11h ago (Sep 17, 16:15)',
    status: 'Reviewed',
    action: 'Verify tool chuck balance',
    metric: 'Vibration: 5.9 mm/s',
    details: 'Elevated 2x line frequency vibration detected across 3 consecutive finishing passes.'
  },
  {
    id: 'ALT-1077',
    severity: 'Low',
    machineId: 'M-031',
    machineName: 'Hydraulic Pack Station 04',
    location: 'Assembly Line 1',
    event: 'Maintenance completed & baseline recalibrated',
    timestamp: 'Yesterday (Sep 17, 10:00)',
    status: 'Resolved',
    action: 'Log closure',
    metric: 'Post-maintenance test passed',
    details: 'Filter delta-P and vibration normalized within target envelope.'
  }
];

// Sensor Anomaly Events for Sensor Analytics page
export const SENSOR_ANOMALIES: SensorAnomaly[] = [
  { id: 'ANOM-441', timestamp: 'Sep 18 14:03', machineId: 'M-042', machineName: 'Centrifugal Compressor 02', sensor: 'Vibration', observed: '6.8 mm/s', expected: '4.9 mm/s', deviation: '+38.8%', severity: 'High' },
  { id: 'ANOM-440', timestamp: 'Sep 18 10:12', machineId: 'M-042', machineName: 'Centrifugal Compressor 02', sensor: 'Temperature', observed: '78.4°C', expected: '68.8°C', deviation: '+14.0%', severity: 'High' },
  { id: 'ANOM-439', timestamp: 'Sep 18 09:30', machineId: 'M-005', machineName: 'Reciprocating Booster Compressor', sensor: 'Temperature', observed: '82.1°C', expected: '68.0°C', deviation: '+20.7%', severity: 'Critical' },
  { id: 'ANOM-438', timestamp: 'Sep 18 08:45', machineId: 'M-088', machineName: 'Main Drive Motor 01', sensor: 'Current', observed: '198.2 A', expected: '175.0 A', deviation: '+13.3%', severity: 'Medium' },
  { id: 'ANOM-437', timestamp: 'Sep 18 06:15', machineId: 'M-017', machineName: 'Industrial Feed Pump B', sensor: 'Pressure', observed: '6.2 bar', expected: '7.1 bar', deviation: '-12.7%', severity: 'Medium' },
  { id: 'ANOM-436', timestamp: 'Sep 17 22:50', machineId: 'M-064', machineName: 'CNC Vertical Lathe VL-03', sensor: 'Vibration', observed: '5.9 mm/s', expected: '4.5 mm/s', deviation: '+31.1%', severity: 'High' },
  { id: 'ANOM-435', timestamp: 'Sep 17 18:20', machineId: 'M-021', machineName: 'High-Torque Extruder Motor', sensor: 'Vibration', observed: '5.1 mm/s', expected: '4.6 mm/s', deviation: '+10.8%', severity: 'Low' }
];

// Data Sources (Frontend Mock analytical sources)
export const DATA_SOURCES_DATA: DataSourceItem[] = [
  { id: 'DS-01', name: 'Sensor History', status: 'Connected', lastIngestion: 'Sep 18, 2026 · 03:42', rows: '180,519 records', rowCount: 180519, coverage: 'Jan 2024 – Sep 2026', quality: 97.4, frequency: 'Hourly batch', type: 'CSV Import' },
  { id: 'DS-02', name: 'Machine Registry', status: 'Connected', lastIngestion: 'Sep 18, 2026 · 01:00', rows: '128 assets', rowCount: 128, coverage: 'Full fleet', quality: 99.2, frequency: 'Daily sync', type: 'CSV Import' },
  { id: 'DS-03', name: 'Failure History (Event Logs)', status: 'Connected', lastIngestion: 'Sep 17, 2026 · 23:59', rows: '1,420 incidents', rowCount: 1420, coverage: '5-Year Historical Log', quality: 95.8, frequency: 'Event-driven batch', type: 'Work Order History' },
  { id: 'DS-04', name: 'Maintenance History (Work Orders)', status: 'Connected', lastIngestion: 'Sep 18, 2026 · 02:30', rows: '4,890 work orders', rowCount: 4890, coverage: 'Jan 2022 – Sep 2026', quality: 96.1, frequency: 'Shift-based export', type: 'Preventive Maintenance DB' }
];

// Data Quality Metrics
export const DATA_QUALITY_METRICS: QualityMetric = {
  overallQuality: 96.8,
  completeness: 98.2,
  validity: 97.1,
  consistency: 95.9,
  duplicateRate: 0.4,
  missingValuesCount: 842,
  invalidReadingsCount: 314,
  duplicateRecordsCount: 722,
  outlierRecordsCount: 129
};

export const DATASET_QUALITY_BREAKDOWN: DatasetQuality[] = [
  { dataset: 'Sensor History', records: '180,519', completeness: 98.9, validity: 97.4, consistency: 96.2, outliers: 94, status: 'Good' },
  { dataset: 'Machine Registry', records: '128', completeness: 100.0, validity: 99.2, consistency: 99.5, outliers: 0, status: 'Good' },
  { dataset: 'Failure History', records: '1,420', completeness: 95.2, validity: 94.8, consistency: 93.9, outliers: 21, status: 'Attention' },
  { dataset: 'Maintenance History', records: '4,890', completeness: 96.8, validity: 96.1, consistency: 95.4, outliers: 14, status: 'Good' }
];

// Analysis Runs
export const ANALYSIS_RUNS_DATA: AnalysisRunItem[] = [
  { id: 'RUN-2026-0918-0342', started: 'Sep 18 03:42', completed: 'Sep 18 03:44', dataset: 'Sensor History', records: '180,519', status: 'Completed', duration: '2m 14s', trigger: 'Scheduled (Cron)', findings: '4 anomalies detected, 2 high-risk conditions evaluated' },
  { id: 'RUN-2026-0917-1542', started: 'Sep 17 15:42', completed: 'Sep 17 15:45', dataset: 'Sensor History', records: '180,210', status: 'Completed', duration: '2m 31s', trigger: 'Scheduled (Cron)', findings: 'Normal fleet distribution, M-017 trend flagged' },
  { id: 'RUN-2026-0917-0342', started: 'Sep 17 03:42', completed: 'Sep 17 03:44', dataset: 'Sensor History', records: '179,890', status: 'Completed', duration: '2m 08s', trigger: 'Scheduled (Cron)', findings: 'Completed baseline reconciliation' },
  { id: 'RUN-2026-0916-1800', started: 'Sep 16 18:00', completed: 'Sep 16 18:03', dataset: 'Maintenance History', records: '4,890', status: 'Completed', duration: '2m 45s', trigger: 'Manual', findings: 'Work order history imported' },
  { id: 'RUN-2026-0916-0342', started: 'Sep 16 03:42', completed: 'Sep 16 03:44', dataset: 'Sensor History', records: '179,520', status: 'Completed', duration: '2m 12s', trigger: 'Scheduled (Cron)', findings: 'Fleet-wide health scores updated' },
  { id: 'RUN-2026-0915-2110', started: 'Sep 15 21:10', completed: 'Sep 15 21:11', dataset: 'Failure History', records: '1,420', status: 'Failed', duration: '48s', trigger: 'Manual', findings: 'Parquet schema mismatch on column "failure_code" (Auto-repaired in next run)' }
];

// Administration - Users
export const USERS_DATA: UserItem[] = [
  { id: 'USR-01', name: 'Aziz Trabelsi', email: 'aziz.trabelsi@example.com', role: 'Maintenance Manager', status: 'Active', lastActive: '2 min ago', created: 'Jan 10, 2025' },
  { id: 'USR-02', name: 'Karim Ben Salem', email: 'karim.bensalem@example.com', role: 'Reliability Engineer', status: 'Active', lastActive: '14 min ago', created: 'Feb 15, 2025' },
  { id: 'USR-03', name: 'Mehdi Cherif', email: 'mehdi.cherif@example.com', role: 'Reliability Engineer', status: 'Active', lastActive: '1h ago', created: 'Mar 01, 2025' },
  { id: 'USR-04', name: 'Sarra Mansouri', email: 'sarra.mansouri@example.com', role: 'Analyst', status: 'Active', lastActive: '3h ago', created: 'May 12, 2025' },
  { id: 'USR-05', name: 'Hedi Ayari', email: 'hedi.ayari@example.com', role: 'Administrator', status: 'Active', lastActive: 'Yesterday', created: 'Jan 01, 2025' },
  { id: 'USR-06', name: 'Nour Bouazizi', email: 'nour.bouazizi@example.com', role: 'Viewer', status: 'Inactive', lastActive: '12 days ago', created: 'Jun 20, 2025' }
];

// Administration - Audit Log
export const AUDIT_EVENTS_DATA: AuditEventItem[] = [
  { id: 'AUD-901', timestamp: 'Sep 18 03:42', user: 'system.daemon', role: 'System Cron', action: 'Analysis run started', resource: 'Sensor History (RUN-2026-0918-0342)', result: 'Success', details: 'Full fleet anomaly detection completed in 2m 14s' },
  { id: 'AUD-900', timestamp: 'Sep 18 02:15', user: 'aziz.trabelsi', role: 'Maintenance Manager', action: 'Approved recommendation', resource: 'REC-004 (M-017)', result: 'Success', details: 'Cavitation check noted' },
  { id: 'AUD-899', timestamp: 'Sep 18 01:45', user: 'karim.bensalem', role: 'Reliability Engineer', action: 'Reviewed alert', resource: 'ALT-1082 (M-042)', result: 'Success', details: 'Logged observation: Bearing envelope amplitude verified' },
  { id: 'AUD-898', timestamp: 'Sep 17 19:20', user: 'hedi.ayari', role: 'Administrator', action: 'Modified alert threshold', resource: 'System Settings: Vibration Warning', result: 'Success', details: 'Threshold changed from 5.4 mm/s to 5.5 mm/s' },
  { id: 'AUD-897', timestamp: 'Sep 17 15:42', user: 'system.daemon', role: 'System Cron', action: 'Analysis run started', resource: 'Sensor History (RUN-2026-0917-1542)', result: 'Success', details: '180,210 records ingested without schema discrepancy' },
  { id: 'AUD-896', timestamp: 'Sep 17 10:15', user: 'mehdi.cherif', role: 'Reliability Engineer', action: 'Work order completed', resource: 'WO-2026-0912 (M-031)', result: 'Success', details: 'Hydraulic oil flush signed off' }
];

// Initial Settings Thresholds
export const INITIAL_THRESHOLDS: ThresholdSettings = {
  tempWarning: 75,
  tempCritical: 85,
  vibWarning: 5.5,
  vibCritical: 6.5,
  pressureWarning: 9.5,
  pressureCritical: 11.0,
  rpmWarning: 3600,
  rpmCritical: 4000
};
