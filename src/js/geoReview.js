import InteractiveMap from './interactiveMap.js';

let storage = localStorage;
const allReviews = JSON.parse(storage.data || '[]');

export default class GeoReview {
  constructor() {
    this.formTemplate = document.querySelector('#addFormTemplate').innerHTML;
    this.map = new InteractiveMap('map', this.onClick.bind(this));
    this.map.init().then(this.onInit.bind(this));
  }

  async onInit() {
    allReviews.forEach(item => {
      this.map.createPlacemark(item.coords)
    });

    document.body.addEventListener('click', this.onDocumentClick.bind(this));
  }

  createForm(coords, reviews) {
    const root = document.createElement('div');
    root.innerHTML = this.formTemplate;
    const reviewList = root.querySelector('.review-list');
    const reviewForm = root.querySelector('[data-role=review-form]');
    reviewForm.dataset.coords = JSON.stringify(coords);

    for (const item of reviews) {
      const div = document.createElement('div');
      div.classList.add('review-item');
      div.innerHTML = `
    <div style="margin: 10px 0 4px">
      <span>${item.name}</span> ${item.place}
    </div>
    <div>${item.text}</div>
    `;
      reviewList.appendChild(div);
    }

    return root;
  }

  async onClick(coords) {
    let list = [];

    allReviews.forEach(item => {
      if (coords === item.coords) {
        list.push(item.review);
      }
    });

    const form = this.createForm(coords, list);
    this.map.openBalloon(coords, form.innerHTML);
  }

  async onDocumentClick(e) {
    if (e.target.dataset.role === 'review-add') {
      const reviewForm = document.querySelector('[data-role=review-form]');
      const coords = JSON.parse(reviewForm.dataset.coords);
      const data = {
        coords,
        review: {
          name: document.querySelector('[data-role=review-name]').value,
          place: document.querySelector('[data-role=review-place]').value,
          text: document.querySelector('[data-role=review-text]').value,
        },
      };

      allReviews.push(data);
      storage.data = JSON.stringify(allReviews);
      this.map.createPlacemark(coords);
      this.map.closeBalloon();
    }
  }
}