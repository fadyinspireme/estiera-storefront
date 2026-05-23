import {CartForm, Money} from '@shopify/hydrogen';
import {useEffect, useRef} from 'react';
import {useFetcher} from 'react-router';

const PAYMENT_ICONS = [
  'VISA', 'Mastercard', 'Amex', 'Maestro',
  'Apple Pay', 'G Pay', 'PayPal', 'Shop Pay',
  'Klarna', 'Afterpay',
];

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout, shippingProtection = false}) {
  if (layout !== 'aside') {
    return (
      <div aria-labelledby="cart-summary" className="cart-summary-page">
        <h4>Totals</h4>
        <dl className="cart-subtotal">
          <dt>Subtotal</dt>
          <dd>
            {cart?.cost?.subtotalAmount?.amount ? (
              <Money data={cart.cost.subtotalAmount} />
            ) : '-'}
          </dd>
        </dl>
        <CartDiscounts discountCodes={cart?.discountCodes} />
        <CartGiftCard giftCardCodes={cart?.appliedGiftCards} />
        <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} />
      </div>
    );
  }

  const subtotalNum = parseFloat(cart?.cost?.subtotalAmount?.amount || '0');
  const total = subtotalNum + (shippingProtection ? 0.99 : 0);
  const currency = cart?.cost?.subtotalAmount?.currencyCode || 'USD';
  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(total);

  return (
    <div className="lx-summary">
      <div className="lx-summary-rows">
        <div className="lx-summary-row">
          <span>Subtotal</span>
          {cart?.cost?.subtotalAmount && <Money data={cart.cost.subtotalAmount} />}
        </div>
        <div className="lx-summary-row">
          <span>Shipping</span>
          <span className="lx-summary-free">FREE</span>
        </div>
        {shippingProtection && (
          <div className="lx-summary-row">
            <span>Shipping Protection</span>
            <span>$0.99</span>
          </div>
        )}
        <div className="lx-summary-divider" />
        <div className="lx-summary-row lx-summary-row--total">
          <span>Total</span>
          <span className="lx-summary-total-val">{formattedTotal}</span>
        </div>
      </div>

      <a href={cart?.checkoutUrl} className="lx-checkout-btn" target="_self">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Continue Securely
      </a>

      <div className="lx-ssl">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Secure SSL encrypted checkout
      </div>

      <div className="lx-pay-icons">
        {PAYMENT_ICONS.map((name) => (
          <span key={name} className="lx-pay-icon">{name}</span>
        ))}
      </div>
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string}}
 */
function CartCheckoutActions({checkoutUrl}) {
  if (!checkoutUrl) return null;
  return (
    <div>
      <a href={checkoutUrl} target="_self">
        <p>Continue to Checkout &rarr;</p>
      </a>
      <br />
    </div>
  );
}

/**
 * @param {{discountCodes?: CartApiQueryFragment['discountCodes']}}
 */
function CartDiscounts({discountCodes}) {
  const codes =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div>
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button type="submit" aria-label="Remove discount">Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>
      <UpdateDiscountForm discountCodes={codes}>
        <div>
          <label htmlFor="discount-code-input" className="sr-only">Discount code</label>
          <input
            id="discount-code-input"
            type="text"
            name="discountCode"
            placeholder="Discount code"
          />
          &nbsp;
          <button type="submit" aria-label="Apply discount code">Apply</button>
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}

function CartGiftCard({giftCardCodes}) {
  const giftCardCodeInput = useRef(null);
  const giftCardAddFetcher = useFetcher({key: 'gift-card-add'});

  useEffect(() => {
    if (giftCardAddFetcher.data) {
      giftCardCodeInput.current.value = '';
    }
  }, [giftCardAddFetcher.data]);

  return (
    <div>
      {giftCardCodes && giftCardCodes.length > 0 && (
        <dl>
          <dt>Applied Gift Card(s)</dt>
          {giftCardCodes.map((giftCard) => (
            <RemoveGiftCardForm key={giftCard.id} giftCardId={giftCard.id}>
              <div className="cart-discount">
                <code>***{giftCard.lastCharacters}</code>
                &nbsp;
                <Money data={giftCard.amountUsed} />
                &nbsp;
                <button type="submit">Remove</button>
              </div>
            </RemoveGiftCardForm>
          ))}
        </dl>
      )}
      <AddGiftCardForm fetcherKey="gift-card-add">
        <div>
          <input
            type="text"
            name="giftCardCode"
            placeholder="Gift card code"
            ref={giftCardCodeInput}
          />
          &nbsp;
          <button type="submit" disabled={giftCardAddFetcher.state !== 'idle'}>Apply</button>
        </div>
      </AddGiftCardForm>
    </div>
  );
}

function AddGiftCardForm({fetcherKey, children}) {
  return (
    <CartForm fetcherKey={fetcherKey} route="/cart" action={CartForm.ACTIONS.GiftCardCodesAdd}>
      {children}
    </CartForm>
  );
}

function RemoveGiftCardForm({giftCardId, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.GiftCardCodesRemove}
      inputs={{giftCardCodes: [giftCardId]}}
    >
      {children}
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 *   shippingProtection?: boolean;
 * }} CartSummaryProps
 */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
