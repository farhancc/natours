// import axios from 'axios';
// import { loadStripe } from '@stripe/stripe-js';

// const stripe = loadStripe(
//   'pk_test_51PoiucDQ4X6R2VLm2zZd5AkhuM1fUIXvfXlIjttMOA4OsNLWDvmSvI8aZ63wZkShrCqCIcl2OHi9a1CISDZEZfv700vnOezid5'
// );
// export const bookTour = async (tourId) => {
//   // 1) Get checkout session from api
//   const session = await axios(
//     `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
//   );
//   console.log(session);
//   // 2) create checkout form + charge credit card
// };
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './alert';
// // Load Stripe outside the function to prevent it from reloading each time the function is called
let stripePromise;

const getStripe = async () => {
  if (!stripePromise) {
    stripePromise = await loadStripe(
      'pk_test_51PoiucDQ4X6R2VLm2zZd5AkhuM1fUIXvfXlIjttMOA4OsNLWDvmSvI8aZ63wZkShrCqCIcl2OHi9a1CISDZEZfv700vnOezid5'
    );
  }
  return stripePromise;
};
// const stripe = Stripe(
//   'pk_test_51PoiucDQ4X6R2VLm2zZd5AkhuM1fUIXvfXlIjttMOA4OsNLWDvmSvI8aZ63wZkShrCqCIcl2OHi9a1CISDZEZfv700vnOezid5'
// );

export const bookTour = async (tourId) => {
  try {
    console.log('Fetching checkout session...');
    const session = await axios(
      `http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log('Checkout session:', session.data);
    console.log('Initializing Stripe...');

    const stripe = await getStripe();
    // console.log('sessionId:', session.data.session.id);

    const { error } = await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });

    if (error) {
      console.error('Stripe redirect error:', error);
      showAlert('error', error.message);
    }
    // await stripe.redirect({
    //   sessionId: session.data.session.id,
    // });
    // console.log(
    //   await stripe.redirectToCheckout({
    //     sessionId: session.data.session.id,
    //   }),
    //   'sessionId'
    // );
    console.log('Redirecting to checkout...');
  } catch (error) {
    console.error('Error booking the tour:', error);
    showAlert('error', error.message);
  }
};
