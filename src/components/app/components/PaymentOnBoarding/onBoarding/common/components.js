import React, { useEffect, useState } from 'react';
import { Button, Input, InputGroup, InputGroupText } from 'reactstrap';
import InputMask from 'react-input-mask';
import PhoneInput from 'react-phone-input-2';
import moment from 'moment';
import 'react-phone-input-2/lib/style.css';
import DatePicker from 'react-datepicker';
import NumberFormat from 'react-number-format';
import CardStatement from '../../../payments/components/onBoarding/stepForm/stepFive/cardStatement';
import Icon from '../../../../../common/Icon';
import symbolsIcon from '../../../../../../assets/icons/product/symbols.svg';

export const Numbermask = props => {
  return (
    <div className="dateSelect">
      <InputMask
      disabled={props?.options?.readonly}
        mask={props.schema.mask}
        value={props.value}
        placeholder={props.schema.placeholder}
        className="form-control"
        onChange={e => {
          props.onChange(e.target.value)
        }}
      />
    </div>
  )
}

export const BusinessTypeInputMask = props => {
  const [label, setLabel] = useState(props.schema.enum)
  return (
    <div id="onboarding_stepone">
      {label.map((ele, i) => {
        return (
            <div
                key={i}
                className="payment__onboard__business__type__list"
                style={{ textAlign: 'left' }}
            >
                <div
                    className={`${
                        props.value == ele ? 'selectedOptions' : 'selectOptions'
                    }`}
                    onClick={() => props.schema.disabled ? '': props.onChange(ele)}
                >
                    {props.schema.enumNames[i]}
                </div>
            </div>
        )
      })}
    </div>
  )
}

export const BusinessPhoneMask = props => {
  return (
    <PhoneInput
      disableSearchIcon
      countryCodeEditable={false}
      value={props.value ? props.value : ''}
      country={props.schema.countrycode}
      enableSearch
      onChange={e => {
        props.onChange(e)
      }}
      inputClass="w-100"
    />
  )
}

export const DobMask = props => {
  const [startDate, setStartDate] = useState()
  return (
    <div className="dateSelect">
      <DatePicker
        className="form-control"
        selected={props.value ? new Date(props.value) : ""}
        onChange={(date, e) => {
          let dateString = moment(date).format("MM/DD/YYYY")
          setStartDate(date)
          dateString = dateString.toString()
          props.onChange(dateString)
        }}
        placeholderText="MM/DD/YYYY"
        dateFormat={'MM/dd/yyyy'}
        maxDate={new Date(moment().subtract(15, 'YEARS').format('MM/DD/YYYY'))}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        disabled={props?.options?.readonly}
        dropdownMode="select"
        onKeyDown={e => {
          e.preventDefault()
        }}
      />
    </div>
  )
}

export const BusinessIncorporationDateMask = props => {
  const [startDate, setStartDate] = useState()
  return (
    <div className="dateSelect">
      <DatePicker
        className="form-control"
        selected={props.value ? new Date(props.value) : ""}
        onChange={(date, e) => {
          let dateString = moment(date).format("MM/DD/YYYY")
            setStartDate(date)
            dateString = dateString.toString()
          props.onChange(dateString)
        }}
        placeholderText="MM/DD/YYYY"
        dateFormat={'MM/dd/yyyy'}
        maxDate={new Date(moment().format('MM/DD/YYYY'))}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        onKeyDown={e => {
          e.preventDefault()
        }}
      />
    </div>
  )
}

export const DisplayMask = props => {
  const [displayname, setDisplayname] = useState(props.formContext.legalName)
  const [count,setCount] = useState(0)
  useEffect(() => {
    if (props.formContext.legalName !== "") {
      props.onChange(props.value || props.formContext.legalName)
      setDisplayname(props.value)
    }
  },[count])
  useEffect(() => {
      if (props.formContext.legalName === "") {
        props.onChange(props.value)
        setDisplayname(props.value)
      }
      if(props  && count < 3){
        setCount(count+1)
      }
  },[props])
  return (
    <div>
      <Input
        type="text"
        name={props.label}
        value={displayname}
        maxLength={props.schema.maxLength}
        onChange={e => {
            props.onChange(e.target.value);
            setDisplayname(e.target.value);
        }}
      />
      <p style={{fontSize: "12px"}}>{props.schema.info}</p>
      <div style={{ marginLeft: '90px' }}>
        <CardStatement
          displayName={
            displayname ? displayname.toUpperCase().slice(0, 19) : ''
          }
        />
      </div>
    </div>
  )
}

