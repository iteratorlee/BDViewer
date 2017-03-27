# Add ./jextension package to python (default version is 3.5)
cp -r ./jextension /usr/lib/python3.5
# Generate Jupyter Notebook configuration file
jupyter notebook --generate-config
# Modify config file to install server extension
cp ./config/jupyter_notebook_config_bak.py ~/.jupyter/jupyter_notebook_config.py
# Get static path of 'static' directory
cd table_extension
CURRENT_PATH=$(dirname $(readlink -f "$0"))
cd ..
# Install and enable front-end extension
jupyter nbextension install $CURRENT_PATH
jupyter nbextension enable table_extension/main
