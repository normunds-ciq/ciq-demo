(function() {
  setTimeout(init, 1000);

  const demoItems = { 'Technical Analysis': AddStudy };

  function AddStudy() {
    resetChart(stxx);
    addStudy('Alligator');
  }

  let pointer, positionOver, showPointer;

  function init() {
    initDemoMenu(demoItems);
    ({ pointer, positionOver, showPointer } = getMenuPointer());
  }

  function initDemoMenu(demoItems) {
    insertDemoSelectorIcon();
    addMenuContent();

    function insertDemoSelectorIcon() {
      const iconEl = document.createElement('div');
      iconEl.classList.add('menu-trigger');

      iconEl.addEventListener('click', e => {
        e.stopPropagation();
        const menuContent = qs('.menu-content');
        if (menuContent) {
          menuContent.classList.toggle('open');
        }
      });

      document.body.addEventListener('click', () => {
        const menuContent = qs('.menu-content');
        if (menuContent) {
          menuContent.classList.remove('open');
        }
      });

      const menuEl = qs('cq-menu');
      const navEl = qs('.ciq-nav');
      navEl.insertBefore(iconEl, menuEl);
    }

    function addMenuContent() {
      const menuContent = document.createElement('div');
      menuContent.classList.add('menu-content');

      const listContent = document.createElement('div');
      listContent.classList.add('demo-selection');
      listContent.innerHTML = createList(demoItems);

      listContent.addEventListener('click', async e => {
        const name = e.target.innerText;
        const cmd = demoItems[name];
        menuContent.classList.remove('open');
        await delay(0.1);
        if (cmd) {
          cmd();
        }
      });
      menuContent.append(listContent);

      const contextEl = qs('cq-context');
      const firstContextEl = contextEl.firstElementChild;
      contextEl.insertBefore(menuContent, firstContextEl);
    }

    function createList(items) {
      return `<ul>
        ${Object.keys(items).map(name => `<li>${name}</li>`)}
      </ul>`;
    }
  }

  async function addStudy(name) {
    const menu = getMenu('Studies');
    await delay();
    positionOver(menu);
    await delay();
    selectItem(menu);
    await delay();
    const item = getItem(name);
    positionOver(item);
    await delay();
    selectItem(item);
    showPointer(false);
    await delay(0.01);
    // hide menu
    selectItem(menu);
  }

  function getMenu(name) {
    const menu = qsa('cq-menu span').find(el => el.innerText === name);
    return menu && menu.parentElement;
  }

  function getItem(name, menu) {
    const item = qsa('cq-item', menu).find(el => el.innerText === name);

    if (!item) {
      console.log('Could not find ' + name);
    }
    return item;
  }

  function getMenuPointer() {
    const pointer =
      qs('.menu-pointer') ||
      document.body.appendChild(document.createElement('div'));
    const s = pointer.style;
    const $pointer = $(pointer);
    pointer.classList.add('menu-pointer');
    return {
      pointer,
      positionOver,
      showPointer
    };
    function positionOver(el, offset = -5) {
      const { left, top, width, height } = el.getBoundingClientRect();

      console.log({ el, left, top, width, height });
      s.left = left - offset + 'px';
      s.top = top + 'px';
      s.width = width + 2 * offset + 'px';
      s.height = height + offset + 'px';
      s.opacity = 1;
    }
    function showPointer(v = true) {
      s.opacity = v ? 1 : 0;
    }
  }
})();

function qs(path, context) {
  return (context || document).querySelector(path);
}

function qsa(path, context) {
  return Array.from((context || document).querySelectorAll(path));
}

function noOp() {}

function delay(t = 1) {
  return new Promise(resolve => setTimeout(resolve, t * 1000));
}

function selectItem(item) {
  item.dispatchEvent(new Event('stxtap'));
}

function tap(item) {
  item.dispatchEvent(new Event('stxtap'));
}

function resetChart(chart, clearStudies) {
  const settings = {
    interval: 'day',
    periodicity: 1,
    timeUnit: null,
    candleWidth: 8,
    flipped: false,
    volumeUnderlay: false,
    adj: true,
    crosshair: false,
    chartType: 'candle',
    extended: false,
    marketSessions: {},
    aggregationType: 'ohlc',
    chartScale: 'linear',
    studies: {},
    panels: {
      chart: {
        percent: 1,
        display: 'AAPL',
        chartName: 'chart',
        index: 0,
        yAxis: { name: 'chart', position: null },
        yaxisLHS: [],
        yaxisRHS: ['chart']
      }
    },
    setSpan: {},
    smartzoom: true,
    sidenav: 'sidenavOff',
    symbols: [
      {
        symbol: 'AAPL',
        symbolObject: { symbol: 'AAPL' },
        periodicity: 1,
        interval: 'day',
        timeUnit: null,
        setSpan: {}
      }
    ]
  };

  chart.importLayout(settings);
  if (clearStudies) {
    tap(qs('[stxtap="Layout.clearStudies()"]'));
  }
}
