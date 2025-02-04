import '../../commons/scripts/splide/splide.js';
import mockData from './profile-dealership-activities-mock.js';

export default async function decorate(block) {
  const [
    titleEl,
    viewAllTextEl,
    viewAllURLEl,
    imgURLEl,
    imgAltTxtEl,
    dealerLabelEl,
    emailLabelEl,
    schduleDateEl,
    schduleTimeEl,
    contactEl,
    viewDetailsEl,
    viewDetailsUrlEl,
  ] = block.children;

  const title = titleEl?.textContent?.trim() || '';
  const viewAllText = viewAllTextEl?.textContent?.trim() || '';
  const viewAllURL = viewAllURLEl?.textContent?.trim() || '';
  const imgURL = imgURLEl?.querySelector('img')?.src.split('?')[0] || '';
  const imgAltTxt = imgAltTxtEl?.textContent?.trim() || '';
  const dealerLabel = dealerLabelEl?.textContent?.trim() || '';
  const emailLabel = emailLabelEl?.textContent?.trim() || '';
  const schduleDate = schduleDateEl?.textContent?.trim() || '';
  const schduleTime = schduleTimeEl?.textContent?.trim() || '';
  const contact = contactEl?.textContent?.trim() || '';
  const viewDetails = viewDetailsEl?.textContent?.trim() || '';
  const viewDetailsUrl = viewDetailsUrlEl?.textContent?.trim() || '';

  function initCarousel() {
    // eslint-disable-next-line
    new Splide('.dealer-splide-carousel', {
      perPage: 1,
      perMove: 1,
      gap: '2rem',
      pagination: false,
      autoplay: 0.2,
    }).mount();
  }

  const respDealers = mockData.data[0].assetDetails;

  function createDealerDetailsCard(respDealer) {
    return `
                  <div class="profile-dealer-list splide__slide">
                      <div class="profile-dealer-list-img">
                        <img src="${imgURL}" alt="${imgAltTxt}">
                      </div>

                      <div class="profile-dealier-list-details">
                          <div class="profile-dealer-toast">
                            <span class="profile-dealer-status">
                              ${respDealer.visitStatus} | 
                            </span>
                            <span class="profile-dealer-msg">
                              ${respDealer.visitMessage}
                            </span>                           
                          </div>                         

                          <div class="profile-dealer-section">

                              <div class="profile-dealer-section-wrapper">
                                <div class="profile-dealer-fields-label">
                                  <span>${dealerLabel}</span>
                                </div>
                                <div class="profile-dealer-name">
                                  <span>${respDealer.dealerName}</span>
                                </div>

                            </div>  
                            
                            <div class="profile-dealer-saparator"></div>

                             <div class="profile-dealer-section-wrapper">
                              <div class="profile-dealer-fields-label">
                                <span>${contact}</span>
                              </div>
                              <div class="profile-dealer-details-phone">
                                <span>${respDealer.contact}</span>                                
                              </div>
                              </div>

                            <div class="profile-dealer-section-wrapper">
                                <div class="profile-dealer-fields-label">
                                  <span>${emailLabel}</span>
                                </div>
                                <div class="profile-dealer-details-email">                                
                                  <span>${respDealer.email}</span>                                
                                </div>
                            </div>
                        </div>                        
                        <div class="profile-dealer-schdule-block">
                          <div class="profile-dealer-schdule-section">
                            <div class="profile-dealer-schdule-label">
                              <span>${schduleDate}</span>
                            </div>
                            <div class="profile-dealer-schdule-value">
                              <span>${respDealer.schduleDate}<span>
                            </div>
                          </div>
                          <div class="profile-dealer-schdule-section">
                            <div class="profile-dealer-schdule-label">
                              <span>${schduleTime}</span>
                            </div>
                            <div class="profile-dealer-schdule-value">
                              <span>${respDealer.schduleTime}<span>
                            </div>
                          </div>
                        </div>
                         <div  class="profile-dealer-details-btn">
                           <a class="profile-dealer-details-a-tag" href="${viewDetailsUrl}">${viewDetails}</a>
                        </div>
                    </div>

                  </div>`;
  }
  const HTMLmarkup = `
                <div class="profile-dealer-activities">                    
                    <div class ="profile-dealer-header">
                      <div class="profile-dealer-header-title">
                        <p>${title}</p>
                      </div>
                      <div class="profile-dealer-header-btn">
                         <a class="profile-dealer-header-a-tag" href="${viewAllURL}">${viewAllText}</a>
                      </div>
                    </div>                  
                    <div class="card-list-teaser dealer-splide-carousel splide">          
                        <div class="splide__track">              
                          <div class= "card-list splide__list">
                              ${respDealers.map((dealer) => createDealerDetailsCard(dealer)).join('')}        
                          </div>          
                        </div>              
                        <div class="splide__arrows"></div>
                      </div> 
                </div>`;

  block.innerHTML = HTMLmarkup;
  initCarousel();
}
