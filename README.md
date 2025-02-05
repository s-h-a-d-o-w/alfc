# Aorus Laptop Fan Control (alfc)

**Please note that if you're using Windows 10 *and* a CPU other than the i7-10875H, you would have to look up and set the PL1 and PL2 values in order not to possibly limit the performance of your CPU** - e.g. [tech powerup database](https://www.techpowerup.com/cpu-specs/core-i7-10875h.c2277). (`alfc` will attempt to set those levels whenever it starts or you change them, using Intel XTU on Windows 10 and `constraint_0_power_limit_uw` and `constraint_1_power_limit_uw` on Linux. Windows 11 forbids using Intel XTU, at least for this. As far as I'm aware, there's no danger to setting those values too high, since CPUs won't consume more than a certain maximum, regardless of these values. On the other hand, throttling due to low values is possible!)

## Other tools for Aorus laptops

[Gigabyte-Aorus-Battery-Manager](https://github.com/lxmoonlily/Gigabyte-Aorus-Battery-Manager) (**Windows only** - charging threshold control tool)

## Compatibility

| Model        | Fan control      | CPU limits tweaking | GPU boost        |
|--------------|------------------|---------------------|------------------|
| Aorus 15G    | W10, W11, Linux  | W10, Linux          | W10, W11, Linux  |
| Aorus 15G XC | W10, Linux       | W10, Linux          |                  |
| Aorus 15P XD | W10              | W10                 |                  |
| Aorus 15 FSB | W11              |                     |                  |
| Aorus 5 SE4  | W11              |                     |                  |
| Aero 15 SA   | W10, W11, Linux  |                     |                  |


Please submit a PR, an issue or send me an e-mail if you can confirm something that's not yet in the table.

GPU boost is likely to not work on models other than the 15G though because the way that is controlled is highly model-dependent.

## How it works

![Screenshot](/assets/screenshot.png?raw=true)

- Web interface available @ `http://localhost:5522`
- Ramping up and down doesn't happen immediately, to prevent frequent fluctuations.
(Ramping up happens quite quickly while ramping down requires the temperature to
be lower for a while.)
- Fans are controlled as if they were one (since most heat pipes are shared). And so
whatever is the higher target fan speed gets applied.
- Config is stored in `alfc.config.json`. If you prefer not to use the UI, you can
edit this and restart the service to apply your changes.
- Uses about `0.4%` CPU and `500 mW` package power. (Measured in Windows at idle
using hwinfo.)

## Usage

### Linux

See [HERE](./LINUX.md).

### Windows

If you want to use this to reduce noise, ensure that "USB Selective Suspend"
is always enabled in your power plan! Having it disabled can cause significant CPU
power consumption and thus drive temperatures up.

- Download the latest release and extract it to wherever you want to run it.
- Run `install.bat`. It takes about 20 seconds, the installer is not frozen. 😉
(In case you need to allow firewall access, you might find it interesting to know that
the UI only responds to requests from your local machine.)

You can also simply run `run.bat` from an admin command prompt to run the fan
control temporarily or to try it out before installing it as a service.

Once you either uninstall the tool or quit after running it using `run.bat`, it
is recommended to reboot your machine to ensure that control is handed back to
either BIOS or Gigabyte's Control Center.

## Troubleshooting

On Windows, there is a `service.log` file in the alfc root directory that might contain useful information.

### Getting rid of Gigabyte Control Center

If that is something you're interested in, you need to do this:

- Install Intel XTU
- Extract the Control Center installer and copy `acpimof.dll` to `C:\Windows\SysWOW64`,
create a string value in the Registy at
`Computer\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WmiAcpi` called `MofImagePath`
that contains `C:\Windows\SysWOW64\acpimof.dll` and reboot. (For more on this, [see here](https://docs.microsoft.com/en-us/samples/microsoft/windows-driver-samples/wmi-acpi-sample/))

If you want to keep using the color profiles:

- Extract the Control Center installer and install the ICM file for the color temperature you
want yourself. Unfortunately, I don't remember how I figured out the model name of the panel in the Aorus 15G (`color\P75\SHP14C5`).

## Development notes

`sudo pnpm start` - Frontend is available at port 3000.

In the direction frontend -> server, arguments are not provided as hex strings, since
WMI uses named arguments and it is easier to strip this info and convert to a
hex string for Linux.

## Todo/Wishlist

Contributions welcome, as always. 🙂

- It would be nice to be able to move to ESM at some point. Unfortunately, dependencies with native aspects don't play well. At least not out of the box and it's not worthwhile to invest a lot of time into workarounds.
- Refactor styles so there aren't as many inline ones.
- Prettier status UI.
- Using RGB lighting to highlight caps/num lock. There's something [here](https://gitlab.com/wtwrp/aeroctl/-/tree/master/Samples/AeroCtl.Rgb.LockKeys) for the Gigabyte Aero that could potentially be reused. (This should actually probably be a seperate little tool, like the Gigabyte-Aorus-Battery-Manager)
- Make it possible to supply decent service Name and Description, especially on Windows, where it
sticks out like a sore thumb. (Requires modifying `os-service`, since it currently uses the name one can supply also as the file name for Linux services, so spaces might be problematic.)
- ~~Make charge stop work. Based on `SmartManager.dll`, it's quite simple:
`cwmi.CallMethod("ROOT\\WMI", "GB_WMIACPI_Set", "SetChargeStop", array);`
Yet, `GetChargeStop` shows that the value set with `SetChargeStop` doesn't stick.
Does that feature even work? I don't have the Control Center installed any more and don't
want to install it again...
On Linux, this might be possible [like so](https://askubuntu.com/a/1211506).~~ (See [Gigabyte-Aorus-Battery-Manager](https://github.com/lxmoonlily/Gigabyte-Aorus-Battery-Manager). Leaving this for docs regarding how to do it on Linux.)
