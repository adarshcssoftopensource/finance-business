import { get as _get } from 'lodash';
import { openGlobalSnackbar } from "../actions/snackBarAction";
import { fetchUsersEmails } from "../api/EstimateServices";
import { saveBankAutoTransferSetting } from "../api/SettingService";

export const checkVerifiedEmail =async (isVerified) => {
  let emails=[];
  const response = await fetchUsersEmails(localStorage.getItem('user.id'))
  const filterResponse = _get(response, "data.emails", []);
  emails = filterResponse.filter(item => item.status.toLowerCase() === 'verified');
  if(emails.length <= 0){
    if(isVerified){
      isVerified(false)
    }
    await saveBankAutoTransferSetting({transferMode: "manual"})
        .then(async response => {
          if (response.statusCode === 200) {
            openGlobalSnackbar(response.message);
          } else {
            openGlobalSnackbar(response.message, true);
          }
        })
        .catch(error => {
          openGlobalSnackbar(error.message, true)
        })
      openGlobalSnackbar('To enable payouts, verify your email', true)
  }
  else if(isVerified){
    isVerified(true)
  }
}