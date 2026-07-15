import React, { useState, useEffect } from 'react';
import PaymentServices from '../../../../../../../../api/paymentService'
import CenterSpinner from '../../../../../../../../global/CenterSpinner';
//Import child component
import AddOwnerForm from './addOwnerForm';
import OwnerListing from './ownerListing';

const Index = (props) => {
    const [formData, setFormData] = useState({});
    const [listView, setListView] = useState(false);
    const [saveIndex, setSaveIndex] = useState('owner');
    const [ownerData, setOwnerData] = useState({});
    const [addOwnerData, setAddOwnerData] = useState([]);
    const [isIndividual, setIsIndividual] = useState(false);
    const [isRolesShow, setIsRolesShow] = useState(true);
    const [isNonProfit, setIsNonProfit] = useState(false);
    const [haveRepresentative, setHaveRepresentative] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);


    const initData=(data)=>{
        if (data.businessType === 'individual') {
        setIsRolesShow(false)
        setIsIndividual(true);
        setFormData(data.owner);
    } else if (data.owner.firstName) {
        setListView(true);
        setOwnerData(data.owner);
        if (data.additionalOwners) {
            setAddOwnerData(data.additionalOwners);
        }
    }
    if (data.businessType === 'non_profit') {
        setIsNonProfit(true)
    }
    }
    useEffect(() => {
        initData(props.data)
    }, []);

    useEffect(() => {
        checkIfRepresentativeAdded()
    }, [ownerData])

    useEffect(() => {
        checkIfRepresentativeAdded()
    }, [addOwnerData])

    const handleOwnerTypeData = (idx, edit) => {
        if (idx === 'owner') {
            setFormData(ownerData);
            setSaveIndex('owner');
        } else {
            setFormData(addOwnerData[idx]);
            setSaveIndex(idx);
        }
        setIsEdit(edit ? edit : false)
        setListView(false);
    }

    const checkIfRepresentativeAdded = () => {
        let rolesOfOwner = ownerData.roles || [];
        addOwnerData.map((dt) => {
            rolesOfOwner = [...rolesOfOwner, ...dt.roles]
        })
        setHaveRepresentative(rolesOfOwner.includes('representative'))
    }

    const handleSaveData = async(data) => {
        if (isIndividual) {
            let dataObj = {
                step: 3,
                owner: data
            }
            props.onSubmit(dataObj);
        } else {
               await props.fetchOnBoarding();
            initData(data)
            setIsEdit(false)
            setListView(true);
            setSaveIndex(null)
        }

    }

    const handleDelete = (idx) => {
        setLoading(true)
        PaymentServices.deletePerson(addOwnerData[idx].stripePersonId)
            .then((res) => {
                props.fetchOnBoarding();
                setLoading(false)
                let newArr = [...addOwnerData];
                newArr.splice(idx, 1);
                setAddOwnerData(newArr);
            })
            .catch((error) => {
                props.onShowSnackbar(error.message)
            })

    }

    const onCancel = () => {
        setListView(true);
    }

    const onSubmit = () => {
        let totalOwnership = parseInt(ownerData.ownership);
        let rolesOfOwner = ownerData.roles;
        addOwnerData.map((dt) => {
            if (dt._id) {
                delete dt._idownerData
            }
            rolesOfOwner = [...rolesOfOwner, ...dt.roles]
            totalOwnership = dt.ownership ? totalOwnership + parseInt(dt.ownership) : totalOwnership;
        })
        const duplicateRoles = rolesOfOwner.filter((e, i, a) => a.indexOf(e) !== i);
        // let data = {
        //     step: 3,
        //     owner: ownerData,
        //     additionalOwners: addOwnerData
        // }
        if (totalOwnership > 100) {
            props.onShowSnackbar('total ownership percentage cannot be more than 100%')
        } else if (duplicateRoles.includes('representative')) {
            props.onShowSnackbar('representative could be only one')
        } else if (!rolesOfOwner.includes('representative')) {
            props.onShowSnackbar('at-least one owner should be representative')
        } else if (props.data.country == 'GB' && !isNonProfit && !rolesOfOwner.includes('director')) {
            props.onShowSnackbar('at-least one owner should be director in UK')
        } else {
            props.onSubmit("step3");
        }
    }

    return (
        <div className="onboarding__business__details">
            {loading ? <CenterSpinner />
            :
             listView && !isIndividual ?
                <OwnerListing {...props}
                    ownerData={ownerData}
                    addOwnerData={addOwnerData}
                    handleOwnerTypeData={handleOwnerTypeData}
                    onSubmit={onSubmit}
                    onDelete={handleDelete}
                    isIndividual={isIndividual}
                    isNonProfit={isNonProfit}
                    key={props.formData}
                />
                : <AddOwnerForm {...props}
                    formData={formData}
                    onSave={handleSaveData}
                    onCancel={onCancel}
                    isIndividual={isIndividual}
                    isRolesShow={isRolesShow}
                    ownerType={saveIndex}
                    isNonProfit={isNonProfit}
                    isEdit={isEdit}
                    haveRepresentative={haveRepresentative}
                />
                }
        </div>
    );
}

export default Index;