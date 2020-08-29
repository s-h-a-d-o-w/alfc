const {exec} = require('child_process');
const fs = require('fs');
const os = require('os');
const service = require('os-service');
const path = require('path');
const sudo = require('sudo-prompt');

const isWindows = os.platform() === 'win32';

const sudoOptions = {
  name: 'Aorus Laptop Fan Control',
};

const errorHandler = (onSuccess) => (error) => {
  if(error) {
    throw error;
  }

  onSuccess();
}

function sudoOutputHandler(error, stdout) {
  if (error) {
    console.error(error);
    return;
  }

  console.log(stdout);
}

switch(process.argv[2]) {
  case 'install':
    console.log('Installing...');
    sudo.exec(`node ${process.argv[1]} install-as-sudo`, sudoOptions, sudoOutputHandler);
    break;
  case 'install-as-sudo':
    service.add("alfc", {
      programArgs: ["run"],
      dependencies: os.platform() === 'win32' ? ['Winmgmt'] : ['acpi_call']
    }, errorHandler(() => {
      const serviceStartCommand = isWindows ? 'net start alfc' : 'service alfc start';
      exec(serviceStartCommand, errorHandler(async () => {
        if (os.platform() === 'win32') {
          await new Promise((resolve) => setTimeout(resolve, 1000 * 15));
        }

        console.log('Done.');
        require('react-dev-utils/openBrowser')('http://localhost:5522');
      }));
    }));
    break;
  case 'uninstall':
    console.log('Uninstalling...');
    sudo.exec(`node ${process.argv[1]} uninstall-as-sudo`, sudoOptions, sudoOutputHandler);
    break;
  case "uninstall-as-sudo":
    const serviceStopCommand = isWindows ? 'net stop alfc' : 'service alfc stop';
    exec(serviceStopCommand, () => {
      // exec would possibly error if the service is already stopped.
      // But we don't care about that and will simply attempt to remove the serivce.
  
      service.remove("alfc", errorHandler(() => {
        console.log('Done.')
      }));
    });
    break;
  case "run":
    service.run(function () {
      service.stop(0);
    });

    // Need to redirect all output to a log file on Windows.
    // On Linux, it'll go to the systemd logs.
    if(os.platform() === 'win32') {
      const access = fs.createWriteStream(path.join(__dirname, 'service.log'));
      process.stdout.write = process.stderr.write = access.write.bind(access);
      process.on('uncaughtException', function(err) {
        console.error((err && err.stack) ? err.stack : err);
      });
    }

    process.chdir(__dirname);
    process.env.NODE_ENV = 'production';
    require('./fancontrol');
    break;
  default:
    console.error("If you can read this, either you or I did something wrong.");
    process.exit(1);
} 
