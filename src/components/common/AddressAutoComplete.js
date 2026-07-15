import React, { Component } from 'react'
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
} from 'react-places-autocomplete';
import { Input } from 'reactstrap';
import { logger } from '../../utils/GlobalFunctions';

export default class AddressAutoComplete extends Component {

    state = {
        addressObj: {}
    }

    componentDidMount() {
        if (!!this.props.value) {
            const { value } = this.props;
            this.setState({
                addressObj: {
                    ...this.state.addressObj,
                    addressLine1: value.addressLine1 ? value.addressLine1 : null,
                    addressLine2: value.addressLine2 ? value.addressLine2 : null,
                    oneLine: value.addressLine2 ? value.addressLine2 : null,
                    country: value.country && value.country.sortname ? value.country.sortname : null,
                    city: value.city ? value.city : null,
                    postalCode: value.postal ? value.postal : null,
                    state: value.state ? value.state : null
                }
            })
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            if (!!this.props.value) {
                const { value } = this.props;
                this.setState({
                    addressObj: {
                        ...this.state.addressObj,
                        addressLine1: value.addressLine1 ? value.addressLine1 : '',
                        addressLine2: value.addressLine2 ? value.addressLine2 : '',
                        oneLine: value.addressLine2 ? value.addressLine2 : '',
                        country: value.country && value.country.sortname ? value.country.sortname : '',
                        city: value.city ? value.city : '',
                        postalCode: value.postal ? value.postal : '',
                        state: value.state && value.country.name ? value.state.name : ''
                    }
                })
            }
        }
    }

    handleChange = address => {
        this.setState({ addressObj: { ...this.state.addressObj, addressLine1: address } });
    };

    handleSelect = address => {
        this.handleChange(address);
        let addrObj = {};
        geocodeByAddress(address)
            .then(results => {
                if (!!results[0]) {
                    if (!!results[0].address_components && results[0].address_components.length > 0) {
                        results[0].address_components.map(add => {
                            if (add.types.includes('locality')) {
                                addrObj.city = add.long_name
                            } else if (add.types.includes('country')) {
                                addrObj.country = add.short_name
                            } else if (add.types.includes('postal_code')) {
                                addrObj.postalCode = add.long_name
                            } else if (add.types.includes("administrative_area_level_1")) {
                                addrObj.state = add.long_name
                            } else if (add.types.includes('street_number')) {
                                addrObj.addressLine1 = `${add.long_name} ${!!addrObj.addressLine1 ? addrObj.addressLine1 : ""}`
                            } else if (add.types.includes('route')) {
                                addrObj.addressLine1 = `${!!addrObj.addressLine1 ? addrObj.addressLine1 : ""}${add.long_name}`
                            }
                        })
                        this.setState({
                            address: addrObj.addressLine1
                        })
                    }
                }
                return getLatLng(results[0])
            })
            .then(geo => {
                if (!!geo) {
                    addrObj.lat = geo.lat;
                    addrObj.long = geo.lng;
                    addrObj.addressLine1 = this.state.address
                }
                if (!addrObj.addressLine1) {
                    addrObj.addressLine1 = this.state.addressObj.addressLine1
                }
                this.setState({ addressObj: addrObj })
                this.props.handleSet(addrObj)
            })
            .catch(error => {
                logger.error("Autocomplete error", error)
            });
    };
    render() {
        let searchOptions = {};
        if (this.props.restrictCountry) {
            searchOptions = {
                componentRestrictions: { country: [this.props.restrictCountry] }
            }
        }
        const { placeholder, isFull, isClass, disabled } = this.props;
        return (
            <div className={`${isFull ? 'w-100' : ''}`}>
                <PlacesAutocomplete
                    value={this.state.addressObj.addressLine1}
                    onChange={this.handleChange}
                    onSelect={this.handleSelect}
                    searchOptions={searchOptions}
                >
                    {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => {
                        return (
                            <div className="relative" >
                                <Input
                                    {...getInputProps({
                                        type: "text",
                                        className: `${isClass ? isClass : 'py-form__element__medium '}`,
                                        name: "addressLine1",
                                        id: "addressLine1",
                                        disabled: disabled ? disabled : false,
                                        placeholder: placeholder ? placeholder : '',
                                        autoComplete: 'addressLine1',
                                        onBlur: () => this.props.handleSet(this.state.addressObj)
                                        // type: 'hidden'
                                    })}
                                />
                                <div className="autocomplete-dropdown-container">
                                    {loading && <div className="suggestion-item" >Loading...</div>}
                                    {suggestions.map(suggestion => {
                                        const className = suggestion.active
                                            ? 'suggestion-item active'
                                            : 'suggestion-item';
                                        // inline style for demonstration purpose
                                        const style = suggestion.active
                                            ? { backgroundColor: '#E8F1F3', cursor: 'pointer' }
                                            : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                        return (
                                            <div
                                                {...getSuggestionItemProps(suggestion, {
                                                    className,
                                                    style,
                                                })}
                                            >
                                                <span>{suggestion.description}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    }}
                </PlacesAutocomplete>
            </div>
        )
    }
}
