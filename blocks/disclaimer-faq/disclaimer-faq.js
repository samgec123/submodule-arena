import { moveInstrumentation } from '../../commons/scripts/scripts.js';

export default function decorate(block) {
  const [titleContainer, description, ...faqItems] = block.children;
  titleContainer.classList.add('faq-title');
  description.classList.add('faq-description');
  const listItems = faqItems.map((item) => {
    const [label, body] = item.children;
    body.classList.add('faq-item-body');
    const summary = document.createElement('summary');
    summary.append(...label.childNodes);
    summary.classList.add('faq-item-label');
    const details = document.createElement('details');
    details.append(summary, body);
    details.classList.add('faq-item');
    moveInstrumentation(item, details);
    item.remove();
    return details;
  });
  const list = document.createElement('div');
  list.classList.add('faq-list');
  list.append(...listItems);
  block.replaceChildren(titleContainer, description, list);

  document.querySelectorAll('.faq-item').forEach((item) => {
    const body = item.querySelector('.faq-item-body');
    item.addEventListener('toggle', () => {
      body.style.maxHeight = item.open ? `${body.scrollHeight}px` : '0';
    });
    body.addEventListener('transitionend', () => {
      body.style.maxHeight = item.open ? 'none' : '0';
    });
  });

  document.querySelector('.faq-list').addEventListener('click', ({ target }) => {
    const summary = target.closest('summary');
    if (summary) {
      document.querySelectorAll('.faq-list details').forEach((details) => {
        if (details !== summary.parentElement) {
          details.open = false;
        }
      });
    }
  });
}
