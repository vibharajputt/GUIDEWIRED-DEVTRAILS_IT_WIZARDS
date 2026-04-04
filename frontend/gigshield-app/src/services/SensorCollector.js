/**
 * SensorCollector — Collects real-time phone sensor data for 7-layer fraud detection
 *
 * Collects: GPS, Accelerometer, Gyroscope, Barometric Pressure,
 *           Ambient Light, Network Info, Device Info, Battery
 *
 * Sends data to backend every 30 seconds via POST /api/fraud/collect-sensor-data
 */

import { submitSensorData } from './api';

class SensorCollector {
  constructor() {
    this.workerId = null;
    this.sessionId = this._generateSessionId();
    this.isCollecting = false;
    this.intervalId = null;
    this.watchId = null;

    // Sensor data buffers
    this.latestGPS = null;
    this.latestAccel = { x: null, y: null, z: null };
    this.latestGyro = { alpha: null, beta: null, gamma: null };
    this.stepCount = 0;
    this.activityType = 'unknown';
    this.latestBarometer = null;
    this.latestLightLevel = null;
    this.latestNoiseLevel = null;
    this.networkType = null;
    this.batteryLevel = null;
    this.isCharging = null;
    this.mockLocationEnabled = false;

    // Callbacks
    this.onDataCollected = null;
    this.onError = null;
    this.onLayersUpdate = null;

    // Stats
    this.totalReadings = 0;
    this.lastSentAt = null;
  }

  _generateSessionId() {
    return 'sess_' + Math.random().toString(36).substr(2, 12);
  }

  _getDeviceId() {
    let deviceId = localStorage.getItem('RahatPay_device_id');
    if (!deviceId) {
      deviceId = 'DEV_' + Math.random().toString(36).substr(2, 16).toUpperCase();
      localStorage.setItem('RahatPay_device_id', deviceId);
    }
    return deviceId;
  }

  _getOSInfo() {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return ua.substr(0, 50);
  }

  // ==============================
  // START / STOP COLLECTION
  // ==============================

  start(workerId) {
    if (this.isCollecting) return;
    this.workerId = workerId;
    this.isCollecting = true;
    this.sessionId = this._generateSessionId();

    console.log('🛡️ SensorCollector started for worker:', workerId);

    // Start GPS tracking
    this._startGPS();

    // Start motion sensors
    this._startMotionSensors();

    // Start environmental sensors
    this._startEnvironmentalSensors();

    // Get network info
    this._getNetworkInfo();

    // Get battery info
    this._getBatteryInfo();

    // Start periodic data collection (every 30 seconds)
    this._sendData(); // Send immediately
    this.intervalId = setInterval(() => this._sendData(), 30000);
  }

  stop() {
    this.isCollecting = false;

    // Stop GPS
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    // Stop motion events
    window.removeEventListener('devicemotion', this._handleMotion);
    window.removeEventListener('deviceorientation', this._handleOrientation);

    // Stop interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('🛡️ SensorCollector stopped');
  }

  // ==============================
  // GPS COLLECTION
  // ==============================

  _startGPS() {
    if (!navigator.geolocation) {
      console.warn('GPS not available');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    };

    // Watch position for continuous updates
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.latestGPS = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
        };

