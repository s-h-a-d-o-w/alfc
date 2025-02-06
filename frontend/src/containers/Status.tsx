import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { MessageToClientKind } from "../../../common/types.js";
import { SimpleTooltip } from "../components/SimpleTooltip.js";
import { StyledArea } from "../components/StyledArea.js";
import { useWebSocket } from "../utils/useWebSocket.js";

export function Status({ disabled }: { disabled: boolean }) {
  const tooltipRef = useRef<SVGSVGElement>(null);

  const [appliedSpeed, setAppliedSpeed] = useState<string>("-");
  const [avgCPUTemp, setAvgCPUTemp] = useState<string>("-");
  const [avgGPUTemp, setAvgGPUTemp] = useState<string>("-");
  const [target, setTarget] = useState<string>("-");

  const { isConnected, sendJsonMessage, lastJsonMessage } = useWebSocket();

  useEffect(() => {
    const { kind, data } = lastJsonMessage;
    if (kind === MessageToClientKind.FanControlActivity) {
      setAppliedSpeed(data.appliedSpeed ? data.appliedSpeed.toString() : "-");
      setAvgCPUTemp(Math.round(data.avgCPUTemp).toString());
      setAvgGPUTemp(Math.round(data.avgGPUTemp).toString());
      setTarget(data.target.toString());
    } else if (kind === "error") {
      console.error(data);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (disabled) {
      // Blanking out values must be delayed since we'll
      // still receive fancontrolactivity for a bit, until
      // server has actually stopped the auto fan control.
      setTimeout(() => {
        setAppliedSpeed("-");
        setAvgCPUTemp("-");
        setAvgGPUTemp("-");
        setTarget("-");
      }, 500);
    } else {
      sendJsonMessage({ kind: "registeractivitysocket" });
    }
  }, [disabled, sendJsonMessage]);

  if (!isConnected) {
    return null;
  }

  const status = `CPU: ${avgCPUTemp}°C
GPU: ${avgGPUTemp}°C
Current target: ${target}%
Last applied: ${appliedSpeed}%`;
  return (
    <StyledArea>
      <h2>
        Status <FontAwesomeIcon icon={faInfoCircle} ref={tooltipRef} />
        {/* @ts-expect-error Reactstrap demands RefObject<HTMLElement> */}
        <SimpleTooltip target={tooltipRef}>
          There&apos;s only one target speed because both fans always operate at
          the same speed. Whichever target speed for either CPU or GPU would be
          higher &quot;wins&quot;.
        </SimpleTooltip>
      </h2>
      <textarea
        readOnly
        value={status}
        rows={4}
        cols={25}
        style={{ fontSize: 14, cursor: "default" }}
      />
    </StyledArea>
  );
}
