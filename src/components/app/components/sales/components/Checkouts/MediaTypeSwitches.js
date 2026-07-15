import React from 'react'
import { Nav, NavItem, NavLink, Label, Spinner, TabContent, TabPane, Input, Button } from 'reactstrap'

const MediaTypeSwitches = ({onTabChanges, activeTab, checkoutModel, imageLoading, removeLogoConfirmation, onVideoUpload, onImageUpload}) => {
  return (
    <div>
      <Nav className="nav nav-pills tab-2 mb-3">
        <NavItem>
          <NavLink active={activeTab === '1'} onClick={()=>onTabChanges("1")}>Image</NavLink>
        </NavItem>
        <NavItem>
          <NavLink active={activeTab === '2'} onClick={()=>onTabChanges("2")}>Videos</NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          {checkoutModel && !!checkoutModel.bannerUrl ? (
            <div className="uploader-zone p-0">
              <div>
                <div className="uploaded-image">
                <img src={checkoutModel.bannerUrl} height="190" alt="" />
              </div>
                <Button className="remove-icon" color="danger" onClick={removeLogoConfirmation}><i className="fal fa-times" /></Button>
              </div>
            </div>
          ) : (
            <Label className="uploader-zone">                                
              {imageLoading ?             
                <div className="p-5">
                  <Spinner size="lg" color="default my-1" />                                  
                </div>
            : 
                <div>
                  <div>
                  <span className="upload-icon">
                    <i className="fal fa-upload" />
                  </span>
                  <div className="py-text--browse">
                    <span className="py-text--link">
                    Browse
                  </span>{' '}
                    or drop your image here.
                </div>
                  <div className="py-text--hint">
                    Maximum 10MB in size. <br />
                    JPG, PNG, or GIF formats.
                </div>
                  <div className="py-text--hint mb-0">
                    Recommended size: 500 x 300 pixels.
                </div>
                  <Input
                    type="file"
                    name="bannerUrl"
                    id="bannerUrl"
                    className="h-100"
                    onChange={(e) => onImageUpload(e)}
                    accept=".jpg,.png,.jpeg"
                  />
                </div>
                </div>}
            </Label>
          )}
        </TabPane>
        <TabPane tabId="2">
          {checkoutModel && !!checkoutModel.bannerUrl ? (
            <div className="uploader-zone p-0">
              <div>
                <div className="uploaded-video">
                  <video width="338" height="190" src={checkoutModel.bannerUrl} controls>
                    <p>Your browser doesn't support HTML5 video. Here is
                      a <a href={checkoutModel.bannerUrl}>link to the video</a> instead.
                    </p>
                  </video>
                </div>
                <Button className="remove-icon" color="danger" onClick={removeLogoConfirmation}><i className="fal fa-times" /></Button>
              </div>
            </div>
            ) : (
              <Label className="uploader-zone">                                
                {imageLoading ?             
                  <div className="p-5">
                    <Spinner size="lg" color="default my-1" />                                  
                  </div>
              : 
                  <div>
                    <div>
                    <span className="upload-icon">
                      <i className="fal fa-upload" />
                    </span>
                    <div className="py-text--browse">
                      <span className="py-text--link">
                      Browse
                    </span>{' '}
                      or drop your video here.
                  </div>
                    <div className="py-text--hint">
                      Maximum 500MB in size. <br />
                      WebM, MKV, GIF, MOV or MP4 formats.
                  </div>
                    <div className="py-text--hint mb-0">
                      Recommended size: 500 x 300 pixels.
                  </div>
                    <Input
                      type="file"
                      name="bannerUrl"
                      id="bannerUrl"
                      className="h-100"
                      onChange={(e) => onVideoUpload(e)}
                      accept=".webm,.gif,.mkv,.mp4,.mov,.mpeg4,.m4v"
                    />
                  </div>
                  </div>}
              </Label>
            )}
        </TabPane>
      </TabContent>
    </div>

  )
}

export default MediaTypeSwitches