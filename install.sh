# Check if jupyter has been installed
command -v jupyter >/dev/null 2>&1 || { echo >&2 "BDViewer requires jupyter but it's not installed.  Aborting."; exit 0; }
# Check if pip3 has been installed
command -v pip3 >/dev/null 2>&1 || { echo >&2 "BDViewer requires pip3 but it's not installed.  Aborting."; exit 0; }

# Add ./jextension package to python (default version is 3.5)
echo "Adding lib files..."
cp -r ./jextension /usr/lib/python3.5
echo "Added to python3.5 lib directory"

# Check if jupyter configuration has been generated
if [ "$USER" = "root" ]; then
    JUPYTER_CONFIG_PATH="/root/.jupyter"
else
    HOME_PATH="/home/"
    USER_NAME=$USER
    JUPYTER_SUFFIX="/.jupyter"
    JUPYTER_CONFIG_PATH=${HOME_PATH}${USER_NAME}${JUPYTER_SUFFIX}
fi

if [ ! -d $JUPYTER_CONFIG_PATH ]; then
    echo "Please generate your jupyter configuration file first"
    exit 0
fi

# Create BDViewer log path
if [ ! -d "/var/log/BDViewer" ]; then
    mkdir /var/log/BDViewer
fi

# Enable server extension
jupyter serverextension enable --py jextension.jextension

# Install required packages
apt install jq
pip3 install pandas

# Copy front-end files
cp ./front/templates/table/table.html /usr/local/lib/python3.5/dist-packages/notebook/templates
cp -r ./front/static/table /usr/local/lib/python3.5/dist-packages/notebook/static

# Get static path of 'static' directory
cd table_extension
CURRENT_PATH=$(dirname $(readlink -f "$0"))
cd ..

# Install and enable front-end extension
echo "Installing and enabling extensions"
jupyter nbextension install $CURRENT_PATH
jupyter nbextension enable --section=tree table_extension/main
