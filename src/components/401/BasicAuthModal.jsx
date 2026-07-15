import {
  Button,
  Col,
  FormGroup,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from 'reactstrap'
import React, { useRef, useState } from 'react'
import request from '../../api/request'

const BasicAuthModal = ({ isOpen }) => {
  const [state, setState] = useState({
    error: false,
    isLoading: false,
  })
  const basicAuthRef = useRef()

  const onSubmit = () => {
    setState({
      isLoading: true,
      error: false,
    })
    request({
      url: `/api/v1/validateBasicAuth`,
      method: 'POST',
      data: {
        basicAuthToken: basicAuthRef.current.value,
      },
    })
      .then((res) => {
        if (res.statusCode === 200) {
          localStorage.setItem('basicAuthToken', basicAuthRef.current.value)
          location.reload()
        } else {
          setState({
            isLoading: false,
            error: true,
          })
        }
      })
      .catch((error) => {
        setState({
          isLoading: false,
          error: true,
        })
      })
  }

  return (
    <Modal isOpen={isOpen} className="modal-add modal-email" centered>
      <ModalHeader>Please enter basic authentication token</ModalHeader>
      <ModalBody>
        <div className="py-3">
          <Input
            placeholder="Basic auth token"
            innerRef={(me) => (basicAuthRef.current = me)}
            className="mt-0"
            name="transferAmount"
          />
          {state.error ? (
            <p className={'status-OFF'}>Token is invalid</p>
          ) : null}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="primary"
          className="ms-2"
          disabled={state.isLoading}
          onClick={onSubmit}
        >
          Submit
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default BasicAuthModal
