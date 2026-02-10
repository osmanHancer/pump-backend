export class PumpDataDto {
  cycle: number;
  AmperMeter: number;
  PressureManometer: number;
  FlowMeterFuel: number;
  TemperatureFuel: number;
  TemperatureEnvironment: number;
  Switch: number;
  DateTime: string;
}

export interface SensorData {
  cycle: number;
  AmperMeter: number;
  PressureManometer: number;
  FlowMeterFuel: number;
  TemperatureFuel: number;
  TemperatureEnvironment: number;
  Switch: number;
  DateTime: string;
  timestamp: Date;
}

