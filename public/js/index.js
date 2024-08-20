import '@babel/polyfill';
import { bookTour } from './stripe';
import { login } from './login';
import { displayMap } from './mapbox';
import { logging_out } from './login';
import { updateSettings } from './updateSettings';

// dom elements
document.addEventListener('DOMContentLoaded', function () {
  const mapbox = document.getElementById('map');
  const loginForm = document.querySelector('.form--login');
  const logoutbtn = document.querySelector('.nav__el--logout');
  const userDataForm = document.querySelector('.form-user-data');
  const PasswordSettings = document.querySelector('.form-user-password');
  const save_password_btn = document.querySelector('.btn--save_password');
  const bookbtn = document.getElementById('book-tour');
  // values

  // delegation
  if (mapbox) {
    // const locations =
    displayMap(JSON.parse(mapbox.dataset.locations));
  }
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      login(email, password);
    });
  }
  if (logoutbtn) {
    logoutbtn.addEventListener('click', logging_out);
  }
  if (PasswordSettings) {
    PasswordSettings.addEventListener('submit', async (e) => {
      e.preventDefault();
      save_password_btn.textContent = 'updating...';
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      if ((passwordCurrent, password, passwordConfirm))
        await updateSettings(
          { passwordCurrent, password, passwordConfirm },
          'password'
        );
      save_password_btn.textContent = 'Save password';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  }
  if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('emails', document.getElementById('emails').value);
      form.append('photo', document.getElementById('photo').files[0]);
      console.log(form);
      updateSettings(form, 'data');
    });
  }
  if (bookbtn) {
    bookbtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.target.textContent = 'processing....';
      const { tourId } = e.target.dataset;
      console.log('', tourId);
      bookTour(tourId);
    });
  }
});
