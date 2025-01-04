// TODO: upgrade packages so that eslint recognizes vitest globals out of the box
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCall, setCall } from "../native";
import { state } from "../state";
import {
  fanControl,
  fanPercentToSpeed,
  CYCLE_DURATION,
  WAIT_RAMP_UP_CYCLES,
} from "./index";

vi.mock("../native", () => ({
  getCall: vi.fn(),
  setCall: vi.fn(),
}));
const mockedGetCall = vi.mocked(getCall);
const mockedSetCall = vi.mocked(setCall);

function mockTemperatures(cpu: number, gpu: number) {
  mockedGetCall.mockImplementation((methodId) => {
    switch (methodId) {
      case "0xe1":
        return Promise.resolve(cpu.toString(16));
      case "0xe2":
        return Promise.resolve(gpu.toString(16));
      case "0xe3":
        return Promise.resolve(gpu.toString(16));
      default:
        return Promise.resolve("0x0");
    }
  });
}

async function waitUntilFanPercent(fanPercent: number) {
  let elapsed = 0;
  const interval = CYCLE_DURATION;
  const timeout = interval * 20;

  mockedSetCall.mockClear();
  while (
    elapsed < timeout &&
    mockedSetCall.mock.calls[0]?.[2].Data !== fanPercentToSpeed(fanPercent)
  ) {
    await vi.advanceTimersByTimeAsync(interval);
    elapsed += interval;
  }

  if (elapsed >= timeout) {
    throw new Error("Timeout - function never returned true.");
  }
}

describe("fan-control", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    state.cpuFanTable = [
      [40, 15],
      [83, 50],
      [88, 50],
    ];
    state.gpuFanTable = [
      [40, 15],
      [78, 50],
      [83, 100],
    ];
    state.doFixedSpeed = false;
    mockTemperatures(30, 30);
  });

  afterEach(async () => {
    // stop auto control loop
    state.doFixedSpeed = true;
    await vi.advanceTimersByTimeAsync(CYCLE_DURATION);

    vi.useRealTimers();
  });

  it("should change fan speed as temperatures change", async () => {
    fanControl();
    expect(mockedSetCall.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "0x58",
          "SetSuperQuiet",
          {
            "Data": 0,
          },
        ],
        [
          "0x71",
          "SetAutoFanStatus",
          {
            "Data": 0,
          },
        ],
        [
          "0x67",
          "SetStepFanStatus",
          {
            "Data": 0,
          },
        ],
        [
          "0x6a",
          "SetFixedFanStatus",
          {
            "Data": 1,
          },
        ],
        [
          "0x6b",
          "SetFixedFanSpeed",
          {
            "Data": 35,
          },
        ],
        [
          "0x47",
          "SetGPUFanDuty",
          {
            "Data": 35,
          },
        ],
      ]
    `);

    // High CPU temperature
    mockTemperatures(90, 30);
    await waitUntilFanPercent(
      state.cpuFanTable[state.cpuFanTable.length - 1][1],
    );

    // Cool CPU
    mockTemperatures(30, 30);
    await waitUntilFanPercent(state.cpuFanTable[0][1]);

    // High GPU temperature
    mockTemperatures(30, 90);
    await waitUntilFanPercent(
      state.gpuFanTable[state.gpuFanTable.length - 1][1],
    );
  });

  it("should switch to fixed speed when doFixedSpeed becomes true", async () => {
    fanControl();

    state.doFixedSpeed = true;
    state.fixedPercentage = 75;

    await waitUntilFanPercent(state.fixedPercentage);
  });

  it("fan speed adjusts after X cycles", async () => {
    fanControl();
    // Make sure steady state is reached
    await vi.advanceTimersByTimeAsync(CYCLE_DURATION * 10);

    mockTemperatures(90, 30);
    vi.clearAllMocks();
    // Cycle 1: Likely mix of temperatures
    // Cycle 2: Temp has become stable => target will be changed
    // Cycles 3+: WAIT_RAMP_UP_CYCLES until target will actually be applied
    await vi.advanceTimersByTimeAsync(
      CYCLE_DURATION * (WAIT_RAMP_UP_CYCLES + 2),
    );

    expect(mockedSetCall.mock.calls[0][2].Data).toEqual(
      fanPercentToSpeed(state.cpuFanTable[state.cpuFanTable.length - 1][1]),
    );
  });

  it("should handle fan table changes", async () => {
    fanControl();

    // Change fan tables
    state.cpuFanTable = [
      [0, 40],
      [70, 80],
      [80, 100],
    ];

    // Should reset to lowest speed in new table
    await waitUntilFanPercent(state.cpuFanTable[0][1]);
  });

  it("should use highest fan speed when readings are invalid", async () => {
    fanControl();

    mockedGetCall.mockResolvedValue("null");
    await waitUntilFanPercent(
      state.gpuFanTable[state.gpuFanTable.length - 1][1],
    );
  });
});
