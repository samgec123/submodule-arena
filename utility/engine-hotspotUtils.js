import utility from '../commons/utility/utility.js';

const hotspot = {
  getHotspot(block, index) {
    const [titleEl, subtitleEl] = block.children;
    const title = titleEl.querySelector(':is(h1,h2,h3,h4,h5,h6)');
    const subtitle = subtitleEl.querySelector('p')?.textContent?.trim();
    if (title) {
      title.className = 'modal-title';
    }
    const newHTML = `
        <div class="hotspot-${index} hotspot-carousel">
          ${title?.outerHTML}
           <p class="modal-subtitle">${subtitle}</p>
           </div>
        </div>
      `;
    block.innerHTML = utility.sanitizeHtml(newHTML);
    return block;
  },
};
export default hotspot;
