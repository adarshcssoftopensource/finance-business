import React from 'react';
import CenterSpinner from '../../../../../../../../global/CenterSpinner';
import finalStepPng from "../../../../../../../../assets/images/final-step.png"

const verify=(props)=> {
    return (
        <div className="text-center">
            <img src={finalStepPng} />
            <div className="py-heading--section-title mb-0"> Hang tight. Your identity is being verified. </div>
            <CenterSpinner />
            <div className="py-heading--subtitle mb-2 mt-0">This may take a few minutes</div>
            <div className="py-heading--subtitle mb-2">We are determined to provide a safe and secure environment for our users. Please allow us a few minutes to verify your identity.</div>
        </div>
    );
}

export default verify;