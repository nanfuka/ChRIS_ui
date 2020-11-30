import * as React from "react";
import { Button } from "@patternfly/react-core";
import { DownloadIcon, ExpandIcon, FilmIcon } from "@patternfly/react-icons";
import {
  getFileExtension,
  IUITreeNode,
} from "../../api/models/file-explorer.model";
import { IFileBlob } from "../../api/models/file-viewer.model";

import { fileViewerMap } from "../../api/models/file-viewer.model";

import { LoadingSpinner } from "..";
import ViewerDisplay from "./displays/ViewerDisplay";
import { isEqual } from "lodash";
import "./file-detail.scss";

type AllProps = {
  selectedFile: IUITreeNode;
  fullScreenMode?: boolean;
  toggleFileBrowser: () => void;
  toggleFileViewer: () => void;
  isDicom?: boolean;
};

class FileDetailView extends React.Component<AllProps, IFileBlob> {
  _isMounted = false;
  constructor(props:AllProps){
    super(props);
    this.state = {
        blob: undefined,
        fileType: "",
        file: undefined,
      };
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchData();
  }
;

  render() {
    const { selectedFile } = this.props;

    const fileTypeViewer = () => {
      if (!isEqual(selectedFile.file.data, this.state.file)) {
        this.fetchData();
        return <LoadingSpinner color="#ddd" />;
      } else {
        let viewerName: string = "";
        let filesize: number = 1000000;
        if(this.state.blob && this.state.blob.size > filesize){

          viewerName='CatchallDisplay'
        }
        else if (!fileViewerMap[this.state.fileType]) {
          viewerName = "IframeDisplay";
        } else {
          viewerName = fileViewerMap[this.state.fileType];
        }



        return (
          <>
            {this.renderHeader()}
            <div className="viewer-display">
              <ViewerDisplay tag={viewerName} fileItem={this.state} />
            </div>
          </>
        );
      }
    };
    return fileTypeViewer();
  }

  // Decription: Render the Header
  renderHeader() {
    const { selectedFile } = this.props;
    return (
        <div className="header-panel">
          {this.renderDownloadButton()}
          <h1>
            File Preview: <b>{selectedFile.module}</b>
          </h1>
        </div>
    );
  }

  // Description: Fetch blob and read it into state to display preview
  fetchData() {
    const { selectedFile } = this.props;

    const fileName = selectedFile.module,
      fileType = getFileExtension(fileName);
    selectedFile.file.getFileBlob().then((result: any) => {
      const _self = this;
      if (!!result) {
        const reader = new FileReader();
        reader.addEventListener("loadend", (e: any) => {
          _self._isMounted &&
            _self.setState({
              blob: result,
              fileType,
              file: Object.assign({}, selectedFile.file.data),
            });
        });
        reader.readAsText(result);
      }
    });
  }

  renderDownloadButton = () => {
    const { fullScreenMode } = this.props;

    return (
      <>
        {fullScreenMode === true && (
          <Button
            variant="link"
            onClick={() => {
              this.props.toggleFileBrowser();
            }}
          >
            <ExpandIcon />
            <span> Maximize</span>
          </Button>
        )}

        {(this.state.fileType === "dcm" ||
          this.state.fileType === "png" ||
          this.state.fileType === "jpg" ||
          this.state.fileType === "jpeg") && (
          <Button
            variant="link"
            onClick={() => {
              this.props.toggleFileViewer();
            }}
          >
            <FilmIcon />
            <span> Open Image Viewer</span>
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            this.downloadFileNode();
          }}
        >
          <DownloadIcon />
        </Button>
      </>
    );
  };

  // Download Curren File blob
  downloadFileNode = () => {};

  componentWillUnmount() {
    this._isMounted = false;
  }
}

export default FileDetailView;
