import { Body, Controller, Get, Post, HttpCode, HttpStatus, Res } from '@nestjs/common';
import express from 'express';
import { PumpService } from './pump.service';
import { SensorData } from './dto/pump-data.dto';

@Controller()
export class PumpController {
  constructor(private readonly pumpService: PumpService) {}

  @Get('getData')
  getLatestData(): { success: boolean; data: SensorData | null; count: number } {
    const latestData = this.pumpService.getLatestData();
    return {
      success: true,
      data: latestData,
      count: this.pumpService.getDataCount()
    };
  }

  @Get('getAllData')
  getAllData(): { success: boolean; data: SensorData[]; count: number } {
    const allData = this.pumpService.getAllData();
    return {
      success: true,
      data: allData,
      count: allData.length
    };
  }

  @Post('addData')
  @HttpCode(HttpStatus.CREATED)
  addData(@Body() data: Record<number, any>): { success: boolean; data: SensorData; count: number } {
    const addedData = this.pumpService.addData(data);
    return {
      success: true,
      data: addedData,
      count: this.pumpService.getDataCount()
    };
  }

  @Post('clear')
  @HttpCode(HttpStatus.OK)
  clearData(): { success: boolean; message: string } {
    this.pumpService.clearData();
    return {
      success: true,
      message: 'Tüm veriler temizlendi'
    };
  }

