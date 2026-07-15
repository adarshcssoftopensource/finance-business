import React from 'react'
import moment from 'moment'
import styles from './style.module.scss'

const Index = ({ histories }) => {
  /* eslint-disable */
  return (
    <div className="invoice-steps-card__content mt-3 ml-4 mr-2 pl-5">
      <div className="invoice-timeline-info mt-4">
        {histories && histories.length > 0 ? (
          histories.map(history => (
            <div
              className={`timeline-block ${styles.invoiceTimelineBlock}`}
              key={history?.createdAt}
            >
              <div className={`${styles.marker}`}>
                <div className={`${styles.wavesBlock}`}>
                  <div className={`${styles.waves} ${styles.wave1}`} />
                  <div className={`${styles.waves} ${styles.wave2}`} />
                  <div className={`${styles.waves} ${styles.wave3}`} />
                </div>
              </div>
              <div className={`${styles.timelineContent}`}>
                <div className={`${styles.timelineTitle}`}>Status changed to {history?.status}</div>
                {history?.reason?.reason_message ? (
                  <div className={`${styles.timelineTitle}`}>
                    {history?.reason?.reason_message || ''}
                  </div>
                ) : null}
                <span className={`${styles.timelineDesc}`}>
                  {moment(history?.createdAt).format('MMM DD, YYYY, hh:mm A')}
                </span>
                <div className={`${styles.timelineDesc}`}>
                  Provider Status: {history?.providerStatus}
                </div>
              </div>
            </div>
          ))
        ) : (
          <h4 className="text-center">No timeline found.</h4>
        )}
      </div>
    </div>
  )
}

export default Index