export const Numberformatmask = props => {
  const [val, setVal] = useState()
  return (
    <div className="dateSelect">
      <NumberFormat
        thousandSeparator={true}
        value={props.value}
        className="form-control"
        onValueChange={values => {
          props.onChange(values.floatValue)
        }}
      />
    </div>
  )
}


export const TermsAndConditionMask = props => {
    return (
      <div>
        <label for="privacy-policy" className="py-checkbox">
          <input
            type="checkbox"
            id="privacy-policy"
            value={props.value}
            required={props.required}
            defaultValue='true'
            onChange={event => {
              props.onChange(event.target.checked)
            }}
            checked={props.value}
          />
          <span className="py-form__element__faux"></span>
          <div  style={{marginLeft:"10px"}} dangerouslySetInnerHTML={{ __html: props.schema.title }} />
        </label>
      </div>
    )
  }

export const AttestationMask = props => {
  return (
    <div>
      <label for="attestation" className="py-checkbox">
        <input
          type="checkbox"
          id="attestation"
          value={props.value}
          required={props.required}
          defaultValue='true'
          onChange={event => {
            props.onChange(event.target.checked)
          }}
          checked={props.value}
        />
        <span className="py-form__element__faux"></span>
        <div  style={{marginLeft:"10px"}} dangerouslySetInnerHTML={{ __html: props.schema.title }} />
      </label>
    </div>
  )
}

export const WebsiteMask = props => {
  const [website, setWebsite] = useState(props.value)
  return (
    <div className='row'>
      <div className='col-lg-12 col-md-12 col-sm-12 col-xs-12' style={{ paddingRight: '0px', }}>
        <InputGroup>
          <InputGroupText style={{margin: '4px 0px 4px 0px'}}>
            https://
          </InputGroupText>
          <Input
            type="text"
            name={props.label}
            value={website}
            onChange={e => {
              props.onChange(e.target.value), setWebsite(e.target.value)
            }}
          />
        </InputGroup>
      </div>
    </div>
  )
}

export const CopyInputMask = props => {
  const [copyValue, setCopyValue] = useState(props.value);

  const copyText = () => {
    const cb = navigator.clipboard;
    cb.writeText(props.value);
    if (!!props?.formContext?.showSnackbar) {
      props.formContext.showSnackbar('Webhook URL copied successfully', false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Input
        type="text"
        name={props.label}
        value={copyValue}
        disabled={true}
        // maxLength={props.schema.maxLength}
        onChange={e => {
          props.onChange(e.target.value);
          setCopyValue(e.target.value);
        }}
      />
      <Button
        className="copy-action"
        color="link"
        style={{
          position: 'absolute',
          right: '-5px',
          width: '50px',
          paddingLeft: '10px',
          paddingRight: '10px',
          boxShadow: 'unset'
        }}
        onClick={copyText}>
        <Icon
          className="Icon"
          xlinkHref={`${symbolsIcon}#copy`}
        />
      </Button>
    </div>
  )
}

export const CollapsibleTermsWidget = props => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const primaryText = props.schema.primaryText || "By continuing, you agree to the";
  const secondaryText = props.schema.secondaryText || "Terms and Conditions";
  
  return (
    <div className="collapsible-terms-widget">
      <label className="py-checkbox">
        <input
          type="checkbox"
          id="terms-checkbox"
          value={props.value}
          required={props.required}
          onChange={event => {
            props.onChange(event.target.checked)
          }}
          checked={props.value}
        />
        <span className="py-form__element__faux"></span>
        <div className="terms-text">
          <span>{primaryText} </span>
          <span 
            className="terms-link"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded)
            }}
          >
            {secondaryText}
          </span>
        </div>
      </label>

      {isExpanded && (
        <div class="terms-conditions">
          <div dangerouslySetInnerHTML={{ __html: props.schema.termsContent }} />
        </div>
      )}
    </div>
  );
};
