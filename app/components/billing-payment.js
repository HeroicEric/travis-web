import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { or } from '@ember/object/computed';
import { generateYearsFromCurrent, generateMonthNumber } from '../utils/generated-dates';

export default Component.extend({
  flashes: service(),
  months: generateMonthNumber(),
  years: generateYearsFromCurrent(11),
  stripe: service(),
  isLoading: or('createStripeToken.isRunning', 'isSavingSubscription'),

  createStripeToken: task(function* () {
    try {
      const data =  yield this.stripe.card.createToken({
        name: this.cardName,
        number: this.cardNumber,
        exp_month: this.expiryDateMonth,
        exp_year: this.expiryDateYear,
        cvc: this.cvc
      });
      const stripeToken = data.id;
      this.handleSubmit(stripeToken, this.cardNumber.slice(-4));
    } catch (error) {
      this.displayError(error);
    }
  }).drop(),

  cardName: 'Patrick',
  cardNumber: '4242424242424242',
  expiryDateMonth: '04',
  cvc: '893',
  expiryDateYear: '2020',

  displayError(error) {
    let message = 'There was an error connecting to stripe. Please try again.';
    const stripeError = error && error.error;
    if (stripeError && stripeError.type === 'card_error') {
      message = 'Invalid card details';
    }
    this.flashes.error(message);
  },

  actions: {

    handleKeyUp(value) {
      let spacedCardNumber = value.replace(/[^\dA-Z]/g, '').replace(/(.{4})/g, '$1 ').trim();
      this.set('cardNumber', spacedCardNumber);
    }

  }
});
