/**
 * WordPress dependencies
 */
import { MediaUploadCheck, RichText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PostMediaSelector from './PostMediaSelector.jsx';

/**
 * Editable fields at the top of the block
 */
export default function IntroductoryFields({ attributes, setAttributes }) {
  return (
    <>
      <div className="donation-title">
        <RichText
          tagName={`h${attributes.titleTag}`}
          allowedFormats={[]}
          format="string"
          placeholder={/* translators: [admin] */ __('Title', 'aidonations')}
          value={attributes.title}
          onChange={(title) => setAttributes({ title })}
        />
      </div>
      <div className="donation-description">
        <RichText
          tagName="p"
          allowedFormats={[]}
          format="string"
          placeholder={/* translators: [admin] */ __('Description', 'aidonations')}
          value={attributes.description}
          onChange={(description) => setAttributes({ description })}
        />
      </div>
      {attributes.showImage && (
        <div className="donation-image">
          <MediaUploadCheck>
            <PostMediaSelector
              mediaId={attributes.image}
              onUpdate={(media) => setAttributes({ image: media.id })}
            />
          </MediaUploadCheck>
        </div>
      )}
    </>
  );
}
