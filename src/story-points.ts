import { debounce } from './utils';

const debounceWait = 100;

interface State {
  closed: number;
  open: number;
}

let state: State = { closed: 0, open: 0 };

const columns = () => document.querySelectorAll('.js-project-column');

const accumulatePoint = (link: HTMLLinkElement, point: number) => {
  const previousElement = link.previousElementSibling;
  if (previousElement) {
    const isClosed = previousElement.querySelector('.octicon-issue-closed');

    if (isClosed === null) {
      state.open = state.open + point;
    } else {
      state.closed = state.closed + point;
    }
  }
};

const getPoint = (links: NodeList) =>
  Array.from(links)
    .map((link: any) => {
      const match = link.innerText.match(/\[(\d+)pt\]/);
      if (match) {
        const point = parseInt(match[1]);
        accumulatePoint(link, point);
        return point;
      }
    })
    .filter(
      (n: number | undefined) => typeof n === 'number' && Number.isInteger(n),
    )
    .reduce(
      (acc: number, n: number | undefined) =>
        typeof n === 'number' ? acc + n : 0,
      0,
    );

const showTotalPoint = () => {
  const counter = document.querySelector('.js-column-card-count');

  if (counter) {
    const pointNode = document.querySelector(
      '.js-github-story-points-total-counter',
    ) as HTMLSpanElement;

    if (pointNode) {
      const label = `${state.closed}pt / ${state.open + state.closed}pt`;
      pointNode.innerText = label;
    } else {
      let pointNode = counter.cloneNode(false) as HTMLSpanElement;
      pointNode.classList.add('js-github-story-points-total-counter');
      const label = `${state.closed}pt / ${state.open + state.closed}pt`;
      pointNode.innerText = label;
      pointNode.removeAttribute('aria-label');
      const menu = document.querySelector(
        '.js-updatable-content .js-show-project-menu',
      );
      if (menu) {
        menu.insertAdjacentHTML('beforebegin', pointNode.outerHTML);
      }
    }
  }
};

const callback = () => {
  columns().forEach(column => {
    const links = column.querySelectorAll(
      '.js-project-column-card:not(.d-none) .js-project-card-issue-link',
    );

    const point = getPoint(links);

    const pointNode = column.querySelector(
      '.js-github-story-points-counter',
    ) as HTMLSpanElement;

    if (point === 0 && !pointNode) {
      return;
    } else if (point === 0 && !!pointNode) {
      pointNode.remove();
    } else {
      if (pointNode) {
        const label = `${point}pt`;
        pointNode.innerText = label;
      } else {
        const counter = column.querySelector('.js-column-card-count');

        if (counter) {
          let pointNode = counter.cloneNode(false) as HTMLSpanElement;
          const label = `${point}pt`;
          pointNode.classList.add('js-github-story-points-counter');
          pointNode.innerText = label;
          pointNode.setAttribute('aria-label', label);
          counter.insertAdjacentHTML('afterend', pointNode.outerHTML);
        }
      }
    }
  });

  showTotalPoint();
  state = { closed: 0, open: 0 };
};

const observer = new MutationObserver(debounce(callback, debounceWait));
const targetNode = document.querySelector('.js-project-columns');

const options = {
  attributes: true,
  subtree: true,
};

if (!!targetNode) {
  observer.observe(targetNode, options);
} else {
  throw new Error('.js-project-columns is missing');
}
