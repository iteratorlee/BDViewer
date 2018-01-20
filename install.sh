# Check if jupyter has been installed
command -v jupyter >/dev/null 2>&1 || { echo >&2 "I require jupyter but it's not installed.  Aborting."; exit 0; }

# Add ./jextension package to python (default version is 3.5)
echo "Adding lib files..."
cp -r ./jextension /usr/lib/python2.7
echo "Added to python2.7 lib directory"
cp -r ./jextension /usr/lib/python3.5
echo "Added to python3.5 lib directory"

# Modify config file to install server extension
JUPYTER_CONFIG_PATH="/root/.jupyter"

if [ ! -d $JUPYTER_CONFIG_PATH ]; then
    echo "Please generate your jupyter configuration file first"
    exit 0
fi

# Enable server extension
jupyter serverextension enable --py jextension.jextension

# Install json operating toolkit jq
apt install jq

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
