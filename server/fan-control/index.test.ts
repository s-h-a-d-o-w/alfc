import { getCall, setCall } from "../native";
import { state } from "../state/index.js";
import {
  fanControl,
  fanPercentToSpeed,
  CYCLE_DURATION,
  WAIT_RAMP_UP_CYCLES,
  WAIT_RAMP_DOWN_CYCLES,
} from "./index.js";

vi.mock("../native", () => ({
  getCall: vi.fn(),
  setCall: vi.fn(),
}));
const mockedGetCall = vi.mocked(getCall);
const mockedSetCall = vi.mocked(setCall);

function mockTemperatures(cpu: number, gpu: number) {
  mockedGetCall.mockImplementation((methodId: string) => {
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
  let advancedTime = 0;

  while (true) {
    try {
      expect(mockedSetCall).toHaveBeenLastCalledWith(
        expect.any(String),
        expect.any(String),
        {
          Data: fanPercentToSpeed(fanPercent),
        },
      );
      return advancedTime / CYCLE_DURATION;
    } catch (_) {
      // console.log(
      //   `Last call: ${
      //     mockedSetCall.mock.calls[mockedSetCall.mock.calls.length - 1][2]
      //       .Data
      //   } (Expected: ${fanPercentToSpeed(fanPercent)})`,
      // );
    }

    await vi.advanceTimersByTimeAsync(10);
    advancedTime += 10;
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

    // High CPU temperature => 50% fan speed
    mockTemperatures(90, 30);
    await vi.advanceTimersByTimeAsync(
      3 * WAIT_RAMP_UP_CYCLES * CYCLE_DURATION + 1000,
    );
    expect(mockedSetCall).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.any(String),
      {
        Data: fanPercentToSpeed(
          state.cpuFanTable[state.cpuFanTable.length - 1][1],
        ),
      },
    );

    // Cool CPU => 15% fan speed
    mockTemperatures(30, 30);
    await vi.advanceTimersByTimeAsync(
      3 * WAIT_RAMP_DOWN_CYCLES * CYCLE_DURATION + 1000,
    );
    expect(mockedSetCall).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.any(String),
      {
        Data: fanPercentToSpeed(state.cpuFanTable[0][1]),
      },
    );

    // High GPU temperature => 100% fan speed
    mockTemperatures(30, 90);
    await vi.advanceTimersByTimeAsync(
      5 * WAIT_RAMP_UP_CYCLES * CYCLE_DURATION + 1000,
    );
    expect(mockedSetCall).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.any(String),
      {
        Data: fanPercentToSpeed(
          state.gpuFanTable[state.gpuFanTable.length - 1][1],
        ),
      },
    );
  });

  it("should switch to fixed speed when doFixedSpeed becomes true", async () => {
    fanControl();

    state.doFixedSpeed = true;
    state.fixedPercentage = 75;

    await vi.advanceTimersByTimeAsync(CYCLE_DURATION);
    expect(mockedSetCall).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.any(String),
      {
        Data: fanPercentToSpeed(state.fixedPercentage),
      },
    );
  });

  it("fan speed adjusts gradually after temperature change", async () => {
    // We can't just repeatedly advance the timer in this test because execution times aren't perfect and when allowing for a bit of leeway, we would cut into the time for the next gradient step.

    fanControl();
    // Make sure steady state is reached at initial temperature
    await waitUntilFanPercent(state.cpuFanTable[0][1]);

    // Change to high CPU temperature
    mockTemperatures(90, 30);
    vi.clearAllMocks();

    const initialPercentage = state.cpuFanTable[0][1];
    const targetPercentage = state.cpuFanTable[state.cpuFanTable.length - 1][1];

    // First gradient step
    let currentPercentage = initialPercentage;
    let expectedPercentage =
      currentPercentage +
      Math.round((targetPercentage - currentPercentage) / 2);
    let cycles = await waitUntilFanPercent(expectedPercentage);
    expect(cycles - WAIT_RAMP_UP_CYCLES).toBeLessThan(1);

    // Second gradient step
    currentPercentage = expectedPercentage;
    expectedPercentage =
      currentPercentage +
      Math.round((targetPercentage - currentPercentage) / 2);
    cycles = await waitUntilFanPercent(expectedPercentage);
    expect(cycles - WAIT_RAMP_UP_CYCLES).toBeLessThan(1);

    // Reaching target
    currentPercentage = expectedPercentage;
    expectedPercentage = targetPercentage;
    cycles = await waitUntilFanPercent(expectedPercentage);
    expect(cycles - WAIT_RAMP_UP_CYCLES).toBeLessThan(1);
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
