# Aorus Laptop Fan Control (alfc) - Linux Guide

## Prerequisites

- Node.js (if you don't use it yourself, a global install via the NodeSource repo is probably best 
(people who regularly work with it tend to use `nvm`), especially considering that that is needed 
to set up a systemd unit anyway.)
- Installation of [this kernel module](https://github.com/nix-community/acpi_call). (Enables issuing of fan control commands.)

### Installing the kernel module

Linux pros - feel free to contribute either to the following guide or automating the 
workflow! 🙂 (See notes in the Wishlist section though.)

If you've never installed a kernel module, one way is like the following (If you have secure boot 
enabled, you need to do [this](https://gist.github.com/dop3j0e/2a9e2dddca982c4f679552fc1ebb18df) first. 
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

