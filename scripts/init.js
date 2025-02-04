/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env browser */
window.hlx = window.hlx || {};

// Declare the blocks that are to be used from commons
window.hlx.commonsBlocks = ['cards', 'columns', 'fragment', 'hero'];
window.hlx.sfBlocks = ['model-selection', 'variant-detail', 'user-profile', 'personal-details', 'price-summary', 'pre-approved', 'loan-compare', 'filter-form', 'login-page', 'customer-detail', 'dealer-list', 'sf-journey-start', 'loan-application', 'loan-status', 'financier-mapping', 'journey-carousel', 'collapsible-text', 'faq', 'image-carousel', 'sf-dealer-locator', 'contact-support-list'];
window.hlx.lcpBlocks = ['image-carousel', 'banner-carousel'];

window.hlx.alloyConfig = {
  // datastreamId: '1713b6df-e53a-4154-bb32-6c9c44baaaff',
  datastreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  profileEnabledDataStreamId: '15f9e87a-0143-4fad-8b58-763c4a3b8a4c',
  /* launchUrl: 'https://assets.adobedtm.com/64acf8b07350/036cf1651011/launch-70f0cddab95d-development.min.js', */
};

function setCodeBasePath() {
  window.hlx.codeBasePath = '';
  window.hlx.commonsCodeBasePath = '';
  const scriptEl = document.querySelector('script[src$="/scripts/init.js"]');
  if (scriptEl) {
    try {
      const scriptURL = new URL(scriptEl.src, window.location);
      if (scriptURL.host === window.location.host) {
        [window.hlx.codeBasePath] = scriptURL.pathname.split('/scripts/init.js');
      } else {
        [window.hlx.codeBasePath] = scriptURL.href.split('/scripts/init.js');
      }
      window.hlx.commonsCodeBasePath = `${window.hlx.codeBasePath}/commons`;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }
}

window.hlx.apiDomainForLocalhost = 'https://dev-arena.marutisuzuki.com/';

setCodeBasePath();
