import React from 'react'
import Select from 'react-select';
import _ from 'lodash';

const SelectBox = (props) => {
    return <Select
        {...props}
        inputProps={{ autoComplete: 'autoOff' }}
        className={`Select${props.className ? " " + props.className : ""}`}
        classNamePrefix={"custom-select"}
        isSearchable={true}
        {...props}
    />
};

export default SelectBox
