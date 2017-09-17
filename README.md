# media-explorer
Media explorer with a web browser for your local storage.

## Requirement
- python, pip, pip-install

### Dependency install with pip
In `./fileanalysis` directory,

- `pip install pip-tools==1.9.0`
- `pip-compile requirements.in`
- `pip install -r requirements.txt`

## How to Use
- Edit `./fileanalysis/fileanalysis.py` and rewrite `directory` var into your targetting dir.
- `python ./fileanalysis/fileanalysis.py`
- Open `./view/index.html` with your browser

## License
The files in following directory are NOT provided in MIT license.

- `./view/lib`
