import React, { useEffect, useState } from 'react'
import moment from 'moment'
import Icon from './Icon'
import { useDispatch, useSelector } from 'react-redux'
import { getEventTimeLine } from '../../actions/timelineAction'
import { Button, Spinner } from 'reactstrap'
import symbolsIcon from "../../assets/icons/product/symbols.svg";

const EventsTimeLine = ({ entityId, loading, status }) => {

  const [timelineCollapse, setTimelineCollapse] = useState(false)
  const [buttonClicked, setButtonClicked] = useState(false)
  const [isLoading, setLoading] = useState(true)

  const { id, data: timelines, loading: btnLoading } = useSelector(state => state.timelines)
  const dispatch = useDispatch()

  useEffect(() => {
    setTimeout(() => {
      fetchEventTimelines()
    }, 5000);
  }, [loading, status])

  useEffect(() => {
    if (id === entityId) {
      setLoading(false)
    }
  }, [id, entityId])

  const fetchEventTimelines = () => {
    dispatch(getEventTimeLine(entityId))
  }

  const handleRefresh = e => {
    e.stopPropagation()
    fetchEventTimelines()
    setButtonClicked(true)
  }

  const boxToggle = () => {
    setTimelineCollapse(!timelineCollapse)
  }

  return (
    <div className="py-box py-box--large">
      <div className="invoice-steps-card__options">
        <div className="invoice-step-Collapsible__header-content">
          <div className="step-indicate de-activate">
            <div className="step-icon plane-icon">
              <Icon
                className="Icon"
                xlinkHref={`${symbolsIcon}#timeline`}
              />
            </div>
          </div>
          <div className="py-heading--subtitle cursor-pointer" onClick={boxToggle}>Timeline
            <button className="refresh-action" disabled={buttonClicked && btnLoading} onClick={handleRefresh} >{buttonClicked && btnLoading ? <Icon className="Icon fa-spin" xlinkHref={`${symbolsIcon}#refresh`} /> : <Icon className="Icon" xlinkHref={`${symbolsIcon}#refresh`} />}</button>
          </div>
          <div className={`collapse-arrow cursor-pointer ${timelineCollapse && 'collapsed'}`} onClick={boxToggle}>
            <i className="fas fa-chevron-up"></i>
          </div>
        </div>
      </div>
      {timelineCollapse && (
        isLoading ?
          <div className="text-center m-5"><Spinner style={{ width: 50, height: 50 }} /></div> :
          <div className="invoice-steps-card__content mt-3 ms-4 me-2 ps-5">
            <div className="invoice-timeline-info mt-4">
              {timelines && timelines.length > 0 ? timelines.map((timeline) => (
                <div className="timeline-block invoice-timeline-block" key={timeline._id}>
                  <div className="marker"><div className="waves-block"><div className="waves wave-1"></div><div className="waves wave-2"></div><div className="waves wave-3"></div></div></div>
                  <div className="timeline-content">
                    <div className="timeline-title">{timeline.prettyText}</div>
                    <span className="timeline-desc">{moment(timeline.eventTime).format('MMM DD, YYYY, hh:mm A')}</span>
                    {timeline.createdByName &&
                      <div className="timeline-desc">By: {timeline.createdByName}</div>
                    }
                  </div>
                </div>
              )) : <h4 className="text-center">No timeline found.</h4>}
            </div>
          </div>
      )}
    </div>
  )
};

export default EventsTimeLine