(function() {
  setTimeout(init, 1000);

  let demoItems = {
    '<b>Technical Analysis</b> - Add Study (Alligator)': AddStudy,
    '<b>Tick chart</b>': TickChart
  };

  async function AddStudy() {
    resetChart(stxx);
    await selectMenuItem('Studies', 'Alligator');
  }

  async function TickChart() {
    resetChart(stxx);
    await selectMenuItem('Display', 'Step');
    await selectMenuItem('1D', 'Tick');
    // stxx.setPeriodicity({ period: 1, timeUnit: 'tick' });
  }

  let pointer, positionOver, showPointer;

  function init() {
    initDemoMenu();
    demoItems = Object.keys(demoItems).reduce((acc, name) => {
      return { ...acc, [name.replace(/(<b>|<\/b>)/g, '')]: demoItems[name] };
    }, {});

    ({ pointer, positionOver, showPointer } = getMenuPointer());
  }

  function initDemoMenu() {
    if (qs('.menu-content')) {
      return;
    }
    insertDemoSelectorIcon();
    addMenuContent();
    addPeriod({
      label: 'Tick',
      period: 1,
      timeUnit: 'tick',
      prependSeparator: true
    });

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

      listContent.addEventListener(
        'click',
        async e => {
          const name = e.target.innerText;
          const parentName = e.target.parentElement.innerText;
          // console.log(name, parentName, demoItems[name], demoItems);
          const cmd = demoItems[name] || demoItems[parentName];
          menuContent.classList.remove('open');
          await delay(0.1);
          if (cmd) {
            cmd();
          }
        },
        { capture: true }
      );
      menuContent.append(listContent);

      const contextEl = qs('cq-context');
      const firstContextEl = contextEl.firstElementChild;
      contextEl.insertBefore(menuContent, firstContextEl);
    }

    function createList(items) {
      return `<ul>
        ${Object.keys(items)
          .map(name => `<li>${name}</li>`)
          .join('')}
      </ul>`;
    }

    function addPeriod({ label, period, timeUnit, prependSeparator }) {
      const item = document.createElement('cq-item');
      item.innerText = label;
      item.addEventListener('click', () =>
        stxx.setPeriodicity({ period: 1, timeUnit: 'tick' })
      );

      qs('.ciq-period cq-menu-dropdown').append(
        document.createElement('cq-separator')
      );
      qs('.ciq-period cq-menu-dropdown').append(item);
    }
  }

  async function selectMenuItem(menuName, itemName) {
    const menu = getMenu(menuName);
    await delay();
    positionOver(menu);
    await delay();
    selectItem(menu);
    await delay();
    const item = getItem(itemName);
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

function delay(t = 0.8) {
  return new Promise(resolve => setTimeout(resolve, t * 1000));
}

function selectItem(item) {
  item.dispatchEvent(new Event('stxtap'));
  if (item.click) {
    item.click();
  }
}

function tap(item) {
  item.dispatchEvent(new Event('stxtap'));
}

function resetChart(chart, clearStudies = true) {
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

  if (clearStudies) {
    tap(qs('[stxtap="Layout.clearStudies()"]'));
  }

  chart.importLayout(settings, { managePeriodicity: true });
}
