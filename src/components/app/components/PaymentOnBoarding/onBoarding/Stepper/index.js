import 'rc-steps/assets/index.css'
import React, { useEffect, useState } from 'react'
import Steps, { Step } from 'rc-steps'
import { get as _get } from 'lodash'

import { _documentTitle } from '../../../../../../utils/GlobalFunctions'

const Index = props => {
  const [stepflag, setstepflag] = useState()
  useEffect(() => {
    setstepflag(props.currentStep)
    _documentTitle({},_get(props.stepperData[props.activeStep],'name',props.stepperData[props.activeStep]))
  })

  return (
    <Steps direction="vertical" current={props.activeStep}>
      {(props.stepperData || []).map((step, idx) => (
          <Step key={idx} title={_get(step, 'name', step)}
                onClick={() => {
                  if (props.visitedStep.includes(idx + 1)) props.handleSteps(idx)
                }}/>
      ))}
    </Steps>
  )
}

export default Index