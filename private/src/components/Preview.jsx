/**
 * WordPress dependencies
 */
import { useEffect, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * External dependencies
 */
import DOMPurify from 'dompurify';

export default function Preview({ activeVariation, setActiveVariation, currentVariations }) {
  const wcData = useRef();
  useEffect(() => {
    const { priceFormat, symbol } = window.wcSettings.currency;
    wcData.current = { priceFormat, symbol };
  }, []);

  if (!currentVariations.length) {
    return null;
  }

  const Label = (variation) => {
    let isNyp = false;

    variation.meta_data.forEach((item) => {
      if (item.key === '_nyp' && item.value === 'yes') {
        isNyp = true;
      }
    });

    if (isNyp) {
      /* translators: [admin/front] label for donation block when a custom donation amount can be specified */
      return __('Custom', 'aidonations');
    }

    // eslint-disable-next-line @wordpress/valid-sprintf
    return sprintf(wcData.priceFormat, wcData.symbol, variation.price);
  };

  const Details = (variation) => {
    const description = DOMPurify.sanitize(variation.description, { USE_PROFILES: { html: true } });
    return (
      <div
        key={`desc-${variation.id}`}
        aria-labelledby={variation.id}
        dangerouslySetInnerHTML={{ __html: description }}
        style={{ zIndex: activeVariation === variation.id ? 1 : 0 }}
      />
    );
  };

  return (
    <div className="donation-options">
      <div className="donation-tabs" data-qty={currentVariations.length}>
        {currentVariations.map((v) => (
          <div
            id={v.id}
            key={`price-${v.id}`}
            className={activeVariation === v.id ? 'is-active' : ''}
            onClick={() => setActiveVariation(v.id)}
          >
            <Label variation={v} />
          </div>
        ))}
      </div>
      <div className="donation-details">
        {currentVariations.map((v) => (
          <Details key={`details-${v.id}`} variation={v} />
        ))}
      </div>
    </div>
  );
}
