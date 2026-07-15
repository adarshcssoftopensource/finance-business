import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { removeCard } from '../../api/utilityServices';
import CenterSpinner from '../../global/CenterSpinner';
import { Helmet } from 'react-helmet'
import { NavLink } from 'react-router-dom';
import { get as _get } from "lodash";
import { _documentTitle, getLogoURL } from '../../utils/GlobalFunctions';
import SnakeBar from "../../global/SnakeBar";
import  removeCardImage from "../../assets/images/remove-card.png";

const RemoveCard = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const id = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(async () => {
    if (id) {
      setLoading(true)
      try {
        const response = await removeCard({
          actionType: 'card.remove',
          id
        });
        if (response) {
          setLoading(false)
        }
      } catch (error) {
        setError(error?.data?.message)
        setLoading(false)
      }
    }
  }, [id]);

  if (loading) {
    return <CenterSpinner />
  }

  if (error) {
    return (
      <div className="text-center">
        <h2>Something went wrong.</h2>
      </div>
    )
  }

  return (
    <main>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Helmet>
      <SnakeBar />
      <div className="container-fluid error404Wrapper">
        <div className="py-content__primary">
          <div className="py-content py-content--centered">
            <div className="error-logo"><NavLink to="/" >
              <img className="logo-action" 
              src={getLogoURL()}
              alt="Peymynt" /></NavLink></div>
            <div className="py-content__primary">
              <div className="remove-card-image">
                <img src={removeCardImage} alt="Remove Card" />
              </div>
            </div>
          </div>
          <div className="py-header--page--centered">
            <div className="py-header__title mb-5 row">
              <div className="col-md-7 offset-md-3">
                <div className="py-heading--title error-title mb-3">Your card has been removed.<br/>No further action required.</div>
                <div className="py-heading--description mb-4"><strong>Do you run your own business?</strong> Sign up with Peymynt, create customizable invoices, securely collect payments, and manage your business expenses like a professional. It's easy and free to get started, and you'll be entered for a chance to win up to $10,000 for your business.</div>
                <Link to='/signup' target='_blank'>
                  <button className='btn btn-primary'>Sign Up with Peymynt</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default RemoveCard;