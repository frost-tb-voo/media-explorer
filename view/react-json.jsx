// const Lightbox = require('./lib/react-images/react-images'); import Lightbox
// from './lib/react-images/lib/Lightbox';

const jsonFileList = [];
jsonFileList.push("./images.json");



const TABLE_SIZE = 4 * 4;
const MAX_PATH_LENGTH = 50;

class ImageBox extends React.Component {
  constructor(props) {
    super(props);
    let length = 1;
    this.state = {
      jsonFile: jsonFileList[jsonFileList.length - 1],
      showControl: true,
      style: {
        maxWidth: this.computeMaxWidth(length),
        maxHeight: this.computeMaxHeight(length)
      },
      index: 0,
      length: length,
      images: []
    };

    document.addEventListener('keypress', (event) => {
      const keyName = event.key;
      console.log(`Key pressed ${keyName}`);

      if (keyName === 'Control') {
        return;
      }

      //if (event.ctrlKey) {} else {
        if (keyName === 's' || keyName === 'S' || keyName === 'h' || keyName === 'H') {
          if (this.state.showControl) {
            this.setState({showControl: false});
          } else {
            this.setState({showControl: true});
          }
        } else if (keyName === 'ArrowUp' || keyName === 'u' || keyName === 'U') {
          this.explorer({images: this.state.images, index: this.state.index});
        } else if (keyName === 'ArrowLeft' || keyName === 'Backspace' || keyName === 'Delete' || keyName === 'b' || keyName === 'B' || keyName === 'l' || keyName === 'L') {
          this.setPrevImage(1 * this.state.length);
        } else {
          this.setNextImage(1 * this.state.length);
        }
      //}
    }, false);
  }

  componentDidMount() {
    this.setJsonFile(this.state.jsonFile);
  }

