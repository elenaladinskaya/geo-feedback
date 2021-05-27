import { memberExpression } from "babel-types";

function mapInit() {
    const popupWrap = document.querySelector('#popup-wrap');
    const popup = document.querySelector('#popup');
    const closeButton = document.querySelector('#close-button');
    const form = document.getElementById('sendForm');

    let storage = localStorage;
    let currentCoords;

    const allPlacemarks = JSON.parse(storage.data || '[]');

    ymaps.ready(() => {
        let spb = new ymaps.Map('map', {
            center: [59.94, 30.35],
            zoom: 12,
        });

        let feedback = new ymaps.GeoObjectCollection({}, {});

        allPlacemarks.forEach(item => {
            feedback.add(new ymaps.Placemark(item.coords, {
                balloonContentBody: `<div class="popup-inner">
                <div class="popup-feedback-wrap">
                    <ul class="popup-feedback popup-feedback--inner">
                        <li class="popup-feedback__item">
                            <div class="popup-feedback__header">
                                <div class="popup-feedback__username">${item.name}</div>
                                <div class="popup-feedback__details">${item.place}</div>
                            </div>
                            <div class="popup-feedback__text">${item.text}</div>
                        </li>
                    </ul>
                    </div>
                <form id="sendFormInner" class="form">
                    <h3 class="popup__title">Отзыв:</h3>
                    <input type="text" name="innerName" placeholder="Укажите ваше имя" class="form__input">
                    <input type="text" name="innerPlace" placeholder="Укажите место" class="form__input">
                    <textarea name="innerText" placeholder="Оставить отзыв" class="form__input form__input--textarea"></textarea>
                    <button type="submit" class="button">Добавить</button>
                </form>
            </div>`
            }));
        });

        spb.geoObjects.add(feedback);

        // Обработка кликов по карте
        spb.events.add('click', function (e) {
            openPopup(e);
        });

        // Добавление метки
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (validateForm()) {

                allPlacemarks.push({
                    'coords': currentCoords,
                    'name': form.elements.name.value,
                    'place': form.elements.place.value,
                    'text': form.elements.text.value
                });

                storage.data = JSON.stringify(allPlacemarks);

                const newPlacemark = new ymaps.Placemark(currentCoords, {
                    balloonContentBody: `<div class="popup-inner">
                    <div class="popup-feedback-wrap">
                        <ul class="popup-feedback popup-feedback--inner">
                            <li class="popup-feedback__item">
                                <div class="popup-feedback__header">
                                    <div class="popup-feedback__username">${form.elements.name.value}</div>
                                    <div class="popup-feedback__details">${form.elements.place.value}</div>
                                </div>
                                <div class="popup-feedback__text">${form.elements.text.value}</div>
                            </li>
                        </ul>
                        </div>
                        <form id="sendFormInner" class="form">
                        <h3 class="popup__title">Отзыв:</h3>
                        <input type="text" name="innerName" placeholder="Укажите ваше имя" class="form__input">
                        <input type="text" name="innerPlace" placeholder="Укажите место" class="form__input">
                        <textarea name="innerText" placeholder="Оставить отзыв" class="form__input form__input--textarea"></textarea>
                        <button type="submit" class="button">Добавить</button>
                    </form>
                </div>`
                });

                spb.geoObjects.add(newPlacemark);

                form.elements.name.value = '';
                form.elements.place.value = '';
                form.elements.text.value = '';

                popup.classList.add('hidden');
            }
        });

        spb.geoObjects.events.add(['balloonopen'], function (e) {
            const balloonCoords = e.get('target').geometry._coordinates;

            document.body.addEventListener('click', (e) => {
                e.preventDefault();
                let formName;
                let formPlace;
                let formText;

                if (e.target.type === 'submit') {
                    const feedbackForm = document.querySelector('#sendFormInner');

                    for (let i = 0; i < feedbackForm.children.length; i++) {
                        const element = feedbackForm.children[i];
                        if (element.name === "innerName") {
                            formName = element.value;
                        }
                        if (element.name === "innerPlace") {
                            formPlace = element.value;
                        }
                        if (element.name === "innerText") {
                            formText = element.value;
                        }
                    }
                }

                if (formName && formPlace && formText) {
                    allPlacemarks.push({
                        'coords': balloonCoords,
                        'name': formName,
                        'place': formPlace,
                        'text': formText
                    });

                    storage.data = JSON.stringify(allPlacemarks);
                }
            });
        });
    });

    function openPopup(e) {
        // получить координаты клика
        currentCoords = e.get('coords');

        // получить позицию 
        const positionX = e.get('domEvent').get('pageX');
        const positionY = e.get('domEvent').get('pageY');

        popupWrap.style.top = `${positionY}px`;
        popupWrap.style.left = `${positionX}px`;

        popup.classList.remove('hidden');
    }

    closeButton.addEventListener('click', (e) => {
        e.preventDefault();

        popup.classList.add('hidden');
    })

    function validateForm() {
        if (form.elements.name.value && form.elements.place.value && form.elements.text.value) {
            form.elements.name.style.borderColor = '#CFCFCF';
            form.elements.place.style.borderColor = '#CFCFCF';
            form.elements.text.style.borderColor = '#CFCFCF';
            return true;
        } else {
            if (!form.elements.name.value) {
                form.elements.name.style.borderColor = '#d80000';
            }
            if (!form.elements.place.value) {
                form.elements.place.style.borderColor = '#d80000';
            }
            if (!form.elements.text.value) {
                form.elements.text.style.borderColor = '#d80000';
            }
            return false;
        }
    }
}

export {
    mapInit
}