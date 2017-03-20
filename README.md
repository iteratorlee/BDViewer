# table_extension
An extension for Jupyter Notebook

***

## Introduction
This extension is for csv file view on Jupyter Notebook. When the csv file is too larg, this extension can help you open it quickly. And at the same time, you can do some simple computation.

***

## Usage
First you should make sure notebook is already installed. And support your default Python version is 3.5.
`
git clone http://github.com/iteratorlee/table_extension
cd table_extension
sudo cp -r ./jextension /usr/lib/python3.5
jupyter notebook --generate-config
`
Then open file \'jupyter_notebook_config.py\' and add code as follow:
```
c = get_config()
c.NotebookApp.nbserver_extensions = {
    'jextension.Hello': True,
}
```
Change directory to table_extension
`
jupyter nbextension install /static/path/to/\'table_extension/static\'
jupyter nbextension enable static/main
`
