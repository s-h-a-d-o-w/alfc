# alfc-gui

## Usage

### General

- Uses a web interface available @ `http://localhost:5522`
- Fans are controlled as if they were one (since most heat pipes are shared). And so 
whatever is the higher target fan speed gets applied.
- Config is stored in `alfc.config.json` (you have to tweak something for it to be 
created). If you prefer not to use the UI, you can edit this and restart the service 
to apply your changes.

### Windows

- Download the latest release and extract it to wherever you want to run it.
- Run `install.bat`. (In case you need to allow firewall access, you might find it 
interesting to know that the UI only responds to requests from localhost.)

You can also simply run `run.bat` from an admin command prompt to run the fan 
control temporarily or to try it out before installing it as a service.

Once you either uninstall the tool or quit after running it using `run.bat`, it 
is recommended to reboot your machine to ensure that control is handed back to 
either BIOS or Gigabyte's Control Center.

### Linux
```
sudo npm run start
```

### CPU power limits

If you're already familiar with PL1/PL2, feel free to skip this section. For others - 
at least based on my observations, there is really only two scenarios to use something 
other than the default of `38/107`:

- You are rendering something and want to use more power than 38W long-term.
- Trying to optimize gaming performance also by increasing PL1.

## Development notes

Frontend has all knowledge of what the returned values are, so if anything, it 
should be the one to parse them (little endian problem). Return hex strings in 
an async manner on both platforms to allow for a unified API.

In direction frontend -> server, arguments are not provided as hex strings, since 
WMI uses named arguments and it is easier to strip this info and convert to a 
hex string for Linux.

Websocket went rogue once and kept sending status requests even though UI wasn't open 
any more. Probably due to dev stuff with hot reload. Still - if users experience it, 
can be resolved through running Resource Monitor as admin and finding what is connected 
to port 3001.

## Wishlist

Contributions welcome, as always. 🙂

- Prettier status UI.
- For some reason, `SetChargeStop` doesn't work. But there's nothing special about 
the call in `SmartManager.dll`: `cwmi.CallMethod("ROOT\\WMI", "GB_WMIACPI_Set", "SetChargeStop", array);`
Does the charge stop functionality maybe simply not work?
Or is `SetMaxCharge` (used in `CloudMatrixBattery.exe`) responsible for this?
- Using RGB lighting to highlight caps/num lock. There's something [here](https://gitlab.com/wtwrp/aeroctl/-/tree/master/Samples/AeroCtl.Rgb.LockKeys) 
for the Gigabyte Aero that could potentially be reused.
- Refactor styles so there aren't as many inline ones.

