import React, { useState, useCallback } from "react";
import { Toggle, ToggleState } from "../components/Toggle";
import { useWebSocket } from "../utils/hooks";
import { errorToast, sendGet, sendSet } from "../utils/misc";

export function Toggles() {
  const [gpuBoost, setGPUBoost] = useState(ToggleState.Unknown);

  const ws = useWebSocket(
    useCallback(function (this: WebSocket, event: MessageEvent) {
      const { kind, data, methodName } = JSON.parse(event.data);
      if (kind === "state") {
        setGPUBoost(data.gpuBoost ? ToggleState.On : ToggleState.Off);
      } else if (kind === "success") {
        // Current state only changes when we get the websocket
        // result.
        if (methodName === "GetAIBoostStatus") {
          setGPUBoost(data === "0x1" ? ToggleState.On : ToggleState.Off);
        } else if (methodName === "SetAIBoostStatus") {
          sendGet(this, "GetAIBoostStatus");
        }
      } else if (kind === "error") {
        errorToast(data);
        console.error(data);
      }
    }, []),
  );

  if (!ws) {
    return null;
  }

  const onChangeGPUBoost: React.ChangeEventHandler = () => {
    setGPUBoost(ToggleState.Unknown);
    sendSet(ws, "SetAIBoostStatus", {
      Data: gpuBoost === ToggleState.On ? 0 : 1,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Toggle
        label="GPU Boost"
        name="gpuBoost"
        value={gpuBoost}
        onChange={onChangeGPUBoost}
      />
    </div>
  );
}
