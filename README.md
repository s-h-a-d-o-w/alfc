# Aorus Laptop Fan Control (alfc)

Tested on an Aorus 15G but it seems like most of the things used in this are used in 
a variety of Gigabyte's laptops, so it could work with others too. (If you try it out and it does, 
please get in touch - email is in my profile.)

![Screenshot](/assets/screenshot.png?raw=true)

- Web interface available @ `http://localhost:5522`
- Ramping up and down doesn't happen immediately, to prevent frequent fluctuations.
(Ramping up happens quite quickly while ramping down requires the temperature to 
be lower for a while.)
- Fans are controlled as if they were one (since most heat pipes are shared). And so 
whatever is the higher target fan speed gets applied.
- Config is stored in `alfc.config.json` (you have to tweak something for it to be 
created). If you prefer not to use the UI, you can edit this and restart the service 
to apply your changes.
- Uses about `0.4%` CPU and `500 mW` package power. (Measured in Windows at idle 
using hwinfo.)

## Usage

### Linux

See [HERE](./LINUX.md).

### Windows

If you want to use this to reduce noise, ensure that "USB Selective Suspend" 
is enabled in your power plan, since that can cause significant CPU power consumption and 
thus drives temperatures up.

- Download the latest release and extract it to wherever you want to run it.
- Run `install.bat`. It takes about 20 seconds, the installer is not frozen. 😉 
(In case you need to allow firewall access, you might find it interesting to know that 
the UI only responds to requests from your local machine.)

You can also simply run `run.bat` from an admin command prompt to run the fan 
control temporarily or to try it out before installing it as a service.

Once you either uninstall the tool or quit after running it using `run.bat`, it 
is recommended to reboot your machine to ensure that control is handed back to 
either BIOS or Gigabyte's Control Center.

## Development notes

In the direction frontend -> server, arguments are not provided as hex strings, since 
WMI uses named arguments and it is easier to strip this info and convert to a 
hex string for Linux.

A websocket went rogue once and kept sending status requests even though the UI wasn't open 
any more. Probably due to dev stuff with hot reload. Still - if a user ever experiences this, 
it can be resolved through running Resource Monitor as admin and finding what is connected 
to port 5522.

## Wishlist

Contributions welcome, as always. 🙂

- Make charge stop work. I set it to `90` in the Control Center before I uninstalled it and 
Windows does stop at `91%` (`91.4` according to `hwinfo`). Yet, calling `GetChargeStop` returns 
`97`. Plus, if I call `SetChargeStop` with e.g. `0x60`, it stays at `0x61`. But there's nothing 
special about the call in `SmartManager.dll`, so it's quite mysterious:
`cwmi.CallMethod("ROOT\\WMI", "GB_WMIACPI_Set", "SetChargeStop", array);`  
On Linux, this might be possible [like so](https://askubuntu.com/a/1211506).
- Make ramping up/down times configurable.
- Prettier status UI.
- Using RGB lighting to highlight caps/num lock. There's something [here](https://gitlab.com/wtwrp/aeroctl/-/tree/master/Samples/AeroCtl.Rgb.LockKeys) 
for the Gigabyte Aero that could potentially be reused.
- Refactor styles so there aren't as many inline ones.
- Make it possible to supply decent service Name and Description, especially on Windows, where it 
sticks out like a sore thumb. (Requires modifying `os-service`, since it currently uses the name one 
can supply also as the file name for Linux services, so spaces might be problematic.)
