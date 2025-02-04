export default function decorate(block) {
  function loadScriptInHead() {
    const script = document.createElement('script');
    script.innerHTML = `
        window.global = window.global || window;
        window.Buffer = window.Buffer || [];
        window.process = window.process || {
            env: { DEBUG: undefined },
            version: [],
        };
    `;
    document.head.appendChild(script);
  }

  // load the Script
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // load the Stylesheet
  function loadStylesheet(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.href = url;
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }
  loadScriptInHead();
  loadScript('https://d1lzjb5dkpjvo6.cloudfront.net/martech-ebook/2.2.0/martech-ebook.js');
  loadStylesheet('https://d1lzjb5dkpjvo6.cloudfront.net/martech-ebook/2.2.0/styles.css');

  const div = document.createElement('div');
  const martechEbook = document.createElement('martech-ebook');
  martechEbook.setAttribute('channel', 'NRM');

  div.appendChild(martechEbook);
  block.innerHTML = '';
  block.appendChild(div);

  const component = document.querySelector('martech-ebook');
  component.inpSourceDetail = '{"sourceName":"Arena","sourceUrl": "https://scstage-arena-cd.azurewebsites.net/e-booking/microsite" }';
}
