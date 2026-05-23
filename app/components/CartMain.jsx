import {useState} from 'react';
import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';

const FREE_SHIP_THRESHOLD = 60;

function getLineItemChildrenMap(lines) {
  const children = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const ch = getLineItemChildrenMap(line.lineComponents);
      for (const [pid, cids] of Object.entries(ch)) {
        if (!children[pid]) children[pid] = [];
        children[pid].push(...cids);
      }
    }
  }
  return children;
}

function ShippingBar({subtotal}) {
  const amount = parseFloat(subtotal || '0');
  const remaining = Math.max(0, FREE_SHIP_THRESHOLD - amount);
  const pct = Math.min(100, (amount / FREE_SHIP_THRESHOLD) * 100);
  const unlocked = remaining === 0;

  return (
    <div className={`lx-ship-bar${unlocked ? ' lx-ship-bar--done' : ''}`}>
      <p className="lx-ship-msg">
        {unlocked ? (
          <><span>✨</span> You unlocked <strong>FREE Shipping!</strong></>
        ) : (
          <><span>🎁</span> You&rsquo;re <strong>${remaining.toFixed(2)}</strong> away from FREE Shipping</>
        )}
      </p>
      <div className="lx-ship-track">
        <div
          className={`lx-ship-fill${unlocked ? ' lx-ship-fill--done' : ''}`}
          style={{width: `${pct}%`}}
        />
      </div>
    </div>
  );
}

function LxToggle({on}) {
  return (
    <div className={`lx-toggle${on ? ' lx-toggle--on' : ''}`}>
      <div className="lx-toggle-knob" />
    </div>
  );
}

function UpsellCards({guarantee, onToggleGuarantee, shippingProtection, onToggleShipping}) {
  return (
    <div className="lx-upsells">
      <div
        className={`lx-upsell${guarantee ? ' lx-upsell--on' : ''}`}
        onClick={onToggleGuarantee}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggleGuarantee()}
      >
        <div className="lx-upsell-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        </div>
        <div className="lx-upsell-body">
          <p className="lx-upsell-title">30-Day Money Back Guarantee</p>
          <p className="lx-upsell-desc">Free replacement or refund if anything goes wrong.</p>
        </div>
        <div className="lx-upsell-right">
          <span className="lx-upsell-price lx-upsell-price--free">FREE</span>
          <LxToggle on={guarantee} />
        </div>
      </div>

      <div
        className={`lx-upsell${shippingProtection ? ' lx-upsell--on' : ''}`}
        onClick={onToggleShipping}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onToggleShipping()}
      >
        <div className="lx-upsell-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="2"/>
            <path d="M16 8h5l2 5v3h-7V8z"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
        </div>
        <div className="lx-upsell-body">
          <p className="lx-upsell-title">Shipping Protection</p>
          <p className="lx-upsell-desc">Protect your order against damage, loss, or theft.</p>
        </div>
        <div className="lx-upsell-right">
          <span className="lx-upsell-price">$0.99</span>
          <LxToggle on={shippingProtection} />
        </div>
      </div>
    </div>
  );
}

export function CartMain({layout, cart: originalCart}) {
  const cart = useOptimisticCart(originalCart);
  const [guarantee, setGuarantee] = useState(true);
  const [shippingProtection, setShippingProtection] = useState(false);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart && Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(cart?.lines?.nodes ?? []);
  const subtotal = cart?.cost?.subtotalAmount?.amount || '0';

  if (layout === 'aside') {
    return (
      <div className="lx-cart">
        {!linesCount ? (
          <LxCartEmpty />
        ) : (
          <>
            <div className="lx-cart-scroll">
              <ShippingBar subtotal={subtotal} />
              <ul className="lx-cart-lines">
                {(cart?.lines?.nodes ?? []).map((line) => {
                  if ('parentRelationship' in line && line.parentRelationship?.parent) return null;
                  return (
                    <CartLineItem
                      key={line.id}
                      line={line}
                      layout={layout}
                      childrenMap={childrenMap}
                    />
                  );
                })}
              </ul>
              <UpsellCards
                guarantee={guarantee}
                onToggleGuarantee={() => setGuarantee((g) => !g)}
                shippingProtection={shippingProtection}
                onToggleShipping={() => setShippingProtection((s) => !s)}
              />
            </div>
            {cartHasItems && (
              <CartSummary
                cart={cart}
                layout={layout}
                shippingProtection={shippingProtection}
              />
            )}
          </>
        )}
      </div>
    );
  }

  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <div className="cart-details">
        <p id="cart-lines" className="sr-only">Line items</p>
        <div>
          <ul aria-labelledby="cart-lines">
            {(cart?.lines?.nodes ?? []).map((line) => {
              if ('parentRelationship' in line && line.parentRelationship?.parent) return null;
              return (
                <CartLineItem
                  key={line.id}
                  line={line}
                  layout={layout}
                  childrenMap={childrenMap}
                />
              );
            })}
          </ul>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </div>
  );
}

function LxCartEmpty() {
  const {close} = useAside();
  return (
    <div className="lx-cart-empty">
      <div className="lx-empty-icon">
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#C4B5FD" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </div>
      <p className="lx-empty-title">Your cart is empty</p>
      <p className="lx-empty-sub">Add something beautiful to get started.</p>
      <Link to="/collections" onClick={close} className="lx-empty-btn">
        Explore Collection
      </Link>
    </div>
  );
}

function CartEmpty({hidden = false}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you started!</p>
      <br />
      <Link to="/collections" onClick={close} prefetch="viewport">
        Continue shopping →
      </Link>
    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */
/** @typedef {{[parentId: string]: CartLine[]}} LineItemChildrenMap */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartLineItem').CartLine} CartLine */
