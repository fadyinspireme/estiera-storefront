import {useLoaderData} from 'react-router';
import {useState} from 'react';
import vibeVideo1 from '~/assets/17e0c80ecc57c5e1a9e89a24b4ec6f9b.mp4';
import vibeVideo2 from '~/assets/1cf64b4164ca5b88e8ab2d9ee52f3573.mp4';
import vibeVideo3 from '~/assets/c32d79e0f514ea354faf22eba3f7a849_720w.mp4';
import rev1 from '~/assets/A45430c6c6f274be999d8972e139dbeedy.jpg_960x960q75.jpg_.avif';
import rev2 from '~/assets/A2007cc2bd40b42a3a537a4e09709c21aM.jpg_960x960q75.jpg_.avif';
import rev3 from '~/assets/A7213df92cb8a41ff9c24abd11c1c48c19.jpg_960x960q75.jpg_.avif';
import rev4 from '~/assets/A0639b5e9961f45f29377128d7a11b765A.jpg_960x960q75.jpg_.avif';
import rev5 from '~/assets/A7a5659d5b86842d9ae186efa3ddd8edbL.jpg_960x960q75.jpg_.avif';
import rev6 from '~/assets/Aa9a06ff4f03a4a22af30870a084d56daX.jpg_960x960q75.jpg_.avif';
import rev7 from '~/assets/Ab01fd8074a834921aedc493d0b7e53cbV.jpg_960x960q75.jpg_.avif';
import rev8 from '~/assets/A3bfaabac835a49b8bbb6ae8b37012f6cW.jpg_960x960q75.jpg_.avif';
import rev9 from '~/assets/A6ba5f1d98eeb46ddb735e8b4d1628113O.jpg_960x960q75.jpg_.avif';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta = ({data}) => {
  return [
    {title: `Estiera | ${data?.product.title ?? ''}`},
    {rel: 'canonical', href: `/products/${data?.product.handle}`},
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');
  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product};
}

function loadDeferredData() {
  return {};
}

const BUNDLES = [
  {qty: 1, label: '1 Lamp', sublabel: '', price: 39.99, compareAt: 49.99, popular: false},
  {qty: 2, label: '2 Lamps', sublabel: 'You save 15%', price: 67.99, compareAt: 79.98, popular: true},
];

function BundleSelector({selected, onSelect, image}) {
  return (
    <div className="tr-bundles">
      {BUNDLES.map((b) => (
        <button
          key={b.qty}
          type="button"
          className={`tr-bundle-card${selected === b.qty ? ' tr-bundle-card--active' : ''}`}
          onClick={() => onSelect(b.qty)}
        >
          {b.popular && <div className="tr-bundle-badge">Most Popular</div>}
          <div className="tr-bundle-imgs">
            {Array(b.qty).fill(null).map((_, i) => (
              image ? <img key={i} src={image} alt="lamp" className="tr-bundle-img" /> : <span key={i} className="tr-bundle-emoji">💡</span>
            ))}
          </div>
          <div className="tr-bundle-qty">{b.label}</div>
          <div className="tr-bundle-sublabel">{b.sublabel}</div>
          <div className="tr-bundle-price">${b.price.toFixed(2)}</div>
          {b.compareAt && <div className="tr-bundle-compare">${b.compareAt.toFixed(2)}</div>}
        </button>
      ))}
    </div>
  );
}

