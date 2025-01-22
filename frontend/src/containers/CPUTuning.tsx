import styled from "@emotion/styled";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import { SimpleTooltip } from "../components/SimpleTooltip";
import { StyledApplyButton } from "../components/StyledApplyButton";
import { StyledArea } from "../components/StyledArea";
import xtuIncompatibility from "../images/xtu_incompatibility.png";
import { useWebSocket } from "../utils/hooks";
import { errorToast, successToast } from "../utils/misc";

const StyledInput = styled.input`
  width: 56px;
`;

const StyledLabel = styled.label`
  display: inline-flex;
  align-items: center;
`;

export function CPUTuning() {
  const tooltipRef = useRef(null);

  const [isCpuTuningAvailable, setIsCpuTuningAvailable] = useState<
    boolean | undefined
  >(false);
  const [isApplying, setIsApplying] = useState(false);
  const [pl1, setPL1] = useState<string>("37");
  const [pl2, setPL2] = useState<string>("106");

  const { isConnected, sendJsonMessage, lastJsonMessage } = useWebSocket();

  useEffect(() => {
    const { kind, data } = lastJsonMessage;
    if (kind === "state") {
      if (data.isCpuTuningAvailable) {
        setPL1(data.pl1.toString());
        setPL2(data.pl2.toString());
      }
      setIsCpuTuningAvailable(data.isCpuTuningAvailable);
    } else if (kind === "success") {
      successToast("Successfully applied.");
    } else if (kind === "error") {
      errorToast("Couldn't apply change.");
      console.error(data);
    }
  }, [lastJsonMessage]);

  if (!isConnected) {
    return null;
  }

  const onSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    setIsApplying(true);
    sendJsonMessage({
      kind: "tune",
      data: { pl1: parseInt(pl1, 10), pl2: parseInt(pl2, 10) },
    });
  };

  const content = !isCpuTuningAvailable ? (
    <>
      <h2>
        CPU Tuning is not available.{" "}
        <FontAwesomeIcon icon={faInfoCircle} ref={tooltipRef} />
        <SimpleTooltip target={tooltipRef} unlimitedWidth>
          The likely culprit:
          <br />
          <img
            src={xtuIncompatibility}
            alt="Intel xtu incompatibility message"
          />
        </SimpleTooltip>
      </h2>
    </>
  ) : (
    <>
      <h2 style={{ marginBottom: 16 }}>
        CPU power limits{" "}
        <FontAwesomeIcon icon={faInfoCircle} ref={tooltipRef} />
        <SimpleTooltip target={tooltipRef}>
          The ECO profile for the i7-10875H in the Gigabyte Control Center is
          38/107, Boost is 62/107.
          <br />
          NOTE: Don&apos;t use <strong>exactly</strong> those numbers, otherwise
          they might not get applied at startup.
        </SimpleTooltip>
      </h2>
      <form onSubmit={onSubmit}>
        <StyledLabel>
          PL1
          <StyledInput
            size={4}
            type="number"
            onChange={(event) => setPL1(event.target.value)}
            value={pl1}
          />
        </StyledLabel>
        <br />
        <StyledLabel>
          PL2
          <StyledInput
            size={4}
            type="number"
            onChange={(event) => setPL2(event.target.value)}
            value={pl2}
          />
        </StyledLabel>
        <br />
        <StyledApplyButton
          disabled={isApplying}
          type="submit"
          style={{ marginTop: 16 }}
        >
          Apply
        </StyledApplyButton>
      </form>
    </>
  );

  return <StyledArea style={{ marginTop: 32 }}>{content}</StyledArea>;
}
