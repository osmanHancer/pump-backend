import { Injectable } from '@nestjs/common';
import { SensorData } from './dto/pump-data.dto';

@Injectable()
export class PumpService {
  private dataStore: SensorData[] = [];
  private readonly MAX_RECORDS = 100;

  private readonly sensorMapping = {
    1: 'AmperMeter',
    2: 'PressureManometer',
    3: 'FlowMeterFuel',
    4: 'TemperatureFuel',
    5: 'TemperatureEnvironment',
    6: 'Switch',
    7: 'DateTime'
  };

  addData(rawData: Record<number, any>): SensorData {
    // Convert numbered keys to named properties
    const sensorData: SensorData = {
      cycle: Number(rawData[0]) || 0,
      AmperMeter: Number(rawData[1]) || 0,  
      PressureManometer: Number(rawData[2]) || 0,
      FlowMeterFuel: Number(rawData[3]) || 0,
      TemperatureFuel: Number(rawData[4]) || 0,
      TemperatureEnvironment: Number(rawData[5]) || 0,
      Switch: Number(rawData[6]) || 0,
      DateTime: String(rawData[7]) || new Date().toISOString(),
    };

    // Add to store
    this.dataStore.push(sensorData);

    // Keep only last 100 records
    if (this.dataStore.length > this.MAX_RECORDS) {
      this.dataStore.shift(); // Remove oldest record
    }

    return sensorData;
  }

  getLatestData(): SensorData | null {
    if (this.dataStore.length === 0) {
      return null;
    }
    return this.dataStore[this.dataStore.length - 1];
  }

  getAllData(): SensorData[] {
    return this.dataStore;
  }

  getDataCount(): number {
    return this.dataStore.length;
  }

  clearData(): void {
    this.dataStore = [];
  }
}

