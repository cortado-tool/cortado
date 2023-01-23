# Cortado

**Cortado is a process mining tool dedicated for interactive/incremental process discovery.**
The [website of Cortado](https://cortado.fit.fraunhofer.de) contains various information on Cortado, such as a functionality overview, screenshots, and a list of publications on algorithms implemented in Cortado. 

**Standalone builds** for **Windows 10/11**, **Linux**, and **macOS** (Apple Silicon only) are available for download at the [website of Cortado](https://cortado.fit.fraunhofer.de).

Follow [@cortado_tool](https://twitter.com/cortado_tool) on **Twitter** for important announcements.

![Screenshot of Cortado](https://cortado.fit.fraunhofer.de/assets/cortado-screenshot.png "Screenshot of Cortado")




## Repository Structure 

* `src/` contains the source code of Cortado
  * `src/backend` contains Cortado's Python-based backend 
  * `src/frontend` contains Cortado's frontend that is based on web technologies , i.e., an [Angular](https://angular.io/) web application embedded in an executable with [Electron](https://www.electronjs.org/)
* `build_scripts/` contains scripts to build the standalone executables for the three major operating systems: Windows, Linux, and macOS. (Please make sure to correctly follow the Setup instructions before executing the build scripts.)
* `LICENSE.txt`
* `README.md`
* `CHANGELOG.md` contains a history of Cortado releases 


## Setup
### Install Frontend Dependencies
* Install Node.js latest LTS Version: 18.13.0 (https://nodejs.org/en/download/)
* Install all packages required by the frontend
  * **Navigate to `src/frontend/`** 
  * **Execute `npm install`** (this command installs all dependencies listed in `src/frontend/package.json`)\
    _When building Cortado as a standalone application, we want to ensure that the application bundle only includes required dependencies. 
    As Angular dependencies are bundled via webpack, we do not want to include them. Hence, dependencies that are only used in the Angular codebase should be included under the `devDependencies` keyword in the `package.json`-file. All dependencies that are used in the Electron codebase must be included under the `dependencies` keyword.)_
### Install Backend Dependencies
* Install Python 3.10.x (https://www.python.org/downloads/). Make sure to install a 64-BIT version.
* Optional (recommended): Install Graphviz (required by PM4Py) and add it to your PATH, see https://graphviz.org/download/ and https://pm4py.fit.fraunhofer.de/static/assets/api/2.3.0/install.html
* Optional (recommended): Create a virtual environment (https://docs.python.org/3/library/venv.html) and activate it
* Install all packages required by the backend
  * Navigate to `src/backend/` 
  * Execute `pip install -r requirements.txt`

## Execute Cortado from Code
### Start Backend
* Navigate to `src/backend/`
* Execute `python main.py`
### Start Frontend 
* In a Web-Browser
  * Navigate to `src/frontend/`
  * Execute `npm start` to build & run Cortado's frontend
  * Open your browser on http://localhost:4444/
* In a dedicated Window of the Current OS
  * Navigate to `src/frontend/`
  * Execute `npm start` to build & run Cortado's frontend
  * Execute `electron-live-reload` that starts a window with Cortado


## Build Cortado&mdash;Standalone Application

To build executables from the source code, both the backend and frontend have to be converted.
We use PyInstaller (https://pyinstaller.org/) to bundle all backend related files into a single executable.
We use Electron (https://www.electronjs.org/) to generate an executable  of the Frontend. 

In `build_scripts/` there are scripts for each major OS to build Cortado.
* Windows `build_scripts/build_cortado_windows.ps1`
* MacOS `build_scripts/build_cortado_macos.sh`
* Linux `build_scripts/build_cortado_linux.sh`

Note that the operating system must match the script, otherwise the build will fail. 
Thus, if you are building Cortado for Windows, you must run the corresponding script on a Windows machine.

After the successful execution of the build script, the build is located in `src/frontend/`


## Citing Cortado

If you are using or referencing Cortado in scientific work, please cite Cortado as follows.

> Schuster, D., van Zelst, S.J., van der Aalst, W.M.P. (2021). Cortado—An Interactive Tool for Data-Driven Process Discovery and Modeling. In: Application and Theory of Petri Nets and Concurrency. PETRI NETS 2021. Lecture Notes in Computer Science, vol 12734. Springer, Cham. https://doi.org/10.1007/978-3-030-76983-3_23

Download citation 
[.BIB](https://citation-needed.springer.com/v2/references/10.1007/978-3-030-76983-3_23?format=bibtex&flavour=citation)&nbsp;
[.RIS](https://citation-needed.springer.com/v2/references/10.1007/978-3-030-76983-3_23?format=refman&flavour=citation)&nbsp;
[.ENW](https://citation-needed.springer.com/v2/references/10.1007/978-3-030-76983-3_23?format=endnote&flavour=citation)

DOI
[10.1007/978-3-030-76983-3_23](https://doi.org/10.1007/978-3-030-76983-3_23)



## Contact

If you are interested in Cortado, get in touch if you have any questions or custom request via [Mail - daniel.schuster@fit.fraunhofer.de](mailto:daniel.schuster@fit.fraunhofer.de)


