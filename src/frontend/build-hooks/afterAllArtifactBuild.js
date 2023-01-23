exports.default = () => {
    const fs = require('fs');
    const process = require('process');
    const path = require('path');
    let appBuildDir = 'app-dist';
    if(fs.existsSync(path.join(__dirname, '..', appBuildDir, 'win-unpacked'))){
        appOutDir = 'win-unpacked';
    } else if (fs.existsSync(path.join(__dirname, '..', appBuildDir, 'linux-unpacked'))) {
        appOutDir = 'linux-unpacked';
    } else { // ignore for macos build
        return;
    }
    fs.mkdirSync(path.join(__dirname, '..', appBuildDir, appOutDir, 'cortado-backend'))
}