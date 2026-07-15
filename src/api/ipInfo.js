import axios from 'axios'

export const getLocationIP = async () => {
  return axios.get('https://ipapi.co/json/').then((response) => {
        let data = response.data;
        return data;
    }).catch((error) => {
    });
}