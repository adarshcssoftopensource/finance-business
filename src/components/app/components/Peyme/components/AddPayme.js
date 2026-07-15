import React, { useEffect } from 'react'
import { Button, Spinner } from 'reactstrap'

const AddPayme = props => {
  const {
    handleBack,
    handleValidateUserName,
    handlePeymeSuggestions,
    validateUserName,
    buttonDisabled,
    buttonLoading,
    handleSubmitUserName,
    userName,
    peymeSuggestionList,
    handleTabSwitch,
    loadingSuggestions
  } = props
   useEffect(() => {
      handlePeymeSuggestions()
  }, [])
  
  const peymeBaseUrl = process.env.REACT_APP_PUBLIC_BASE_URL
  return (
    <div>
      <div className="peyme-box-wrapper">
        <button
          className="peyme-back"
          onClick={() => handleBack('start')}
        >
          <i className="fas fa-arrow-left" />
        </button>
        <div className="peyme-configure-box">
          {handleTabSwitch()}
          <label htmlFor="userName" className="choose-label">Create your link</label>
          <label htmlFor="userName" className="name-genarate form-control">
            <span className="url-prifix">{`${peymeBaseUrl.split("/")[2]}/for/`}</span>
            <input
              type="text"
              name="userName"
              id="userName"
              value={userName}
              onChange={handleValidateUserName}
            />
          </label>
          {validateUserName && (
            <div className="text-danger text-left">
              Unfortunately, this username is already taken.
            </div>
          )}

          <div className='mt-3 cursor-pointer suggestion-wrapper'>
            <p className="plan-switch font-weight-bold suggestion-tag">Suggestions</p>
            {loadingSuggestions ? (
            <Spinner />
          ) : (
            peymeSuggestionList && peymeSuggestionList.length ? (
              peymeSuggestionList.map((val) => (
                <p
                  color="primary"
                  className="plan-switch suggestion-tag"
                  onClick={() => handleValidateUserName(val,"suggestion")}
                  pill
                >{val}
                </p>
              ))
            ) : (
              <p>No suggestions available.</p>
            )
          )}
            </div>
          <Button
            color="primary"
            className="peyme-action"
            disabled={buttonDisabled || userName === ""}
            onClick={handleSubmitUserName}
          >
            {buttonLoading ? (
              <Spinner size="sm" color="default" />
            ) : (
              'Confirm'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddPayme
