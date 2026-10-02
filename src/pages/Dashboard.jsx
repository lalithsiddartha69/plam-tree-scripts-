import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../components/Header';
import SystemStatus from '../components/SystemStatus';
import SensorCard from '../components/SensorCard';
import RiskCard from '../components/RiskCard';
import RiskExplanation from '../components/RiskExplanation';
import EnvironmentalChart from '../components/EnvironmentalChart';
import RiskHistory from '../components/RiskHistory';
import AlertPanel from '../components/AlertPanel';
import CameraPanel from '../components/CameraPanel';
import DemoControls from '../components/DemoControls';
import api from '../services/api';
import wsService from '../services/websocket';
import { 
  DEMO_SCENARIOS, 
  generateMockHistory, 
  INITIAL_ALERTS, 
  PRESERVATION_THRESHOLDS 
} from '../services/mockData';
import { AlertCircle, WifiOff } from 'lucide-react';

export default function Dashboard() {
  // Primary State
  const [telemetry, setTelemetry] = useState(DEMO_SCENARIOS.safe.telemetry);
  const [previousTelemetry, setPreviousTelemetry] = useState(null);
  const [risk, setRisk] = useState(DEMO_SCENARIOS.safe.risk);
  const [history, setHistory] = useState(() => generateMockHistory(1, 20));
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [camera, setCamera] = useState(DEMO_SCENARIOS.safe.camera);

  // Connection & Lifecycle State
  const [wsStatus, setWsStatus] = useState('CONNECTING');
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to true for presentation safety
  const [activeScenarioId, setActiveScenarioId] = useState('safe');
  const [selectedRange, setSelectedRange] = useState('1h');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [backendError, setBackendError] = useState(null);

  // Automated 4-Step Hackathon Demo Story State
  const [isStoryRunning, setIsStoryRunning] = useState(false);
  const [storyStep, setStoryStep] = useState(0);
  const storyTimerRef = useRef(null);

  // 1. Initialize WebSocket Connection & Subscriptions
  useEffect(() => {
    wsService.connect();

    const unsubStatus = wsService.onStatusChange((status) => {
      setWsStatus(status);
      if (status === 'CONNECTED') {
        setBackendError(null);
      }
    });

    const unsubTelemetry = wsService.subscribe('TELEMETRY_UPDATE', (data) => {
      setPreviousTelemetry((prev) => prev || telemetry);
      setTelemetry(data);
      // Append to local chart history if not duplicate
      setHistory((prev) => [
        ...prev.slice(-35),
        {
          timestamp: data.timestamp,
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          temperature: data.temperature,
          humidity: data.humidity,
          light: data.light,
          uv: data.uv,
          pm25: data.pm25,
          risk_score: risk.risk_score,
        },
      ]);
    });

    const unsubRisk = wsService.subscribe('RISK_UPDATE', (data) => {
      setRisk(data);
    });

    const unsubAlert = wsService.subscribe('ALERT_TRIGGERED', (data) => {
      // Sensible deduplication: don't add if identical unacknowledged alert exists within 2 minutes
      setAlerts((prev) => {
        const isDuplicate = prev.some(
          (a) => !a.acknowledged && a.reason === data.reason
        );
        if (isDuplicate) return prev;
        return [data, ...prev];
      });
    });

    const unsubCamera = wsService.subscribe('CAMERA_UPDATE', (data) => {
      setCamera(data);
    });

    return () => {
      unsubStatus();
      unsubTelemetry();
      unsubRisk();
      unsubAlert();
      unsubCamera();
      wsService.disconnect();
    };
  }, []);

  // 2. Fetch Data from REST API (Used on mount, refresh, and as fallback)
  const syncWithBackend = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Try to query backend endpoints
      const [latestTele, latestRisk, alertList] = await Promise.allSettled([
        api.getLatestTelemetry(),
        api.getLatestRisk(),
        api.getAlerts(),
      ]);

      let backendResponded = false;

      if (latestTele.status === 'fulfilled' && latestTele.value) {
        setPreviousTelemetry(telemetry);
        setTelemetry(latestTele.value);
        backendResponded = true;
      }

      if (latestRisk.status === 'fulfilled' && latestRisk.value) {
        setRisk(latestRisk.value);
        backendResponded = true;
      }

      if (alertList.status === 'fulfilled' && Array.isArray(alertList.value)) {
        setAlerts(alertList.value);
        backendResponded = true;
      }

      if (backendResponded) {
        setBackendError(null);
        setIsDemoMode(false); // Live data detected
      }
    } catch (err) {
      console.warn('[Dashboard] REST sync error, remaining in mock/demo fallback:', err.message);
      setBackendError('Backend currently offline or starting. Running on local simulator stream.');
    } finally {
      setIsRefreshing(false);
    }
  }, [telemetry]);

  // Periodic fallback polling if WebSocket is offline
  useEffect(() => {
    let pollInterval = null;
    if (wsStatus === 'FALLBACK_POLLING' || wsStatus === 'DISCONNECTED') {
      pollInterval = setInterval(() => {
        syncWithBackend();
      }, 5000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [wsStatus, syncWithBackend]);

  // Handle Range Selection change
  const handleRangeChange = (range) => {
    setSelectedRange(range);
    const hoursMap = { '30m': 0.5, '1h': 1, '6h': 6, '24h': 24 };
    const hours = hoursMap[range] || 1;

    if (!isDemoMode && wsStatus === 'CONNECTED') {
      api.getTelemetryHistory({ hours })
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) setHistory(res);
        })
        .catch(() => {
          setHistory(generateMockHistory(hours, 24));
        });
    } else {
      setHistory(generateMockHistory(hours, 24));
    }
  };

  // Alert Acknowledgment
  const handleAcknowledgeAlert = async (alertId) => {
    // Optimistic UI update
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
    try {
      await api.acknowledgeAlert(alertId);
    } catch (err) {
      console.warn('[Dashboard] Could not persist alert acknowledgment:', err.message);
    }
  };

  // Trigger Camera Frame Inspection
  const handleTriggerInspection = async () => {
    try {
      const res = await api.getCameraStatus();
      if (res) setCamera(res);
    } catch {
      // Mock visual inspection scan cycle
      setCamera((prev) => ({
        ...prev,
        last_checked: new Date().toISOString(),
        condition: risk.risk_level === 'CRITICAL' ? 'ANOMALY' : 'NORMAL',
        visual_risk: risk.risk_level === 'CRITICAL' ? 76 : 14,
        reason: risk.risk_level === 'CRITICAL'
          ? 'Micro-discoloration and localized surface bloom spotted along manuscript edge.'
          : 'Surface uniform, no microbial fungal mycelium or insect abrasion detected.',
      }));
    }
  };

  // Apply Demo Scenario Preset
  const handleApplyScenario = (scenarioId) => {
    const sc = DEMO_SCENARIOS[scenarioId];
    if (!sc) return;

    setActiveScenarioId(scenarioId);
    setPreviousTelemetry(telemetry);
    setTelemetry(sc.telemetry);
    setRisk(sc.risk);
    setCamera(sc.camera);

    // If warning or critical, add to alert list if not already present
    if (sc.risk.risk_level === 'WARNING' || sc.risk.risk_level === 'CRITICAL') {
      const newAlert = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        risk_level: sc.risk.risk_level,
        reason: sc.risk.reason,
        main_factor: sc.risk.main_factor,
        acknowledged: false,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  // Automated 4-Step Hackathon Presentation Story
  const handleRunStory = () => {
    if (isStoryRunning) return;
    setIsStoryRunning(true);
    setStoryStep(1);

    // Step 1: Normal Safe Condition
    handleApplyScenario('safe');

    // Step 2: After 3.5s, Humidity Spike (WARNING)
    storyTimerRef.current = setTimeout(() => {
      setStoryStep(2);
      handleApplyScenario('warning_humidity');

      // Step 3: After 4s, Sustained Exposure (CRITICAL)
      storyTimerRef.current = setTimeout(() => {
        setStoryStep(3);
        handleApplyScenario('critical_prolonged');

        // Step 4: After 3.5s, Final Alert Demonstration
        storyTimerRef.current = setTimeout(() => {
          setStoryStep(4);
          setIsStoryRunning(false);
        }, 3500);
      }, 4000);
    }, 3500);
  };

  // Clean up story timer on unmount
  useEffect(() => {
    return () => {
      if (storyTimerRef.current) clearTimeout(storyTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* 1. Header */}
      <Header
        wsStatus={wsStatus}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
        onRefresh={syncWithBackend}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Offline / Fallback Notice Banner if backend down */}
        {backendError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>System Notice:</strong> {backendError}
              </span>
            </div>
            <button
              onClick={syncWithBackend}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded text-[11px] font-semibold text-amber-200 shrink-0"
            >
              Retry Link
            </button>
          </div>
        )}

        {/* 2. Hackathon Demo Simulator Controls (when demo mode is enabled) */}
        {isDemoMode && (
          <DemoControls
            activeScenarioId={activeScenarioId}
            onApplyScenario={handleApplyScenario}
            onRunStory={handleRunStory}
            isStoryRunning={isStoryRunning}
            storyStep={storyStep}
            onCustomTelemetrySubmit={(custom) => {
              setPreviousTelemetry(telemetry);
              setTelemetry(custom);
              // Calculate dynamic mock risk for custom input
              const humRisk = Math.max(0, (custom.humidity - 55) * 2.5);
              const tempRisk = Math.max(0, (custom.temperature - 24) * 3.0);
              const uvRisk = (custom.uv > 0.3 ? 30 : 0);
              const totalScore = Math.min(100, Math.round(15 + humRisk + tempRisk + uvRisk));
              const level = totalScore > 75 ? 'CRITICAL' : totalScore > 40 ? 'WARNING' : 'SAFE';
              setRisk({
                timestamp: custom.timestamp,
                risk_score: totalScore,
                risk_level: level,
                main_factor: custom.humidity > 60 ? 'humidity' : custom.temperature > 26 ? 'temperature' : 'balanced',
                reason: totalScore > 75 ? 'Multiple parameters exceeding preservation tolerances.' : 'Custom evaluation.',
                exposure_duration: 'Manual test',
                model_confidence: 0.91,
                is_demo: true,
              });
            }}
          />
        )}

        {/* 3. System Status Ribbon */}
        <SystemStatus
          esp32Active={wsStatus === 'CONNECTED' || isDemoMode}
          aiModelReady={true}
          dbConnected={wsStatus === 'CONNECTED' || isDemoMode}
          cameraActive={true}
          lastTelemetryTime={telemetry?.timestamp}
        />

        {/* 4. Live Sensor Cards Grid (5 core parameters) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Environmental Telemetry
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              Sampled: {telemetry?.timestamp ? new Date(telemetry.timestamp).toLocaleTimeString() : 'Awaiting data'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
            <SensorCard
              type="temperature"
              value={telemetry?.temperature}
              previousValue={previousTelemetry?.temperature}
              isLoading={isLoading}
            />
            <SensorCard
              type="humidity"
              value={telemetry?.humidity}
              previousValue={previousTelemetry?.humidity}
              isLoading={isLoading}
            />
            <SensorCard
              type="light"
              value={telemetry?.light}
              previousValue={previousTelemetry?.light}
              isLoading={isLoading}
            />
            <SensorCard
              type="uv"
              value={telemetry?.uv}
              previousValue={previousTelemetry?.uv}
              isLoading={isLoading}
            />
            <SensorCard
              type="pm25"
              value={telemetry?.pm25}
              previousValue={previousTelemetry?.pm25}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* 5. Primary Hero Section: Preservation Risk & Explainable AI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Risk Card (Hero Component) */}
          <div className="lg:col-span-7">
            <RiskCard
              riskScore={risk?.risk_score}
              riskLevel={risk?.risk_level}
              mainFactor={risk?.main_factor}
              reason={risk?.reason}
              exposureDuration={risk?.exposure_duration}
              modelConfidence={risk?.model_confidence}
              isDemo={isDemoMode || risk?.is_demo}
              isLoading={isLoading}
            />
          </div>

          {/* Explainability Panel */}
          <div className="lg:col-span-5">
            <RiskExplanation
              telemetry={telemetry}
              risk={risk}
            />
          </div>
        </div>

        {/* 6. Historical Data & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <EnvironmentalChart
              data={history}
              selectedRange={selectedRange}
              onRangeChange={handleRangeChange}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-4">
            <RiskHistory
              data={history}
              selectedRange={selectedRange}
            />
          </div>
        </div>

        {/* 7. Alerts & Modular Camera Inspection Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Alert Feed */}
          <div className="lg:col-span-6">
            <AlertPanel
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
              isLoading={isLoading}
            />
          </div>

          {/* Modular Camera Inspection */}
          <div className="lg:col-span-6">
            <CameraPanel
              cameraData={camera}
              onTriggerInspection={handleTriggerInspection}
            />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-slate-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            PALM GUARD IoT • Smart Preservation Monitoring System for Palm-Leaf Manuscripts
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Member 1: Sensors</span>
            <span>Member 2: AI / ML</span>
            <span className="text-emerald-400 font-semibold">Member 3: Dashboard & Integration</span>
            <span>Member 4: ESP32 IoT</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
