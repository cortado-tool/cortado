import sys
import os
import opcode

from cx_Freeze import setup, Executable

print("SYSPATH: \n" + str(sys.path))
distutils_path = os.path.join(os.path.dirname(opcode.__file__), "distutils")
print("distutils_path: \n" + str(distutils_path))

# Dependencies are automatically detected, but it might need fine tuning.
build_exe_options = {
    "packages": ["os", "pulp"],
    "excludes": ["tkinter"],
    "include_files": [(distutils_path, "distutils")],
}

# GUI applications require a different base on Windows (the default is for
# a console application).
base = None
if sys.platform == "win32":
    base = "Win32GUI"

# Run the application freezing.

setup(
    name="cortado-backend",
    version="0.1",
    description="My GUI application!",
    options={"build_exe": build_exe_options},
    executables=[Executable("main.py", base=base)],
)
