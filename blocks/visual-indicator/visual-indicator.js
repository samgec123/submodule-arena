import utility from '../../commons/utility/utility.js';

export default async function decorate(block) {
  const [sectionHeading, showroomVisitsTitle, testDrivesTitle, requestQuoteTitle] = block.children;

  block.innerHTML = utility.sanitizeHtml(`
    <section class="section arena-quick-activity-module-wrapper">
        <div class="arena-quick-activity-module-container">
            <div class="arena-quick-activity-module-col arena-quick-activity-module-left-col">
                <h3>${sectionHeading?.textContent?.trim() || ''}</h3>
            </div>
            <div class="arena-quick-activity-module-col arena-quick-activity-module-right-col">
                <ul>
                    <li>
                        <h4>3</h4>
                        <p>${showroomVisitsTitle?.textContent?.trim() || ''}</p>
                    </li>
                    <li>
                        <h4>2</h4>
                        <p>${testDrivesTitle?.textContent?.trim() || ''}</p>
                    </li>
                    <li>
                        <h4>1</h4>
                        <p>${requestQuoteTitle?.textContent?.trim() || ''}</p>
                    </li>
                </ul>
            </div>
        </div>
    </section>
  `);

  return block;
}
