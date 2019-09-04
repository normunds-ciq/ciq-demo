const DELAY_SEC = 1;

(function() {
  setTimeout(init, 1000);

  const demoItems = [
    {
      hash: 'ta',
      display: '<b>Technical Analysis</b> - Add Study (Alligator)',
      command: AddStudy
    },
    { hash: 'tc', display: '<b>Tick chart</b>', command: TickChart },
    {
      hash: 'videoEvents',
      display: '<b>Video Events</b>',
      command: VideoEvents
    }
  ];

  const commandLookup = demoItems.reduce(
    (acc, { hash, command }) => ({ ...acc, [hash]: command }),
    {}
  );

  async function AddStudy() {
    reset();
    resetChart(stxx);
    await selectMenuItem('Studies', 'Alligator');
  }

  async function TickChart() {
    reset();
    resetChart(stxx);
    await selectMenuItem('Display', 'Step');
    await selectMenuItem('1D', 'Tick');
    // stxx.setPeriodicity({ period: 1, timeUnit: 'tick' });
  }

  async function VideoEvents() {
    reset();
    resetChart(stxx);
    await selectMenuItem('Events', 'Video');
    showPointer();

    const marker = qsa('.stx-marker .stx-visual')[1];
    positionOver(marker, [-4, -4]);
    await delay(1.1);
    marker.click();
    await delay(0.5);
    showPointer(false);
    // await selectMenuItem('1D', 'Tick');
  }

  let pointer, positionOver, showPointer;

  function init() {
    initDemoMenu();

    window.addEventListener('hashchange', execHashCommand);
    setTimeout(execHashCommand, 500);

    ({ pointer, positionOver, showPointer } = getMenuPointer());

    function execHashCommand() {
      const hash = window.location.hash.replace(/^#/, '');
      const command = commandLookup[hash];
      if (command) {
        command();
      }
    }
  }

  function reset() {
    selectItem(getItem('None'));
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
    addVideoEvents();

    document.addEventListener('play', onlyOneVideoPlaying, { capture: true });

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
        ${items
          .map(
            ({ hash, display }) => `<li><a href="#${hash}">${display}</a></li>`
          )
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

    let zIndex = 20;
    function onlyOneVideoPlaying(e) {
      const video = e.target;
      video.parentElement.style.zIndex = zIndex++;
      qsa('video')
        .filter(v => v !== video)
        .forEach(v => v.pause());
    }
  }

  async function selectMenuItem(menuName, itemName) {
    const menuOffset = [-4, 0, -8, 0];
    const menu = getMenu(menuName);
    await delay();
    positionOver(menu, menuOffset);
    await delay();
    selectItem(menu);
    await delay();
    const item = getItem(itemName);
    positionOver(item, menuOffset);
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
    function positionOver(el, [t = 0, l = 0, w = 0, h = 0] = []) {
      const { left, top, width, height } = el.getBoundingClientRect();

      s.left = left + l + 'px';
      s.top = top + t + 'px';
      s.width = width + w + 'px';
      s.height = height + h + 'px';
      s.opacity = 1;
      showPointer();
    }
    function showPointer(v = true) {
      // s.opacity = v ? 1 : 0;
      s.display = v ? '' : 'none';
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

function delay(t = DELAY_SEC) {
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

function addVideoEvents() {
  const videoEventsSelector = document.createElement('cq-item');
  videoEventsSelector.setAttribute('stxtap', 'Markers.showVideoMarkers()');
  videoEventsSelector.innerHTML =
    "Video <span class='ciq-radio'><span></span></span>";
  document
    .querySelector('.stx-markers cq-menu-dropdown :nth-child(3)')
    .insertAdjacentElement('afterEnd', videoEventsSelector);

  CIQ.UI.BaseComponent.bindNode(videoEventsSelector);

  CIQ.UI.Markers.prototype.showVideoMarkers = function(node, type) {
    const {
      activeClassName,
      menuItemSelector,
      context: { stx }
    } = this;

    qsa(menuItemSelector).forEach(function(el) {
      if (node.node == el) el.classList.add(activeClassName);
      else el.classList.remove(activeClassName);
    });
    this.implementation.hideMarkers(stx);
    showVideoMarkers(stx, type);
  };

  function showVideoMarkers(stx, label = 'square') {
    // Remove any existing markers

    const { masterData } = stx;
    const l = masterData.length;

    var story =
      'Like all ChartIQ markers, the object itself is managed by the chart, so when you scroll the chart the object moves with you. It is also destroyed automatically for you when the symbol is changed.';
    const spread = () => 10;
    const starting = 5;
    const data = [
      ['news', 'This is a Marker for a News Item'],
      ['earningsUp', 'This is a Marker for Earnings (+)'],
      ['earningsDown', 'This is a Marker for Earnings (-)'],
      ['dividend', 'This is a Marker for Dividends'],
      ['filing', 'This is a Marker for a Filing'],
      ['split', 'This is a Marker for a Split']
    ];

    data.forEach(([category, headline], index) => {
      const x = masterData[l - index * spread() - 5].DT;
      const datum = {
        x,
        label,
        category,
        headline,
        story,
        videoUrl:
          'https://embed-ssl.wistia.com/deliveries/d1aa8163948cdcc3d01a0ccda618e4a91dbff03c.bin',
        videoWidth: 300
      };

      const params = {
        label,
        x,
        stx,
        xPositioner: 'date',
        node: new VideoMarker(datum)
      };
      new CIQ.Marker(params);
    });

    stxx.draw();
  }

  function VideoMarker(params) {
    const node = (this.node = document.createElement('div'));
    node.className = 'stx-marker ' + params.label;

    if (params.category) CIQ.appendClassName(node, params.category);
    const visual = CIQ.newChild(node, 'div', 'stx-visual');
    CIQ.newChild(node, 'div', 'stx-stem');

    const expand = createVideoExpandNode(params);
    node.append(expand);

    function cb() {
      CIQ.Marker.positionContentVerticalAndHorizontal(node);

      const isVisible = node.classList.contains('highlight');
      qs('video', node)[isVisible ? 'play' : 'pause']();
    }

    // CIQ.safeClickTouch(visual, function(e) {
    //   console.log('touch');
    //   CIQ.toggleClassName(node, 'highlight');

    //   setTimeout(cb, 10);
    // });
    visual.addEventListener('click', e => {
      CIQ.toggleClassName(node, 'highlight');

      setTimeout(cb, 10);
    });
  }

  VideoMarker.ciqInheritsFrom(CIQ.Marker.NodeCreator, false);

  function createVideoExpandNode(params) {
    var expand = document.createElement('div');
    expand.className = 'stx-marker-video stx-marker-expand';

    var video = document.createElement('video');

    if (video.canPlayType('video/mp4')) {
      video.setAttribute('src', params.videoUrl);
    }

    video.setAttribute('width', params.videoWidth);
    video.setAttribute('controls', 'controls');

    expand.appendChild(video);

    return expand;
  }
}
