import { useEffect, useState, useCallback, useRef } from "react";
import { StyledArea } from "../components/StyledArea";
import { useWebSocket } from "../utils/hooks";
import { sendMessage } from "../utils/misc";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { SimpleTooltip } from "../components/SimpleTooltip";
import {
  MessageToClientKind,
  type MessageToClient,
} from "../../../common/types";

export function Status({ disabled }: { disabled: boolean }) {
  const tooltipRef = useRef<SVGSVGElement>(null);

  const [appliedSpeed, setAppliedSpeed] = useState<string | number | null>("-");
  const [avgCPUTemp, setAvgCPUTemp] = useState<string | number>("-");
  const [avgGPUTemp, setAvgGPUTemp] = useState<string | number>("-");
  const [target, setTarget] = useState<string | number>("-");

  const ws = useWebSocket(
    useCallback((event: MessageEvent<string>) => {
      const { kind, data } = JSON.parse(event.data) as MessageToClient;
      if (kind === MessageToClientKind.FanControlActivity) {
        setAppliedSpeed(data.appliedSpeed);
        setAvgCPUTemp(data.avgCPUTemp);
        setAvgGPUTemp(data.avgGPUTemp);
        setTarget(data.target);
      } else if (kind === "error") {
        console.error(data);
      }
    }, []),
  );

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
      sendMessage(ws, { kind: "registeractivitysocket" });
    }
  }, [disabled, ws]);

  if (!ws) {
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
