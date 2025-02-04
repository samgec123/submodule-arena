import utility from '../../commons/utility/utility.js';
import mockData from './profile-overview-form-mock.js';

export default async function decorate(block) {
  if (!block || !block.children) {
    return;
  }

  const firstTitle = block.children[0]?.children[0];
  const aboutText = firstTitle?.querySelector('p')?.textContent.trim();
  const secondTitle = block.children[1]?.children[0];
  const addressText = secondTitle?.querySelector('p')?.textContent.trim();
  const thirdTitle = block.children[2]?.children[0];
  const eventText = thirdTitle?.querySelector('p')?.textContent.trim();

  const fields = mockData.profileDetails;

  const htmlLiteral = `
    <div class="profile-form-overview-block">
        <form class="profile-form-overview-container" method="post" action="/save">

            <!-- About You Section -->
            <div class="profile-form-overview-section">
            <div class="profile-form-overview-section-header">
                <p>${aboutText}</p>
                <button type="button" class="edit-icon"><img src="${window.hlx.codeBasePath}/icons/edit-icon.svg" alt="edit icon" /></button>
            </div>
            <div class="field-group">
                <div>
                    <label for="profile-name">Name</label>
                    <input type="text" id="profile-name" name="name" value="${fields.name}">
                </div>
                <div>
                    <label for="profile-phone">Phone</label>
                    <input type="tel" id="profile-phone" name="phone" value="${fields.phone}">
                </div>
                <div>
                    <label for="profile-email">Email</label>
                    <input type="email" id="profile-email" name="email" value="${fields.email}">
                </div>
            </div>
            </div>

            <!-- Address Section -->
            <div class="profile-form-overview-section">
            <div class="profile-form-overview-section-header">
                <p>${addressText}</p>
                <button type="button" class="edit-icon"><img src="${window.hlx.codeBasePath}/icons/edit-icon.svg" alt="edit icon" /></button>
            </div>
            <div class="field-group-for-two-col">
                <div class="field-group">
                <div>
                    <label for="profile-address_line1">Address Line 1</label>
                    <input type="text" id="profile-address_line1" name="name" value="${fields.address_line1}">
                </div>

                <div>
                    <label for="profile-address_line2">Address Line 2</label>
                    <input type="text" id="profile-address_line2" name="name" value="${fields.address_line2}">
                </div>

                <div>
                    <label for="profile-landmark">Landmark</label>
                    <input type="text" id="profile-landmark" name="name" value="${fields.landmark}">
                </div>
                </div>

                <div class="field-group">
                <div>
                    <label for="profile-state">State</label>
                    <input type="text" id="profile-state" name="name" value="${fields.state}">
                </div>

                <div>
                    <label for="profile-city">City</label>
                    <input type="text" id="profile-city" name="name" value="${fields.city}">
                </div>

                <div>
                    <label for="profile-postal_code">Pincode</label>
                    <input type="text" id="profile-postal_code" name="name" value="${fields.postal_code}">
                </div>
                </div>
            </div>
            </div>

            <!-- Events Section -->
            <div class="profile-form-overview-section no-margin-bottom">
            <div class="profile-form-overview-section-header">
                <p>${eventText}</p>
                <button type="button" class="edit-icon"><img src="${window.hlx.codeBasePath}/icons/edit-icon.svg" alt="edit icon" /></button>
            </div>
            <div class="field-group">
                <div>
                    <label for="profile-dob">Date of Birth</label>
                    <input type="text" id="profile-dob" name="name" value="${fields.dob}">
                </div>
                <div>
                    <label for="profile-event">Anniversary</label>
                    <input type="text" id="profile-event" name="name" value="${fields.anniversary_date}">
                </div>
            </div>
            </div>
        </form>
    </div>
`;

  block.innerHTML = utility.sanitizeHtml(htmlLiteral);
}