  setJsonFile(jsonFile) {
    console.log('JSON file: ' + jsonFile);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", jsonFile, true);
    xhr.onload = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // console.log(xhr.responseText);
          let directories = JSON.parse(xhr.responseText);
          directories = directories.sort(function (aa, bb) {
            return aa.directory > bb.directory
              ? 1
              : -1;
          });
          for (let directory of directories) {
            directory.directory = directory
              .directory
              .replace(/\\\\/g, '/')
              .replace(/\\/g, '/');
            for (let image of directory.images) {
              image.directory = image
                .directory
                .replace(/\\\\/g, '/')
                .replace(/\\/g, '/');
            }
          }

          let extList = {
            '': 0
          };
          let maxWidth = 0;
          let maxHeight = 0;
          let fids = {}
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
              fids[image.fid] = image;
            }
          }
          console.log('extList ' + JSON.stringify(extList, null, 2))
          this.setState({
            jsonFile: jsonFile,
            directories: directories,
            extList: extList,
            maxWidth: maxWidth,
            maxHeight: maxHeight,
            fids: fids,
            images: [],
            directory: '',
            index: 0
          });
        } else {
          console.error(xhr.status + ': ' + xhr.statusText);
        }
      }
    }.bind(this);
    xhr.onerror = function (e) {
      console.error(xhr.status + ': ' + xhr.statusText);
    };
    xhr.send(null);
  }

  setNextImage(step) {
    if (this.state) {
      let index = this.state.index + step;
      if (this.state.images.length && this.state.images.length < index) {
        index = this.state.images.length - 1;
      }
      console.log('index ' + index);
      this.setState({index: index});
    }
  }

  setPrevImage(step) {
    if (this.state) {
      let index = this.state.index - step;
      if (index < 0) {
        index = 0;
      }
      console.log('index ' + index);
      this.setState({index: index});
    }
  }

  setMaxWidth(newState) {
    let length = this.state.length;
    if (newState.length) {
      length = newState.length;
    }
    if (length > 1) {
      this.setMaxSize();
      return;
    }
    let style = this.state.style;
    delete style.maxWidth;
    delete style.maxHeight;
    style.maxWidth = this.computeMaxWidth(length);
    let _newState = Object.assign({
      style: style
    }, newState);
    this.setState(_newState);
  }

  computeMaxWidth(length) {
    return (window.innerWidth - 5) * 0.95 / Math.ceil(Math.sqrt(length));
  }

  setMaxHeight(newState) {
    let length = this.state.length;
    if (newState.length) {
      length = newState.length;
    }
    if (length > 1) {
      this.setMaxSize();
      return;
    }
    let style = this.state.style;
    delete style.maxWidth;
    delete style.maxHeight;
    style.maxHeight = this.computeMaxHeight(length);
    let _newState = Object.assign({
      style: style
    }, newState);
    this.setState(_newState);
  }

  computeMaxHeight(length) {
    return (window.innerHeight - 5) * 0.95 / Math.ceil(Math.sqrt(length));
  }

  setMaxSize(newState) {
    let length = this.state.length;
    if (newState.length) {
      length = newState.length;
    }
    let style = this.state.style;
    delete style.maxWidth;
    delete style.maxHeight;
    style.maxWidth = this.computeMaxWidth(length);
    style.maxHeight = this.computeMaxHeight(length);
    let _newState = Object.assign({
      style: style
    }, newState);
    console.log('#setMaxSize ' + JSON.stringify(style, null, 2));
    this.setState(_newState);
  }

  resetMaxSize(newState) {
    let length = this.state.length;
    if (newState.length) {
      length = newState.length;
    }
    if (length > 1) {
      this.setMaxSize();
      return;
    }
    let style = this.state.style;
    delete style.maxWidth;
    delete style.maxHeight;
    let _newState = Object.assign({
      style: style
    }, newState);
    this.setState(_newState);
  }

  render() {
    let images = this.getFilteredImages();
    let image = '';
    let directory = '';
    if (this.state.directories) {
      if (images.length) {
        image = images[0];
        directory = image.directory;
        console.log('images ' + images.length);
        let _image = Object.assign({}, image);
        delete _image.similarities;
        console.log('image ' + JSON.stringify(_image, null, 2));
      } else {
        let state = {};
        state = Object.assign(state, this.state);
        delete state.directories;
        delete state.fids;
        console.log('state ' + JSON.stringify(state, null, 2));
      }
    }

    let imgClassName = '';
    let imageStyle = {};
    if (this.state.length == 1 && this.state.style.maxWidth && !this.state.style.maxHeight) {
      imgClassName = "img-responsive";
      console.log('responsive style');
    }
    if (!imgClassName) {
      imageStyle = Object.assign(imageStyle, this.state.style);
      console.log('not responsive style ' + JSON.stringify(imageStyle, null, 2));
    }

    let media;
    if (images.length) {
      media = this.renderMedia(imgClassName, imageStyle, images);
    }
    let controller = this.renderController(image, directory);

    let styleDiv1 = {};
    styleDiv1.position = 'absolute';
    styleDiv1.zIndex = 1;
    styleDiv1.align = 'center';
    styleDiv1.textAlign = 'center';
    let styleDiv2 = {};
    styleDiv2.position = 'fixed';
    styleDiv2.bottom = 0;
    styleDiv2.right = 0;
    styleDiv2.zIndex = 10;
    styleDiv2.opacity = 0.9;

    // this.state.lightboxIsOpen = false; this.gotoPrevious = this.previousImage;
    // this.gotoNext = this.nextImage; this.closeLightbox = this.nextImage;

    return (
      <div className="imageBox">
        <div style={styleDiv1} ref='div1'>
          {media}
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

  renderMedia(imgClassName, imageStyle, images) {
    let imagePathes = [];
    for (let _image of images) {
      let _imagePath = '';
      _imagePath += 'file:///';
      _imagePath += _image.directory + '/' + _image.name;
      _imagePath = _imagePath.replace(/\\/g, '/');

      //      _imagePath = encodeURI(_imagePath);      _imagePath =
      // encodeURIComponent(_imagePath);
      _imagePath = _imagePath.replace(/\#/g, escape('#'));
      _imagePath = _imagePath.replace(/\%/g, escape('%'));

      imagePathes.push(_imagePath);
    }

    if (this.state.length == 1) {
      let _image = images[0];
      let _imagePath = imagePathes[0];
      let mediaTag = this.renderImage(imgClassName, imageStyle, _imagePath);
      if (_image.ext == '.mp4' || _image.ext == '.flv' || _image.ext == '.swf' || _image.ext == '.wmv' || _image.ext == '.avi' || _image.ext == 'mpeg' || _image.ext == '.mpg' || _image.ext == '.aac' || _image.ext == '.h264' || _image.ext == '.wave' || _image.ext == '.wav' || _image.ext == '.mp3' || _image.ext == '.flac' || _image.ext == '.opus' || _image.ext == '.spx' || _image.ext == '.ogx' || _image.ext == '.ogv' || _image.ext == '.oga' || _image.ext == '.ogg' || _image.ext == '.webm') {
        mediaTag = this.renderVideo(imgClassName, imageStyle, _imagePath, _image.ext);
      }
      return (
        <div ref='images' onClick={() => this.setNextImage(1 * this.state.length)}>
          {mediaTag}
        </div>
      );
    }

    let sqrtLength = Math.ceil(Math.sqrt(this.state.length));
    let imageRows = [];
    for (let ii = 0; ii < sqrtLength; ii++) {
      let imageCols = [];
      imageRows.push(imageCols);
      for (let jj = 0; jj < sqrtLength; jj++) {
        const index = ii * sqrtLength + jj;
        if (index < images.length) {
          let _image = {};
          _image = Object.assign(_image, images[index]);
          _image.imagePath = imagePathes[index];
          _image.index = this.state.index + index;
          imageCols.push(_image);
          //          console.log('table ' + JSON.stringify(_image, null, 2));
        }
      }
    }
    let tableStyle = {};
    tableStyle.display = 'table-cell';
    tableStyle.textAlign = 'center';
    tableStyle.verticalAlign = 'middle';
    tableStyle.width = imageStyle.maxWidth;
    tableStyle.height = imageStyle.maxHeight;
    let imageTags = imageRows.map((imageCols, ii) => <tr key={ii}>{imageCols
        .map(function (_image, jj) {
          let _imagePath = _image.imagePath;
          let mediaTag = this.renderImage(imgClassName, imageStyle, _imagePath);
          if (_image.ext == '.mp4' || _image.ext == '.flv' || _image.ext == '.swf' || _image.ext == '.wmv' || _image.ext == '.avi' || _image.ext == 'mpeg' || _image.ext == '.mpg' || _image.ext == '.aac' || _image.ext == '.h264' || _image.ext == '.wave' || _image.ext == '.wav' || _image.ext == '.mp3' || _image.ext == '.flac' || _image.ext == '.opus' || _image.ext == '.spx' || _image.ext == '.ogx' || _image.ext == '.ogv' || _image.ext == '.oga' || _image.ext == '.ogg' || _image.ext == '.webm') {
            mediaTag = this.renderVideo(imgClassName, imageStyle, _imagePath);
          }
          return (
            <td
              key={jj}
              style={tableStyle}
              className="img-thumbnail"
              onClick={(event) => this.setMaxSize({index: _image.index, length: 1})}>
              {mediaTag}
            </td>
          );
        }.bind(this))}
    </tr>);

    return (
      <div ref='images'>
        <table>
          <tbody>{imageTags}</tbody>
        </table>
      </div>
    );
  }

  renderVideo(imgClassName, imageStyle, imagePath, ext) {
    if (ext == '.swf') {
      /*
    <object data="flvplayer.swf" type="application/x-shockwave-flash">
      <param value="flvplayer.swf" name="movie"/>
    </object>
    */
    }
    if (ext == '.flv') {
      /*
<video
    id="my-player"
    class="video-js"
    controls
    preload="auto"
    poster="//vjs.zencdn.net/v/oceans.png"
    data-setup='{}'>
  <source src="//vjs.zencdn.net/v/oceans.mp4" type="video/mp4"></source>
  <source src="//vjs.zencdn.net/v/oceans.webm" type="video/webm"></source>
  <source src="//vjs.zencdn.net/v/oceans.ogv" type="video/ogg"></source>
  <p class="vjs-no-js">
    To view this video please enable JavaScript, and consider upgrading to a
    web browser that
    <a href="http://videojs.com/html5-video-support/" target="_blank">
      supports HTML5 video
    </a>
  </p>
</video>
<link href="//vjs.zencdn.net/5.19/video-js.min.css" rel="stylesheet">
<script src="//vjs.zencdn.net/5.19/video.min.js"></script>
    */
    }
    return (<video
      className={imgClassName}
      style={imageStyle}
      key={imagePath}
      src={imagePath}/>);
  }

  renderImage(imgClassName, imageStyle, imagePath) {
    return (<img
      className={imgClassName}
      style={imageStyle}
      key={imagePath}
      src={imagePath}/>);
  }

  renderController(image, directory) {
    let imageName = '';
    if (image) {
      imageName = image.name;
    }

    if (!this.state.showControl) {
      return (
        <div className="panel panel-default">
          <div className="panel-body">
            <div className="form-inline">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                this.setState({showControl: true})
              }}>{ imageName }</button>
            </div>
          </div>
        </div>
      );
    } else {
      let filterDirectoryOptions = this.renderFilterDirectoryOptions(image);
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
        for (let ii = 0; ii < this.state.maxWidth / 400; ii++) {
          widthList.push(400 * ii);
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
        for (let ii = 0; ii < this.state.maxHeight / 400; ii++) {
          heightList.push(400 * ii);
        }
        filterHeightOptions = heightList.map(function (height) {
          return (
            <option key={height} value={height}>{height}</option>
          );
        }.bind(this));
      }

      let filterDirectoryLinks;
      if (image || this.state.directory) {
        let _directory = image
          ? image.directory
          : this.state.directory;
        let directoryNames = _directory.split(/[\\\/]/);
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
                onClick={() => this.setMaxSize({index: 0, directory: directoryPathes[directoryName], images: [], length: TABLE_SIZE})}>
                {directoryName}</button>
            </li>
          );
        }.bind(this));
      }

      let similarityOptions;
      if (image && image.similarities) {
        let similarities = [];
        if (image.similarities.length) {
          let _similarity = Object.assign({}, image);
          _similarity.value = 0;
          similarities.push(_similarity);
        }
        for (let similarity of image.similarities) {
          let _similarity = Object.assign({}, similarity);
          if (_similarity.fid) {
            let fid = _similarity.fid;
            _similarity = Object.assign(_similarity, this.state.fids[fid]);
          }
          similarities.push(_similarity);
        }
        similarities = similarities.sort(function (aa, bb) {
          return aa.value - bb.value;
        });
        similarityOptions = similarities.map(function (similarity) {
          if (!similarity.name) {
            return (
              <option key={'default'} value={JSON.stringify(similarities)}></option>
            );
          }
          let value = Math.floor(1000 * similarity.value) / 1000;
          let path = similarity.directory + '/' + similarity.name;
          if (path.length > MAX_PATH_LENGTH) {
            path = path.substring(0, 9) + '..' + path.substring(path.length - MAX_PATH_LENGTH + 10, path.length);
          }
          return (
            <option key={path} value={JSON.stringify(similarities)}>{value}: {path}</option>
          );
        }.bind(this));
      }

      let selectorJsonFileOptions;
      if (this.state.jsonFile) {
        selectorJsonFileOptions = jsonFileList.map(function (jsonFile) {
          return (
            <option key={jsonFile} value={jsonFile}>{jsonFile}</option>
          );
        }.bind(this));
      }

      let backwardClassName = 'btn btn-default btn-sm';
      if (this.state.index) {
        backwardClassName = 'btn btn-primary btn-sm';
      }
      let fastBackwardButton = (
        <button className={backwardClassName} onClick={() => this.setPrevImage(1000)}>
          <span className="glyphicon glyphicon-fast-backward" aria-hidden="true"></span>
        </button>
      );
      let stepBackwardButton = (
        <button
          className={backwardClassName}
          onClick={() => this.setPrevImage(1 * this.state.length)}>
          <span className="glyphicon glyphicon-step-backward" aria-hidden="true"></span>
        </button>
      );

      let levelUpClassName = 'btn btn-default btn-sm';
      if (this.state.images.length && this.state.length == 1) {
        levelUpClassName = 'btn btn-primary btn-sm';
      }
      let levelUpButton = (
        <button
          className={levelUpClassName}
          onClick={() => this.explorer({images: this.state.images, index: this.state.index})}>
          <span className="glyphicon glyphicon-level-up" aria-hidden="true"></span>
        </button>
      );

      let forwardClassName = 'btn btn-default btn-sm';
      if (!this.state.images.length || this.state.images.length - 1 > this.state.index) {
        forwardClassName = 'btn btn-primary btn-sm';
      }
      let stepForwardButton = (
        <button
          className={forwardClassName}
          onClick={() => this.setNextImage(1 * this.state.length)}>
          <span className="glyphicon glyphicon-step-forward" aria-hidden="true"></span>
        </button>
      );
      let fastForwardButton = (
        <button className={forwardClassName} onClick={() => this.setNextImage(1000)}>
          <span className="glyphicon glyphicon-fast-forward" aria-hidden="true"></span>
        </button>
      );

      let sortButton = this.renderSortButton(false);
      let sortAltButton = this.renderSortButton(true);

      return (
        <div
          className="panel panel-default"
          style={{
          'textAlign': 'right'
        }}>
          <div className="panel-body">
            <div
              className="form-inline"
              style={{
              'textAlign': 'left'
            }}>
              <button
                className="close"
                aria-label="Close"
                onClick={() => {
                this.setState({showControl: false})
              }}>
                <span aria-hidden="true">&times;</span>
              </button>

              <div className="form-group">
                {fastBackwardButton}
                {stepBackwardButton}
                &nbsp;
                {levelUpButton}
                &nbsp;
                {sortButton}
                {sortAltButton}
                &nbsp;
                {stepForwardButton}
                {fastForwardButton}
              </div>
            </div>
            <div className="form-inline">
              <ol className="breadcrumb">
                {filterDirectoryLinks}
                <li className="active">{imageName}</li>
              </ol>
            </div>
            <div className="form-inline">
              <div className="form-group">
                <label htmlFor="directory-filter">jump to directory &nbsp;</label>
                <select
                  id="directory-filter"
                  className="form-control"
                  value={this.state.directory}
                  onChange={(event) => this.explorer({
                  images: JSON.parse(event.target.value)
                })}>
                  {filterDirectoryOptions}
                </select>
              </div>
            </div>
            <div className="form-inline">
              <div className="form-group">
                <label htmlFor="resize-selector">resize &nbsp;</label>
                <select id="resize-selector" className="form-control">
                  <option onClick={() => this.setMaxSize({})}>size=auto</option>
                  <option onClick={() => this.setMaxWidth({})}>width=auto</option>
                  <option onClick={() => this.setMaxHeight({})}>height=auto</option>
                  <option onClick={() => this.resetMaxSize({})}>raw</option>
                </select>
              </div>
            </div>
            <div className="form-inline">
              <div className="form-group">
                <label htmlFor="ext-filter">filter by ext &nbsp;</label>
                <select
                  id="ext-filter"
                  className="form-control"
                  onChange={(event) => this.setState({index: 0, ext: event.target.value})}>
                  {filterExtOptions}
                </select>
                <label htmlFor="width-filter">&nbsp; by width &nbsp;</label>
                <select
                  id="width-filter"
                  className="form-control"
                  onChange={(event) => this.setState({index: 0, minWidth: event.target.value})}>
                  {filterWidthOptions}
                </select>
                <label htmlFor="height-filter">&nbsp; by height &nbsp;</label>
                <select
                  id="height-filter"
                  className="form-control"
                  onChange={(event) => this.setState({index: 0, minHeight: event.target.value})}>
                  {filterHeightOptions}
                </select>
              </div>
            </div>
            <div className="form-inline">
              <div className="form-group">
                <label htmlFor="similarity-selector">similar images &nbsp;</label>
                <select
                  id="similarity-selector"
                  className="form-control"
                  onChange={(event) => this.explorer({
                  images: JSON.parse(event.target.value)
                })}>
                  {similarityOptions}
                </select>
              </div>
            </div>
            <div className="form-inline">
              <div className="form-group">
                <label htmlFor="json-selector">index data &nbsp;</label>
                <select
                  id="json-selector"
                  className="form-control"
                  onChange={(event) => this.remount({jsonFile: event.target.value})}>
                  {selectorJsonFileOptions}
                </select>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  renderFilterDirectoryOptions(image) {
    let filterDirectoryOptions;
    if (this.state.directories) {
      let _directories = [
        {
          directory: '',
          images: []
        }
      ];
      if (this.state.directory) {
        _directories.unshift({directory: this.state.directory, images: []});
      } else if (image) {
        _directories.unshift({directory: image.directory, images: []});
      }
      for (let _directory of this.state.directories) {
        if (this.state.directory) {
          let directoryPath = _directory
            .directory
            .replace(/\\\\/g, '/')
            .replace(/\\/g, '/');
          if (!directoryPath.includes(this.state.directory)) {
            // console.log('Skip ' + directoryPath + ' not included in ' +
            // this.state.directory);
            continue;
          }
        }
        _directories.push(_directory);
      }
      filterDirectoryOptions = _directories.map(function (_directory) {
        // console.log(JSON.stringify(directory, null, 2));
        let directoryPath = _directory
          .directory
          .replace(/\\\\/g, '/')
          .replace(/\\/g, '/');
        let length = _directory.images.length;
        let directoryName = directoryPath.replace('/' + this.state.directory + '/', './');
        if (directoryName.length > MAX_PATH_LENGTH) {
          directoryName = directoryName.substring(0, 9) + '..' + directoryName.substring(directoryName.length - MAX_PATH_LENGTH + 10, directoryName.length);
        }
        if (!length) {
          return (
            <option
              key={'default-' + directoryPath}
              value={JSON.stringify(_directory.images)}>{directoryName}</option>
          );
        }
        return (
          <option key={directoryPath} value={JSON.stringify(_directory.images)}>x{length}&nbsp;{directoryName}</option>
        );
      }.bind(this));
    }
    return filterDirectoryOptions;
  }

  renderSortButton(sortByAlt) {
    let iconClassName = 'glyphicon glyphicon-sort-by-alphabet';
    let directoriesSortFunc = function (aa, bb) {
      return aa.directory > bb.directory
        ? 1
        : -1;
    }
    let imagesSortFunc = function (aa, bb) {
      if (aa.directory == bb.directory) {
        return aa.name > bb.name
          ? 1
          : -1;
      }
      return aa.directory > bb.directory
        ? 1
        : -1;
    }
    if (sortByAlt) {
      iconClassName = 'glyphicon glyphicon-sort-by-alphabet-alt';
      directoriesSortFunc = function (aa, bb) {
        return aa.directory > bb.directory
          ? -1
          : 1;
      }
      imagesSortFunc = function (aa, bb) {
        if (aa.directory == bb.directory) {
          return aa.name > bb.name
            ? -1
            : 1;
        }
        return aa.directory > bb.directory
          ? -1
          : 1;
      }
    }
    return (
      <button
        className="btn btn-primary btn-sm"
        onClick={() => {
        let directories = [];
        if (this.state.directories) {
          directories = Object.assign(directories, this.state.directories);
        }
        directories = directories.sort(directoriesSortFunc);
        let images = [];
        if (this.state.images) {
          images = Object.assign(images, this.state.images);
        }
        images = images.sort(imagesSortFunc);
        this.setState({directories: directories, images: images});
      }}>
        <span className={iconClassName} aria-hidden="true"></span>
      </button>
    );
  }

  remount(newState) {
    const jsonFile = newState.jsonFile;
    this.setJsonFile(jsonFile);
  }

  explorer(newState) {
    const images = newState.images;
    let index = 0;
    if (newState.index) {
      index = newState.index;
    }
    //    console.log('explorer ' + JSON.stringify(newState, null, 2));
    console.log('explorer ' + index + ' / ' + images.length);
    if (images.length) {
      let length = Math.min(images.length, TABLE_SIZE);
      this.setMaxSize({index: index, images: images, length: length});
    } else {
      this.setMaxSize({index: index, images: images, length: 1});
    }
  }

  getFilteredImages() {
    let images = [];

    let _images = Object.assign([], this.state.images);
    if (!_images.length && this.state.directories) {
      for (let _directory of this.state.directories) {
        if (this.state.directory) {
          let directoryPath = _directory
            .directory
            .replace(/\\\\/g, '/')
            .replace(/\\/g, '/');
          // console.log(directoryPath);
          if (!directoryPath.includes(this.state.directory)) {
            continue;
          }
        }
        for (let _image of _directory.images) {
          _images.push(_image);
        }
      }
      if (_images.length) {
        // TODO before rendering
        this.setState({images: _images});
        return images;
      }
    }

    let cursorIndex = 0;
    for (let _image of _images) {
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
      images.push(_image);
      if (images.length >= this.state.length) {
        break;
      }
    }

    if (cursorIndex && !images.length) {
      // TODO before rendering
      this.setPrevImage(1 + this.state.index - cursorIndex);
      return images;
    }

    return images;
  }

}

ReactDOM.render(
  <ImageBox/>, document.getElementById('root'));
