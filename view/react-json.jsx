// const Lightbox = require('./lib/react-images/react-images'); import Lightbox
// from './lib/react-images/lib/Lightbox';

class ImageBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      style: {
        maxWidth: window.innerWidth * 0.95
      },
      showControl: true
    };

    document.addEventListener('keypress', (event) => {
      const keyName = event.key;

      if (keyName === 'Control') {
        // not alert when only Control key is pressed.
        return;
      }

      if (event.ctrlKey) {
        // event.key が 'Control' でなくとも（例えば 'a' が押された時など）、 Ctrl
        // キーが同時に押されていれば　event.ctrlKey は true となります。 alert(`Combination of ctrlKey +
        // ${keyName}`);
      } else {
        // alert(`Key pressed ${keyName}`);
        console.log(`Key pressed ${keyName}`);
        if (keyName === 'ArrowLeft' || keyName === 'ArrowUp' || keyName === 'Backspace' || keyName === 'Delete' || keyName === 'b' || keyName === 'B') {
          this.setPreviousImage();
        } else if (keyName === 's' || keyName === 'S' || keyName === 'h' || keyName === 'H') {
          if (this.state.showControl) {
            this.setState({showControl: false});
          } else {
            this.setState({showControl: true});
          }
        } else {
          this.setNextImage();
        }
      }
    }, false);
  }

  componentDidMount() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "./images.json", true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // console.log(xhr.responseText);
          let directories = JSON.parse(xhr.responseText);
          let extList = {
            '': 0
          };
          let maxWidth = 0;
          let maxHeight = 0;
          for (let directory of directories) {
            for (let image of directory.images) {
              if (extList[image.ext]) {
                extList[image.ext] -= 0;
                extList[image.ext] += 1;
              } else {
                extList[image.ext] = 1;
              }
              if (image.width > maxWidth) {
                maxWidth = image.width;
              }
              if (image.height > maxHeight) {
                maxHeight = image.height;
              }
            }
          }
          console.log('extList ' + JSON.stringify(extList, null, 2))
          this.setState({directories: directories, extList: extList, maxWidth: maxWidth, maxHeight: maxHeight});
        } else {
          console.error(xhr.statusText);
        }
      }
    }.bind(this);
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);
  }

  setNextImage() {
    if (this.state) {
      let index = this.state.index + 1;
      console.log('index ' + index);
      this.setState({index: index});
    }
  }

  setPreviousImage() {
    if (this.state && this.state.index) {
      let index = this.state.index - 1;
      console.log('index ' + index);
      this.setState({index: index});
    }
  }

  setMaxWidth() {
    let style = this.state.style;
    delete style.maxWidth;
    delete style.maxHeight;
    style.maxWidth = window.innerWidth * 0.95;
    this.setState({style: style});
  }

  setMaxHeight() {
    let style = this.state.style;
    delete style.maxWidth;
    delete style.maxHeight;
    style.maxHeight = window.innerHeight * 0.95;
    this.setState({style: style});
  }

  setMaxSize() {
    let style = this.state.style;
    delete style.maxWidth;
    delete style.maxHeight;
    style.maxWidth = window.innerWidth * 0.95;
    style.maxHeight = window.innerHeight * 0.95;
    this.setState({style: style});
  }

  resetMaxSize() {
    let style = this.state.style;
    delete style.maxWidth;
    delete style.maxHeight;
    this.setState({style: style});
  }

  render() {
    let image = '';
    let directory = '';
    if (this.state && this.state.directories) {
      let cursorIndex = 0;
      for (let _directory of this.state.directories) {
        if (this.state.directory) {
          let directoryPath = _directory.directory.replace(/\\\\/g, '/').replace(/\\/g, '/');
          // console.log(directoryPath);
          if (!directoryPath.includes(this.state.directory)) {
            continue;
          }
        }
        let images = _directory.images;
        for (let _image of images) {
          if (this.state.ext && _image.ext != this.state.ext) {
            continue;
          }
          if (this.state.minWidth && _image.width < this.state.minWidth) {
            continue;
          }
          if (this.state.minHeight && _image.height < this.state.minHeight) {
            continue;
          }
          if (this.state.index > cursorIndex) {
            cursorIndex++;
            continue;
          }
          image = _image;
          break;
        }
        if (image) {
          directory = _directory;
          break;
        }
      }
    }

    let imagePath = '';
    if (image) {
      imagePath += 'file:///';
      imagePath += image.directory + '/' + image.name;
      imagePath = imagePath.replace(/\\/g, '/');
      console.log('imagePath ' + imagePath);
    } else {
      let state = {};
      state = Object.assign(state, this.state);
      delete state.directories;
      console.log('state ' + JSON.stringify(state, null, 2));
    }

    let controller = this.renderController(image, directory);

    let imgClassName = '';
    let imageStyle = {};
    if (this.state.style.maxWidth && !this.state.style.maxHeight) {
      imgClassName = "img-responsive";
      console.log('responsive style');
    }
    if (!imgClassName) {
      imageStyle = Object.assign({}, this.state.style);
      console.log('not responsive style ' + JSON.stringify(imageStyle, null, 2));
    }

    let styleDiv1 = {};
    styleDiv1.position = 'absolute';
    styleDiv1.zIndex = 1;
    styleDiv1.align = 'center';
    let styleDiv2 = {};
    styleDiv2.position = 'absolute';
    styleDiv2.bottom = 0;
    styleDiv2.zIndex = 2;
    styleDiv2.opacity = 0.9;

    if (!imagePath) {
      new Promise(() => {
        this.setPreviousImage();
      }).then();
    }

    // this.state.lightboxIsOpen = false; this.gotoPrevious = this.previousImage;
    // this.gotoNext = this.nextImage; this.closeLightbox = this.nextImage;

    if (image.ext == '.mp4' || image.ext == '.flv' || image.ext == '.swf') {
    return (
      <div className="imageBox">
        <div style={styleDiv1} ref='div1'>
          <video
            className={imgClassName}
            style={imageStyle}
            ref='image'
            src={imagePath}
            onClick={() => this.setNextImage()}/>
        </div>
        <div style={styleDiv2} ref='div2'>
          {controller}
        </div>
      </div>
    );
    }
    return (
      <div className="imageBox">
        <div style={styleDiv1} ref='div1'>
          <img
            className={imgClassName}
            style={imageStyle}
            ref='image'
            src={imagePath}
            onClick={() => this.setNextImage()}/>
        </div>
        <div style={styleDiv2} ref='div2'>
          {controller}
        </div>
        {/*<Lightbox
        images={[{ src: imagePath }, { src: imagePath }]}
        isOpen={this.state.lightboxIsOpen}
        onClickPrev={this.gotoPrevious}
        onClickNext={this.gotoNext}
        onClose={this.closeLightbox}
      />*/}
      </div>
    );
  }

  renderController(image, directory) {
    if (!this.state.showControl) {
      return (
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="form-inline">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                this.setState({showControl: true})
              }}>show control</button>
            </div>
          </div>
        </div>
      );
    } else {
      let filterDirectoryOptions;
      if (this.state.directories) {
        let _directories = [
          {
            directory: '',
            images: []
          }
        ];
        if (this.state.directory) {
          _directories.unshift({
            directory: this.state.directory,
            images: []
          });
        }
        for (let directory of this.state.directories) {
          _directories.push(directory);
        }
        filterDirectoryOptions = _directories.map(function (_directory) {
          // console.log(JSON.stringify(directory, null, 2));
          let directoryPath = _directory.directory.replace(/\\\\/g, '/').replace(/\\/g, '/');
          let length = _directory.images.length;
          if (!length) {
            return (
              <option key={'default-' + directoryPath} value={directoryPath}>{directoryPath}</option>
            );
          }
          return (
            <option key={directoryPath} value={directoryPath}>{directoryPath}&nbsp;x{length}</option>
          );
        }.bind(this));
      }
      let filterExtOptions;
      if (this.state.extList) {
        filterExtOptions = Object
          .keys(this.state.extList)
          .map(function (ext) {
            let length = this.state.extList[ext];
            if (!length) {
              return (
                <option key={ext} value={ext}>{ext}</option>
              );
            }
            return (
              <option key={ext} value={ext}>{ext}&nbsp;x{length}</option>
            );
          }.bind(this));
      }
      let filterWidthOptions;
      if (this.state.maxWidth) {
        let widthList = [];
        for (let ii = 0; ii < this.state.maxWidth / 500; ii++) {
          widthList.push(500 * ii);
        }
        filterWidthOptions = widthList.map(function (width) {
          return (
            <option key={width} value={width}>{width}</option>
          );
        }.bind(this));
      }
      let filterHeightOptions;
      if (this.state.maxHeight) {
        let heightList = [];
        for (let ii = 0; ii < this.state.maxHeight / 500; ii++) {
          heightList.push(500 * ii);
        }
        filterHeightOptions = heightList.map(function (height) {
          return (
            <option key={height} value={height}>{height}</option>
          );
        }.bind(this));
      }

      let imageName = '';
      if (image) {
        imageName = image.name;
      }
      let filterDirectoryLinks;
      if (image || this.state.directory) {
        let _directory = image ? image.directory : this.state.directory;
        let directoryNames = _directory
          .split(/[\\\/]/);
        let directoryPathes = {};
        let directoryPath = '';
        for (let directoryName of directoryNames) {
          if (directoryPath) {
            directoryPath += '/';
          }
          directoryPath += directoryName;
          directoryPathes[directoryName] = directoryPath;
        }
        filterDirectoryLinks = directoryNames.map(function (directoryName) {
          return (
            <li key={directoryPathes[directoryName]}>
              <button
                className="btn-link"
                onClick={() => this.setState({index: 0, directory: directoryPathes[directoryName]})}>
                {directoryName}</button>
            </li>
          );
        }.bind(this));
      }

      return (
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="form-inline">
              <button
                className="close"
                aria-label="Close"
                onClick={() => {
                this.setState({showControl: false})
              }}>
                <span aria-hidden="true">&times;</span>
              </button>

              <ol className="breadcrumb">
                {filterDirectoryLinks}
                <li className="active">{imageName}</li>
              </ol>
            </div>
            <div className="form-inline">
              <div className="form-group">
                <button className="btn btn-primary btn-sm" onClick={() => this.setNextImage()}>next</button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => this.setPreviousImage()}>back</button>
                <select className="form-control">
                  <option onClick={() => this.setMaxWidth()}>width=auto</option>
                  <option onClick={() => this.setMaxHeight()}>height=auto</option>
                  <option onClick={() => this.setMaxSize()}>size=auto</option>
                  <option onClick={() => this.resetMaxSize()}>raw</option>
                </select>
              </div>
            </div>
            <div className="form-inline">
              <div className="form-group">
                <select
                  className="form-control" value={this.state.directory}
                  onChange={(event) => this.setState({index: 0, directory: event.target.value})}>
                  {filterDirectoryOptions}
                </select>
                <select
                  className="form-control"
                  onChange={(event) => this.setState({index: 0, ext: event.target.value})}>
                  {filterExtOptions}
                </select>
                <label htmlFor="width-filter">width</label>
                <select
                  id="width-filter"
                  className="form-control"
                  onChange={(event) => this.setState({index: 0, minWidth: event.target.value})}>
                  {filterWidthOptions}
                </select>
                <label htmlFor="height-filter">height</label>
                <select
                  id="height-filter"
                  className="form-control"
                  onChange={(event) => this.setState({index: 0, minHeight: event.target.value})}>
                  {filterHeightOptions}
                </select>
                <input
                  className="form-control"
                  type="text"
                  placeholder="filter, not implemented"
                  ref="filter"
                  size="30"></input>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

ReactDOM.render(
  <ImageBox/>, document.getElementById('root'));