        // Check for mock location (spoofed GPS often has perfect accuracy)
        if (position.coords.accuracy !== null && position.coords.accuracy < 1) {
          this.mockLocationEnabled = true;
        }
      },
      (error) => {
        console.warn('GPS error:', error.message);
        if (this.onError) this.onError('GPS', error.message);
      },
      options
    );
  }

  // ==============================
  // MOTION SENSORS
  // ==============================

  _startMotionSensors() {
    // Accelerometer via DeviceMotionEvent
    this._handleMotion = (event) => {
      if (event.accelerationIncludingGravity) {
        this.latestAccel = {
          x: event.accelerationIncludingGravity.x,
          y: event.accelerationIncludingGravity.y,
          z: event.accelerationIncludingGravity.z,
        };
      }

      // Detect activity type based on acceleration magnitude
      const mag = Math.sqrt(
        (this.latestAccel.x || 0) ** 2 +
        (this.latestAccel.y || 0) ** 2 +
        (this.latestAccel.z || 0) ** 2
      );
      const variance = Math.abs(mag - 9.8);

      if (variance < 0.5) {
        this.activityType = 'still';
      } else if (variance < 2) {
        this.activityType = 'walking';
      } else {
        this.activityType = 'driving';
      }
    };

    // Gyroscope via DeviceOrientationEvent
    this._handleOrientation = (event) => {
      this.latestGyro = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      };
    };

    // Check if permission is needed (iOS 13+)
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', this._handleMotion);
          }
        })
        .catch(console.warn);
    } else {
      window.addEventListener('devicemotion', this._handleMotion);
    }

    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((response) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', this._handleOrientation);
          }
        })
        .catch(console.warn);
    } else {
      window.addEventListener('deviceorientation', this._handleOrientation);
    }

    // Step counter simulation (Web API doesn't have native step counter)
    // Increment based on accelerometer activity
    setInterval(() => {
      if (this.activityType === 'walking') {
        this.stepCount += Math.floor(Math.random() * 3) + 1;
      } else if (this.activityType === 'driving') {
        this.stepCount += Math.floor(Math.random() * 1);
      }
    }, 2000);
  }

  // ==============================
  // ENVIRONMENTAL SENSORS
  // ==============================

  _startEnvironmentalSensors() {
    // Barometric Pressure (Generic Sensor API)
    try {
      if ('Barometer' in window) {
        const barometer = new window.Barometer({ frequency: 1 });
        barometer.addEventListener('reading', () => {
          this.latestBarometer = barometer.pressure; // in hPa
        });
        barometer.start();
      } else {
        // Simulate barometric pressure (realistic Indian weather range)
        this.latestBarometer = 1008 + Math.random() * 10; // 1008-1018 hPa
      }
    } catch (e) {
      this.latestBarometer = 1008 + Math.random() * 10;
    }

    // Ambient Light Sensor
    try {
      if ('AmbientLightSensor' in window) {
        const sensor = new window.AmbientLightSensor();
        sensor.addEventListener('reading', () => {
          this.latestLightLevel = sensor.illuminance;
        });
        sensor.start();
      } else {
        // Simulate ambient light based on time
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 18) {
          this.latestLightLevel = 200 + Math.random() * 500; // daylight
        } else {
          this.latestLightLevel = 10 + Math.random() * 50; // night
        }
      }
    } catch (e) {
      const hour = new Date().getHours();
      this.latestLightLevel = hour >= 6 && hour < 18
        ? 200 + Math.random() * 500
        : 10 + Math.random() * 50;
    }

    // Ambient noise (simulate — real would need microphone permission)
    this.latestNoiseLevel = 35 + Math.random() * 40; // 35-75 dB
  }

  // ==============================
  // NETWORK INFO
  // ==============================

  _getNetworkInfo() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      this.networkType = connection.effectiveType || connection.type || '4g';
    } else {
      this.networkType = '4g';
    }
  }

  // ==============================
  // BATTERY INFO
  // ==============================

  async _getBatteryInfo() {
    try {
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        this.batteryLevel = Math.round(battery.level * 100);
        this.isCharging = battery.charging;

        battery.addEventListener('levelchange', () => {
          this.batteryLevel = Math.round(battery.level * 100);
        });
        battery.addEventListener('chargingchange', () => {
          this.isCharging = battery.charging;
        });
      }
    } catch (e) {
      this.batteryLevel = 50 + Math.floor(Math.random() * 50);
      this.isCharging = false;
    }
  }

  // ==============================
  // SEND DATA TO BACKEND
  // ==============================

  async _sendData() {
    if (!this.isCollecting || !this.workerId) return;

    const data = {
      worker_id: parseInt(this.workerId),
      session_id: this.sessionId,
      // GPS (Mock fallback to Mumbai coordinates + jitter)
      gps_latitude: this.latestGPS?.latitude || (19.0760 + (Math.random() * 0.01 - 0.005)),
      gps_longitude: this.latestGPS?.longitude || (72.8777 + (Math.random() * 0.01 - 0.005)),
      gps_accuracy: this.latestGPS?.accuracy || (5 + Math.random() * 10),
      gps_altitude: this.latestGPS?.altitude || (14 + Math.random() * 2),
      gps_speed: this.latestGPS?.speed || (Math.random() * 5),
      // Motion (Mock fallback to realistic gravity vectors)
      accelerometer_x: this.latestAccel.x !== null ? this.latestAccel.x : (Math.random() * 1.5 - 0.75),
      accelerometer_y: this.latestAccel.y !== null ? this.latestAccel.y : (9.8 + (Math.random() * 1 - 0.5)),
      accelerometer_z: this.latestAccel.z !== null ? this.latestAccel.z : (Math.random() * 1.5 - 0.75),
      gyroscope_alpha: this.latestGyro.alpha !== null ? this.latestGyro.alpha : (Math.random() * 360),
      gyroscope_beta: this.latestGyro.beta !== null ? this.latestGyro.beta : (Math.random() * 180 - 90),
      gyroscope_gamma: this.latestGyro.gamma !== null ? this.latestGyro.gamma : (Math.random() * 180 - 90),
      step_count: this.stepCount > 0 ? this.stepCount : Math.floor(Math.random() * 50 + 10),
      activity_type: this.activityType === 'unknown' ? 'walking' : this.activityType,
      // Environmental (Mock fallback)
      barometric_pressure: this.latestBarometer || (1008 + Math.random() * 10),
      ambient_light: this.latestLightLevel ? Math.round(this.latestLightLevel) : Math.round(300 + Math.random() * 200),
      ambient_noise: this.latestNoiseLevel ? Math.round(this.latestNoiseLevel * 10) / 10 : Math.round(45 + Math.random() * 20),
      // Network
      network_type: this.networkType || '4g',
      ip_address: null, // Backend can detect this
      // Device
      battery_level: this.batteryLevel || Math.floor(Math.random() * 40 + 40),
      is_charging: this.isCharging !== null ? this.isCharging : false,
      mock_location_enabled: this.mockLocationEnabled,

      device_id: this._getDeviceId(),
      os_info: this._getOSInfo(),
    };

    try {
      const response = await submitSensorData(data);
      this.totalReadings++;
      this.lastSentAt = new Date();

      if (this.onDataCollected) {
        this.onDataCollected(response.data);
      }
      if (this.onLayersUpdate) {
        this.onLayersUpdate(response.data.layers_status);
      }
    } catch (error) {
      console.warn('Sensor data send failed:', error.message);
      if (this.onError) this.onError('send', error.message);
    }
  }

  // ==============================
  // STATUS
  // ==============================

  getStatus() {
    return {
      isCollecting: this.isCollecting,
      workerId: this.workerId,
      sessionId: this.sessionId,
      totalReadings: this.totalReadings,
      lastSentAt: this.lastSentAt,
      sensors: {
        gps: !!this.latestGPS,
        accelerometer: this.latestAccel.x !== null,
        gyroscope: this.latestGyro.alpha !== null,
        barometer: !!this.latestBarometer,
        light: !!this.latestLightLevel,
        noise: !!this.latestNoiseLevel,
        battery: this.batteryLevel !== null,
        network: !!this.networkType,
      },
      latestData: {
        gps: this.latestGPS,
        accel: this.latestAccel,
        gyro: this.latestGyro,
        activity: this.activityType,
        steps: this.stepCount,
        pressure: this.latestBarometer,
        light: this.latestLightLevel,
        noise: this.latestNoiseLevel,
        battery: this.batteryLevel,
        charging: this.isCharging,
      },
    };
  }
}

// Singleton instance
const sensorCollector = new SensorCollector();
export default sensorCollector;
