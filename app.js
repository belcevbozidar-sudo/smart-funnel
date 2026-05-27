/**
 * Smart Funnel - Interactive Web Logic Engine
 * Управлява Куиз-симулатора, ROI калкулатора, плавното скролиране, анимациите при показване (reveal) и кандидатстването.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Ефекти при Скрол (Scroll Reveal Animations)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;

            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    // Първоначално извикване и прикачване към събитието
    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);


    /* ==========================================================================
       2. Интерактивен Куиз (Smart Funnel Simulator)
       ========================================================================== */
    const quizCard = document.getElementById('quiz-card');
    const quizProgressBar = document.getElementById('quiz-progress-bar');

    // Стъпки на куиза
    const quizSteps = [
        {
            title: "Каква е сферата на вашата дейност?",
            options: [
                { text: "Строителство на къщи / Премиум ремонти", val: "high_ticket" },
                { text: "Луксозен интериорен дизайн „до ключ“", val: "high_ticket" },
                { text: "Енергийни системи / Термопомпи / B2B", val: "high_ticket" },
                { text: "Клиники / Естетична медицина / Импланти", val: "high_ticket" },
                { text: "Други услуги с високи цени", val: "high_ticket" },
                { text: "Услуги/продукти с ниски цени", val: "low_ticket" }
            ]
        },
        {
            title: "Какъв е средният ви чист приход от една сключена сделка?",
            options: [
                { text: "Под 1,000 €", val: "under_1000" },
                { text: "Между 1,000 € и 3,000 €", val: "mid_ticket" },
                { text: "Над 3,000 € (Премиум клас)", val: "high_ticket" }
            ]
        },
        {
            title: "Колко време губите в разговори с неквалифицирани запитвания на седмица?",
            options: [
                { text: "Над 5 часа седмично (губим ценно време)", val: "time_wasted" },
                { text: "Под 5 часа седмично (добре сме организирани)", val: "time_saved" }
            ]
        }
    ];

    let currentStep = 0;
    const userAnswers = [];

    const renderQuizStep = () => {
        if (!quizCard) return;

        // Пресмятане на прогреса
        const progressPercentage = ((currentStep) / quizSteps.length) * 100;
        quizProgressBar.style.width = `${progressPercentage || 10}%`;

        // Ако сме преминали през всички въпроси, показваме резултата
        if (currentStep >= quizSteps.length) {
            renderQuizResults();
            return;
        }

        const stepData = quizSteps[currentStep];

        let optionsHtml = '';
        stepData.options.forEach((opt, idx) => {
            optionsHtml += `
                <div class="quiz-option" data-val="${opt.val}" data-index="${idx}">
                    <div class="option-dot"></div>
                    <span class="option-text">${opt.text}</span>
                    <input type="radio" name="quiz-radio" value="${opt.val}">
                </div>
            `;
        });

        quizCard.innerHTML = `
            <div>
                <span class="timeline-step">Въпрос ${currentStep + 1} от ${quizSteps.length}</span>
                <h3 class="quiz-step-title">${stepData.title}</h3>
                <div class="quiz-options">
                    ${optionsHtml}
                </div>
            </div>
            <div class="quiz-nav">
                <button class="btn-quiz-nav btn-quiz-prev" id="quiz-btn-prev" ${currentStep === 0 ? 'disabled style="opacity:0; pointer-events:none;"' : ''}>Назад</button>
                <button class="btn-quiz-nav btn-quiz-next" id="quiz-btn-next" disabled>Напред</button>
            </div>
        `;

        // Атачване на клик събития за опциите
        const optionsElements = quizCard.querySelectorAll('.quiz-option');
        const nextButton = quizCard.querySelector('#quiz-btn-next');

        optionsElements.forEach(optEl => {
            optEl.addEventListener('click', () => {
                // Изчистване на селекцията
                optionsElements.forEach(el => el.classList.remove('selected'));
                
                // Добавяне на селекцията на текущия
                optEl.classList.add('selected');
                const radio = optEl.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // Активиране на бутона "Напред"
                nextButton.disabled = false;
            });
        });

        // Назад бутон логика
        quizCard.querySelector('#quiz-btn-prev').addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                userAnswers.pop();
                renderQuizStep();
            }
        });

        // Напред бутон логика
        nextButton.addEventListener('click', () => {
            const selectedOption = quizCard.querySelector('.quiz-option.selected');
            if (selectedOption) {
                userAnswers.push(selectedOption.getAttribute('data-val'));
                currentStep++;
                renderQuizStep();
            }
        });
    };

    const renderQuizResults = () => {
        quizProgressBar.style.width = '100%';

        // Проверяваме дали средният приход от сделка е под 1000 евро
        const ticketSize = userAnswers[1];
        const isDisqualified = ticketSize === 'under_1000';

        if (isDisqualified) {
            quizCard.innerHTML = `
                <div class="simulator-result-box">
                    <div class="sim-icon">⚠️</div>
                    <span class="sim-badge-disqualify">НЕ СЕ КЛАСИРАТЕ</span>
                    <h3 class="sim-headline">Smart Funnel не е подходящ за вас</h3>
                    <p class="sim-body">
                        Системата за квалифициране Smart Funnel изисква средната стойност на сделката ви да бъде **над 1,000 €**, за да може да избие инвестицията и да ви донесе изключително висока възвръщаемост.
                    </p>
                    <button class="btn-premium btn-outline" id="quiz-btn-restart">Рестартирайте симулатора</button>
                </div>
            `;
        } else {
            quizCard.innerHTML = `
                <div class="simulator-result-box">
                    <div class="sim-icon">✨</div>
                    <span class="sim-badge-qualify">ОДОБРЕН БИЗНЕС</span>
                    <h3 class="sim-headline text-blue-gradient">Вашият бизнес е идеален за Smart Funnel</h3>
                    <p class="sim-body">
                        Въз основа на вашите отговори, вие губите десетки часове в разговори с грешни лидове, докато вашите конкуренти ви подбиват по цена. Чрез внедряване на нашия метод, вие ще започнете да получавате **изцяло автоматизирани запитвания** само от квалифицирани клиенти с бюджет.
                    </p>
                    <a href="#apply" class="btn-premium btn-blue" id="quiz-btn-go-to-form">
                        Кандидатствайте за Smart Funnel
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            `;
        }

        const restartBtn = quizCard.querySelector('#quiz-btn-restart');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                currentStep = 0;
                userAnswers.length = 0;
                renderQuizStep();
            });
        }
        
        const goToFormBtn = quizCard.querySelector('#quiz-btn-go-to-form');
        if (goToFormBtn) {
            goToFormBtn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('#apply').scrollIntoView({ behavior: 'smooth' });
            });
        }
    };

    // Първоначално стартиране на куиза
    renderQuizStep();


    /* ==========================================================================
       3. Интерактивен ROI Калкулатор
       ========================================================================== */
    const sliderDealValue = document.getElementById('slider-deal-value');
    const sliderCloseRate = document.getElementById('slider-close-rate');
    const displayDealValue = document.getElementById('display-deal-value');
    const displayCloseRate = document.getElementById('display-close-rate');
    const displayRevenue = document.getElementById('display-revenue');
    const displayProfit = document.getElementById('display-profit');
    const displayRoi = document.getElementById('display-roi');

    const updateRoiCalculator = () => {
        if (!sliderDealValue || !sliderCloseRate) return;

        const dealValue = parseInt(sliderDealValue.value, 10);
        const closeRate = parseInt(sliderCloseRate.value, 10);

        // Форматиране за визуализация
        displayDealValue.textContent = `${dealValue.toLocaleString('bg-BG')} €`;
        displayCloseRate.textContent = `${closeRate}%`;

        // Пресмятане на ROI
        // 10 квалифицирани лида са гарантирани
        const projectedDeals = 10 * (closeRate / 100);
        const revenue = Math.round(projectedDeals * dealValue);
        const systemCost = 2900;
        const profit = revenue - systemCost;
        const roiPercentage = Math.round((profit / systemCost) * 100);

        // Актуализиране на изгледите
        displayRevenue.textContent = `${revenue.toLocaleString('bg-BG')} €`;
        displayProfit.textContent = `${profit.toLocaleString('bg-BG')} €`;
        
        if (profit < 0) {
            displayProfit.style.color = '#ef4444';
            displayRoi.textContent = `${roiPercentage}%`;
            displayRoi.style.color = '#ef4444';
        } else {
            displayProfit.style.color = '#60A5FA';
            displayRoi.textContent = `+${roiPercentage}%`;
            displayRoi.style.color = '#4ade80';
        }
    };

    if (sliderDealValue && sliderCloseRate) {
        sliderDealValue.addEventListener('input', updateRoiCalculator);
        sliderCloseRate.addEventListener('input', updateRoiCalculator);
        
        // Първоначално изчисление
        updateRoiCalculator();
    }


    /* ==========================================================================
       4. Кандидатстване и Обработка на Формата
       ========================================================================== */
    const applyForm = document.getElementById('apply-form');
    const formStatus = document.getElementById('form-status');

    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Бутон ефект
            const submitBtn = applyForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `Анализираме съвместимостта на бизнеса ви...`;

            // Фалшива асинхронна заявка за психологически ефект на премиум обслужването
            setTimeout(() => {
                const dealValueSelect = document.getElementById('form-deal-value').value;
                
                formStatus.className = 'form-status'; // изчистване на класовете
                
                if (dealValueSelect === 'under2k') {
                    // Бизнесът не отговаря на изискването за чек
                    formStatus.classList.add('error');
                    formStatus.innerHTML = `
                        🛑 <strong>Оценката приключи:</strong> За съжаление, средният чек на вашите сделки е под минималния праг за Smart Funnel. В момента не можем да ви предложим официална договорна гаранция, тъй като системата изисква сделки над €1,000 за пълна рентабилност. Благодарим ви за интереса!
                    `;
                } else {
                    // Успешна квалификация
                    formStatus.classList.add('success');
                    formStatus.innerHTML = `
                        ✨ <strong>Поздравления!</strong> Преминахте успешно първия етап на подбор. Тъй като работим с изключително ограничен капацитет (приемаме само по 1 нов дългосрочен партньор на тримесечие), наш старши стратег ще направи психологически анализ на вашето дигитално позициониране и ще се свърже с вас в рамките на 24 часа за организиране на частна Zoom сесия.
                    `;
                    applyForm.reset();
                }

                // Връщане на бутона
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                // Плавно скролиране до статуса на формата
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });

            }, 2500); // 2.5 секунди бавен лоудинг за висок статус
        });
    }
});
