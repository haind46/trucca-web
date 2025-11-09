import { AlertRow } from "../AlertRow";
import { useState } from "react";

export default function AlertRowExample() {
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const handleAck = (id: string) => {
    setAcknowledged((prev) => ({ ...prev, [id]: true }));
    console.log(`Alert ${id} acknowledged`);
  };

  return (
    <div className="max-w-4xl">
      <AlertRow
        id="1"
        timestamp="07/11 14:23"
        system="Core DB Server"
        severity="critical"
        message="CPU usage above 95% for 10 minutes"
        details="[2025-11-07 14:23:15] ERROR: High CPU utilization detected
Process: postgres (PID 1234)
CPU: 96.8%
Memory: 8.2GB/16GB
Recommendation: Check slow queries or add indexing"
        acknowledged={acknowledged["1"]}
        onAcknowledge={handleAck}
      />
      <AlertRow
        id="2"
        timestamp="07/11 14:18"
        system="Web App Server"
        severity="major"
        message="Response time degradation detected"
        acknowledged={acknowledged["2"]}
        onAcknowledge={handleAck}
      />
      <AlertRow
        id="3"
        timestamp="07/11 14:05"
        system="API Gateway"
        severity="down"
        message="Service unavailable - connection timeout"
        details="[2025-11-07 14:05:32] CRITICAL: Gateway unreachable
Endpoint: https://api.example.com
Status: Connection timeout after 30s
Last successful ping: 14:03:15"
        acknowledged={acknowledged["3"]}
        onAcknowledge={handleAck}
      />
    </div>
  );
}
