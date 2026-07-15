import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { isEqual } from 'lodash'
import MobileHeader from '../../global/MobileHeader'
import Sidebar from '../../global/Sidebar'
import BannerService from '../../api/bannerService'
import SnakeBar from '../../global/SnakeBar'
import DisplayBanner from '../common/DisplayBanner'
import SettingsSidebar from './components/setting/components/Sidebar'
import * as actionTypes from '../../constants/ActionTypes'
import { fetchAllBannerList } from '../../actions/utilityAction'

const getBannerList = (bannerList) => {
  return bannerList
}

const Layout = (props) => {
  const dispatch = useDispatch();
  const [addClass, setAddClass] = useState(false)
  const [bannerList, setBannerList] = useState([])
  const { BannerList, loading } = props.reducer;
  const bannerData = BannerList?.data?.banner || []
  const bannerIdString = bannerData?.map((value) => value?.uuid)?.join(',');
  const isIdentityVerificationRequired =
    props.reducer?.userData?.user?.identityVerification?.status === "required";

  useEffect(() => {
    if (!isEqual(bannerData, bannerList)) {
      const data = getBannerList(bannerData)
      setBannerList(data)
    }
  }, [bannerIdString])

  const handleDrawerOpen = () => {
    setAddClass(!addClass)
  };

  const handleDrawerClose = () => {
    setAddClass(false)
  };

  const handleRemoveBanner = async (id) => {
    const matchedBanner = props.reducer.BannerList?.data?.banner?.find(
      (banner) => banner.bannerTargetId === id
    );
    const data = {
      status: "dismissed"
    };
    if (matchedBanner && props.reducer.userData) {
      switch (matchedBanner.bannerScope) {
        case "user":
        case "global":
          data.userId = props.reducer.userData.user?._id;
          break;
        case "business":
        case "country":
          data.businessId = props.reducer.userData.user?.primaryBusiness;
          break;
      }
    }

    const response = await BannerService.updateBannerStatus(id, data)
    if (response && response.statusCode === 200) {
      const res = await BannerService.fetchAllBanners()
      if (res && res.statusCode === 200 && res.data) {
        dispatch({ type: actionTypes.GET_ALL_BANNER_LIST_SUCCESS, message: res.message, payload: res.data })
        const updatedBannerList = getBannerList(res.data.banner || [])
        setBannerList(updatedBannerList)
      }
      dispatch(fetchAllBannerList())
    }
  }

  let boxClass = ["main-app-container"];

  if (addClass) {
    boxClass.push("side-nav-collapsed");
  }

  let mainClass = ["bg-6", "main-content"];

  /*if (addClass) {
    mainClass.push("mrL250");
  }*/

  const currentPath = window.location.pathname;
  const currentClass = currentPath.split("/").pop();
  const showMenu = currentPath.includes("public") ? false : true;
  const showSettingsSidebar = currentPath.includes("setting");
  if (showSettingsSidebar) {
    // mainClass.push('has-settings-sidebar')
  }
  const filteredBanners = bannerList.filter((banner) => {
    const title = banner.bannerTitle || "";
    const isIdentityBanner = /identity|verification/i.test(title);
    if (isIdentityBanner) {
      return isIdentityVerificationRequired;
    }
    return true;
  });

  return (
    <div className={boxClass.join(" ")}>
      {/* <Header  handleDrawerOpen={this.handleDrawerOpen} /> */}
      <div className={`app-content-wrapper main-body ${currentClass}-page-wrapper`}>
        {showMenu ? <Sidebar {...props} /> : null}
        <main className={mainClass.join(" ")}>
          <MobileHeader
            handleDrawerClose={handleDrawerClose}
            handleDrawerOpen={handleDrawerOpen}
            isOpen={addClass}
          />
          <SnakeBar />
          <div
            className={
              showSettingsSidebar
                ? `py-frame__page py-frame__settings has-sidebar`
                : "py-frame__page"
            }
          >
            {showSettingsSidebar ? <SettingsSidebar location={props.children} /> : null}
            <div className={`py-page__content`}>
              {!loading && filteredBanners?.map(banner =>
                <DisplayBanner
                  key={banner.uuid}
                  isSticky={banner.isSticky}
                  data={banner}
                  handleRemoveBanner={handleRemoveBanner}
                />
              )}
              {props.children}
            </div>
          </div>
        </main>
      </div>
      {/* <Customizer /> */}
    </div>
  );
}


export default Layout;
