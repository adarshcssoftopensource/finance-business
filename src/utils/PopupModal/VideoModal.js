import React, { Component } from 'react'
import { Modal } from 'reactstrap'

export default class VideoModal extends Component {
    render() {
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}>
                <video width="640" controls>
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4"/>
                <source src="https://www.w3schools.com/html/mov_bbb.ogg" type="video/ogg"/>
                Your browser does not support HTML5 video.
                </video>
            </Modal>
        )
    }
}
