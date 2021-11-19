# Aorus Laptop Fan Control (alfc) - Linux Guide

## IMPORTANT

**Only use this on Linux if your machine is listed in the compatibility table in the main readme or if you know what you're doing.**

Because on Linux, this tool writes directly to hardware addresses where data persists after rebooting. If something goes wrong, you might need to do something [like this](https://github.com/hirschmann/nbfc/wiki/FAQ#is-there-a-way-to-reset-my-notebook-if-something-went-wrong).

As for how to figure out whether the addresses are the same on your machine – not that simple, I might do a talk or write an article at some point. Let me know if you actually need this.

## Prerequisites

- Node.js (if you don't use it yourself, a global install via the NodeSource repo is probably best 
(people who regularly work with it tend to use `nvm`), especially considering that that is needed 
to set up a systemd unit anyway.)
- Installation of the kernel module [acpi_call](https://github.com/nix-community/acpi_call). (Enables issuing of fan control commands.)

### Installing `acpi_call`

Linux pros - feel free to contribute either to the following guide or automating the 
workflow! 🙂 (See notes in the Wishlist section though.)

If you've never installed a kernel module, one way is like the following (If you have secure boot 
enabled, you need to do [this](https://gist.github.com/s-h-a-d-o-w/53c2215e955c3326c6ec8f812a0d2f27) first. 
Plus, `make` might complain if you're missing compilers but it worked out of the box on Mint for me.):

```
sudo make dkms-add
sudo make dkms-build
sudo make dkms-install
sudo modprobe acpi_call
```

### Installation

- Simply grab the latest release, extract it to wherever you want alfc to live and run 
`install.sh`

Services for both starting the kernel module mentioned as well as alfc will be created and 
started.

## Wishlist

- Somehow including `acpi_call` in the installation process. But there are two problems: 
1.) People who have secure boot enabled need that whole separate step of signing the module 
2.) I would like to keep using `os-service` to manage services across platforms. But on Linux, 
it may use either systemd or init.d and I don't know what its selection criteria are because 
on e.g. latest Linux Mint, it still uses init.d. And so to have `alfc` be able to depend on 
`acpi_call`, I guess one would have to use `os-service` to run that module on startup too.

