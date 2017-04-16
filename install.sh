# Add ./jextension package to python (default version is 3.5)
echo "Adding lib files..."
cp -r ./jextension /usr/lib/python2.7
echo "Added to python2.7 lib directory"
cp -r ./jextension /usr/lib/python3.5
echo "Added to python3.5 lib directory"
# Generate Jupyter Notebook configuration file
echo "Generating configuration files"
rm ~/.jupyter/jupyter_notebook_config.py
jupyter notebook --generate-config
# Modify config file to install server extension
echo "Copying configuration files"
cp ./configs/jupyter_notebook_config_bak.py ~/.jupyter/jupyter_notebook_config.py
# Get static path of 'static' directory
cd table_extension
CURRENT_PATH=$(dirname $(readlink -f "$0"))
cd ..
# Install and enable front-end extension
echo "Installing and enabling extensions"
jupyter nbextension install $CURRENT_PATH
jupyter nbextension enable --section=tree table_extension/main