  @Get('online')
  getOnlinePage(@Res() res: express.Response) {
    const html = `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pump Endurus - Online Monitoring</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 20px;
            background: rgba(255,255,255,0.2);
            border-radius: 20px;
            margin-top: 10px;
        }
        
        .status-badge.online {
            background: #10b981;
        }
        
        .status-badge.offline {
            background: #ef4444;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }
        
        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .card-icon {
            width: 50px;
            height: 50px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            font-size: 24px;
        }
        
        .card-title {
            font-size: 0.9rem;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .card-value {
            font-size: 2.5rem;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
        }
        
        .card-unit {
            font-size: 1rem;
            color: #9ca3af;
        }
        
        .card-footer {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            font-size: 0.85rem;
            color: #6b7280;
        }
        
        .info-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            background: #f9fafb;
            border-radius: 8px;
        }
        
        .info-label {
            color: #6b7280;
            font-weight: 500;
        }
        
        .info-value {
            color: #1f2937;
            font-weight: 600;
        }
        
        .loading {
            text-align: center;
            color: white;
            font-size: 1.5rem;
            padding: 50px;
        }
        
        .error {
            background: #fee2e2;
            color: #991b1b;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .updating {
            animation: pulse 1.5s ease-in-out infinite;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚙️ Pump Endurus</h1>
            <p>Gerçek Zamanlı İzleme Sistemi</p>
            <div class="status-badge" id="statusBadge">
                🔄 Bağlanıyor...
            </div>
        </div>
        
        <div id="content">
            <div class="loading">
                <div class="updating">📊 Veriler yükleniyor...</div>
            </div>
        </div>
    </div>

    <script>
        let updateInterval;
        let isOnline = false;

        async function fetchData() {
            try {
                const response = await fetch('/pump/getData');
                const result = await response.json();
                
                if (result.success && result.data) {
                    isOnline = true;
                    updateUI(result.data, result.count);
                    updateStatusBadge(true);
                } else {
                    isOnline = false;
                    updateStatusBadge(false);
                    showNoData();
                }
            } catch (error) {
                console.error('Veri çekme hatası:', error);
                isOnline = false;
                updateStatusBadge(false);
                showError(error.message);
            }
        }

        function updateStatusBadge(online) {
            const badge = document.getElementById('statusBadge');
            if (online) {
                badge.className = 'status-badge online';
                badge.textContent = '🟢 Online';
            } else {
                badge.className = 'status-badge offline';
                badge.textContent = '🔴 Offline';
            }
        }

        function updateUI(data, count) {
            const content = document.getElementById('content');
            content.innerHTML = \`
                <div class="grid">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon" style="background: #fef3c7; color: #f59e0b;">⚡</div>
                            <div class="card-title">Amper Metre</div>
                        </div>
                        <div class="card-value">\${data.AmperMeter.toFixed(2)}</div>
                        <div class="card-unit">Amper (A)</div>
                        <div class="card-footer">Son güncelleme: \${new Date(data.timestamp).toLocaleString('tr-TR')}</div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon" style="background: #dbeafe; color: #3b82f6;">💧</div>
                            <div class="card-title">Basınç Manometre</div>
                        </div>
                        <div class="card-value">\${data.PressureManometer.toFixed(2)}</div>
                        <div class="card-unit">Bar</div>
                        <div class="card-footer">Son güncelleme: \${new Date(data.timestamp).toLocaleString('tr-TR')}</div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon" style="background: #ddd6fe; color: #8b5cf6;">🛢️</div>
                            <div class="card-title">Yakıt Akış Ölçer</div>
                        </div>
                        <div class="card-value">\${data.FlowMeterFuel.toFixed(2)}</div>
                        <div class="card-unit">L/dk</div>
                        <div class="card-footer">Son güncelleme: \${new Date(data.timestamp).toLocaleString('tr-TR')}</div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon" style="background: #fee2e2; color: #ef4444;">🌡️</div>
                            <div class="card-title">Yakıt Sıcaklığı</div>
                        </div>
                        <div class="card-value">\${data.TemperatureFuel.toFixed(1)}</div>
                        <div class="card-unit">°C</div>
                        <div class="card-footer">Son güncelleme: \${new Date(data.timestamp).toLocaleString('tr-TR')}</div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon" style="background: #d1fae5; color: #10b981;">🌡️</div>
                            <div class="card-title">Ortam Sıcaklığı</div>
                        </div>
                        <div class="card-value">\${data.TemperatureEnvironment.toFixed(1)}</div>
                        <div class="card-unit">°C</div>
                        <div class="card-footer">Son güncelleme: \${new Date(data.timestamp).toLocaleString('tr-TR')}</div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon" style="background: #e0e7ff; color: #6366f1;">🔘</div>
                            <div class="card-title">Switch Durumu</div>
                        </div>
                        <div class="card-value">\${data.Switch === 1 ? 'ON' : 'OFF'}</div>
                        <div class="card-unit">\${data.Switch === 1 ? '✅ Aktif' : '⭕ Pasif'}</div>
                        <div class="card-footer">Son güncelleme: \${new Date(data.timestamp).toLocaleString('tr-TR')}</div>
                    </div>
                </div>

                <div class="info-card">
                    <h2 style="margin-bottom: 20px; color: #1f2937;">📊 Sistem Bilgileri</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Cycle</span>
                            <span class="info-value">\${data.cycle}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Tarih/Saat</span>
                            <span class="info-value">\${data.DateTime}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Kayıt Sayısı</span>
                            <span class="info-value">\${count}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Son Güncelleme</span>
                            <span class="info-value">\${new Date(data.timestamp).toLocaleTimeString('tr-TR')}</span>
                        </div>
                    </div>
                </div>
            \`;
        }

        function showNoData() {
            const content = document.getElementById('content');
            content.innerHTML = \`
                <div class="error">
                    <h2>⚠️ Veri Bulunamadı</h2>
                    <p>Henüz sensörlerden veri alınmamış.</p>
                </div>
            \`;
        }

        function showError(message) {
            const content = document.getElementById('content');
            content.innerHTML = \`
                <div class="error">
                    <h2>❌ Bağlantı Hatası</h2>
                    <p>\${message}</p>
                </div>
            \`;
        }

        // İlk veri çekimi
        fetchData();

        // Her 2 saniyede bir güncelle
        updateInterval = setInterval(fetchData, 2000);

        // Sayfa kapatıldığında interval'i temizle
        window.addEventListener('beforeunload', () => {
            clearInterval(updateInterval);
        });
    </script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}