export default function Product() {
  const {product} = useLoaderData();
  const {open} = useAside();
  const [activeThumb, setActiveThumb] = useState(0);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(2);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  const accordionItems = [
    {
      label: 'Description',
      content: <div>
          <p>Transform your space with the ESTIERA Aura Lamp — a premium ambient light designed to bring elegance, warmth, and atmosphere to any room. Inspired by the calm beauty of the ocean, its minimalist floating design creates a soft glow that instantly upgrades your setup and makes every space feel more refined.</p>
          <br/>
          <p>With 16 immersive RGB colors and an easy-to-use remote control, you can customize the perfect mood for relaxing nights, late gaming sessions, or modern room decor.</p>
          <br/>
          <ul className="desc-features">
            {['16 customizable RGB colors','Soft calming ambient glow','Elegant minimalist design','Remote control included','Perfect for bedrooms, desks & modern interiors'].map((f, i) => (
              <li key={i} className="desc-feature-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {f}
              </li>
            ))}
          </ul>
        </div>,
    },
    {
      label: 'What is included',
      content: <p>1x RGB Jellyfish Lamp, 1x Wireless Remote Control, 1x USB Power Cable, 1x User Guide.</p>,
    },
    {
      label: 'Shipping & Returns',
      content: <p>Orders are processed within 1–2 business days and delivered within 5–8 business days. Free worldwide shipping on orders over $60. 30-day hassle-free returns.</p>,
    },
  ];

  return (
    <div className="tr-page">

      {/* ── MAIN PRODUCT SECTION ── */}
      <section className="tr-product">
        <div className="tr-product-inner">

          {/* LEFT — Gallery */}
          <div className="tr-gallery">
            <div className="tr-gallery-main">
              <ProductImage image={selectedVariant?.image} />
            </div>
            <div className="tr-gallery-thumbs">
              {[0, 1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className={`tr-thumb${activeThumb === i ? ' tr-thumb--active' : ''}`}
                  onClick={() => setActiveThumb(i)}
                >
                  <ProductImage image={selectedVariant?.image} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Info */}
          <div className="tr-info">

            {/* Rating */}
            <div className="tr-rating">
              <span className="tr-stars">★★★★★</span>
              <span className="tr-rating-count">Rated 4.9 (238)</span>
              <span className="tr-rating-badge">Happy Customers</span>
            </div>

            {/* Title */}
            <h1 className="tr-title">{title}</h1>

            {/* Feature badges */}
            <div className="tr-badges">
              <div className="tr-badge">
                <span className="tr-badge-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                </span>
                <span>16 RGB Colors</span>
              </div>
              <div className="tr-badge">
                <span className="tr-badge-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="20" rx="3"/><circle cx="12" cy="17" r="1"/><path d="M9 7h6M9 11h6"/></svg>
                </span>
                <span>Remote Control</span>
              </div>
              <div className="tr-badge">
                <span className="tr-badge-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"/><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
                <span>Calming Glow</span>
              </div>
              <div className="tr-badge">
                <span className="tr-badge-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                </span>
                <span>Aesthetic Decor</span>
              </div>
            </div>

            {/* Bundle selector + add to cart */}
            <div className="tr-form">
              <BundleSelector
                selected={selectedBundle}
                onSelect={setSelectedBundle}
                image={selectedVariant?.image?.url}
              />
              <AddToCartButton
                disabled={!selectedVariant || !selectedVariant.availableForSale}
                onClick={() => open('cart')}
                lines={selectedVariant ? [{merchandiseId: selectedVariant.id, quantity: selectedBundle, selectedVariant}] : []}
              >
                <span className="atc-btn-inner">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {selectedVariant?.availableForSale ? 'ADD TO CART' : 'SOLD OUT'}
                </span>
              </AddToCartButton>
            </div>

            {/* Trust row */}
            <div className="tr-trust">
              <div className="tr-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                <span>Carefully Packed</span>
              </div>
              <div className="tr-trust-sep" />
              <div className="tr-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                <span>30-Day Returns</span>
              </div>
              <div className="tr-trust-sep" />
              <div className="tr-trust-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                <span>Secure Checkout</span>
              </div>
            </div>

            {/* Accordion */}
            <div className="tr-accordion">
              {accordionItems.map((item, i) => (
                <div key={i} className={`tr-acc-item${openAccordion === i ? ' tr-acc-item--open' : ''}`}>
                  <button
                    className="tr-acc-trigger"
                    onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                  >
                    <span>{item.label}</span>
                    <span className="tr-acc-icon">{openAccordion === i ? '−' : '+'}</span>
                  </button>
                  {openAccordion === i && (
                    <div className="tr-acc-body">{item.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VIBE GALLERY ── */}
      <section className="tr-vibe">
        <div className="tr-vibe-inner">

          <div className="tr-vibe-header">
            <span className="tr-vibe-label">THE ESTIERA EXPERIENCE</span>
            <h2 className="tr-vibe-title">This is <span>ESTIERA</span> Aura Lamp</h2>
            <p className="tr-vibe-subtitle">Designed to transform every corner of your room.</p>
          </div>

          <div className="tr-vibe-cards-wrap">
            <div className="tr-vibe-cards">
              {[
                {title: 'Cozy Night Setup', tag: 'Bedroom', src: vibeVideo1},
                {title: 'Minimal Desk Vibes', tag: 'Workspace', src: vibeVideo2},
                {title: 'Late Night Glow', tag: 'Ambiance', src: vibeVideo3},
              ].map((card, i) => (
                <div key={i} className="tr-vibe-card">
                  <div className="tr-vibe-visual">
                    <video
                      className="tr-vibe-video"
                      src={card.src}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                    <div className="tr-vibe-overlay" />
                    <div className="tr-vibe-card-bottom">
                      <span className="tr-vibe-tag">{card.tag}</span>
                      <h3 className="tr-vibe-card-title">{card.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </div>
      </section>

      {/* ── REVIEWS ── */}
      <ReviewsSection />

      {/* ── FAQ ── */}
      <section className="tr-faq">
        <h2 className="tr-faq-title">Frequently Asked Questions</h2>
        <FAQList />
      </section>

      {/* ── FINAL CTA ── */}
      <section className="tr-final">
        <div className="tr-final-inner">
          <h2 className="tr-final-title">Ready to transform your room?</h2>
          <p className="tr-final-sub">Join thousands of aesthetic bedroom lovers who chose Estiera.</p>
          <ProductForm productOptions={productOptions} selectedVariant={selectedVariant} />
        </div>
      </section>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const ALL_REVIEWS = [
  {name: 'Sofia', photo: rev1, text: 'This lamp completely changed the vibe of my room. I turn it on every night.', date: 'May 2025'},
  {name: 'Emma', photo: rev2, text: 'My setup finally feels cozy and expensive. Everyone asks where I got it.', date: 'April 2025'},
  {name: 'Lia', photo: rev3, text: 'The glow looks unreal at night. Best thing I have bought for my room.', date: 'April 2025'},
  {name: 'Maya', photo: rev4, text: 'I turn it on every single night. The purple mode is so calming.', date: 'March 2025'},
  {name: 'Zoe', photo: rev5, text: 'My room looks straight from Pinterest now. So aesthetic and premium.', date: 'March 2025'},
  {name: 'Aria', photo: rev6, text: 'Bought it as a gift and ordered one for myself too. The quality is amazing.', date: 'February 2025'},
  {name: 'Chloe', photo: rev7, text: 'The jellyfish design is so unique. It transforms the whole room energy.', date: 'February 2025'},
  {name: 'Isla', photo: rev8, text: 'Perfect for my desk. The soft glow does not strain my eyes at all.', date: 'January 2025'},
  {name: 'Nora', photo: rev9, text: 'Even better in person. Super easy to set up and the remote is great.', date: 'January 2025'},
];

function RvCard({r}) {
  return (
    <div className="rv-card">
      <div className="rv-card-top">
        <div className="rv-avatar-initial">{r.name[0]}</div>
        <div className="rv-card-author">
          <p className="rv-name">{r.name}</p>
          <span className="rv-verified">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Verified Customer
          </span>
        </div>
      </div>
      <div className="rv-stars">★★★★★</div>
      <p className="rv-text">{r.text}</p>
      {r.photo && (
        <img src={r.photo} alt="Customer photo" className="rv-proof-img" />
      )}
    </div>
  );
}

function ReviewsSection() {
  const col1 = ALL_REVIEWS.slice(0, 3);
  const col2 = ALL_REVIEWS.slice(3, 6);
  const col3 = ALL_REVIEWS.slice(6, 9);
  return (
    <section className="rv-section">
      <div className="rv-header">
        <span className="rv-label">CUSTOMER LOVE</span>
        <h2 className="rv-title">What Our Customers Say</h2>
        <p className="rv-subtitle">Thousands are transforming their rooms with ESTIERA.</p>
      </div>
      <div className="rv-cols">
        <div className="rv-col-wrap">
          <div className="rv-col rv-col--1">
            {[...col1, ...col1].map((r, i) => <RvCard key={i} r={r} />)}
          </div>
        </div>
        <div className="rv-col-wrap">
          <div className="rv-col rv-col--2">
            {[...col2, ...col2].map((r, i) => <RvCard key={i} r={r} />)}
          </div>
        </div>
        <div className="rv-col-wrap rv-col-wrap--desktop">
          <div className="rv-col rv-col--3">
            {[...col3, ...col3].map((r, i) => <RvCard key={i} r={r} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

const faqs = [
  {q: 'How long does shipping take?', a: 'We ship within 1-2 business days. Delivery typically takes 5-10 business days depending on your location.'},
  {q: 'Does it come with a remote control?', a: 'Yes! Every Estiera Jellyfish Lamp includes a wireless remote so you can change colors and brightness effortlessly.'},
  {q: 'How many RGB colors does it have?', a: 'The lamp features 16 beautiful RGB color modes including soft lavender, ocean blue, rose pink, warm white, and more.'},
  {q: 'Is it suitable for a bedroom or desk?', a: 'Absolutely. It is designed to work beautifully on nightstands, desks, shelves, or anywhere in your room.'},
  {q: 'How do I set it up?', a: 'Simply plug it in via USB, turn it on, and use the remote to choose your favorite color. Setup takes under 30 seconds.'},
];

function FAQList() {
  const [open, setOpen] = useState(null);
  return (
    <div className="tr-faq-list">
      {faqs.map((item, i) => (
        <div key={i} className={`tr-faq-item${open === i ? ' tr-faq-item--open' : ''}`}>
          <button className="tr-faq-q" onClick={() => setOpen(open === i ? null : i)}>
            <span>{item.q}</span>
            <span className="tr-faq-icon">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && <p className="tr-faq-a">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku title
    unitPrice { amount currencyCode }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id title vendor handle descriptionHtml description
    encodedVariantExistence encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch { color image { previewImage { url } } }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) { ...ProductVariant }
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode $handle: String!
    $language: LanguageCode $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) { ...Product }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
