/**
 * Smart Funnel - Interactive Web Logic Engine (Popup Multi-step Version)
 * Управлява попъп мултистеп формата, ROI калкулатора, плавното скролиране и анимациите при скрол.
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Ефекти при Скрол (Scroll Reveal Animations)
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        // Променен коефициент на 0.75 за по-забавено и късно появяване на анимациите
        const triggerBottom = window.innerHeight * 0.75;

        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;

            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    revealOnScroll();
    window.addEventListener('scroll', revealOnScroll);


    /* ==========================================================================
       2. Премиум Мултистеп Попъп Форма (Modal Logic)
       ========================================================================== */
    const modal = document.getElementById('apply-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const applyForm = document.getElementById('apply-form');
    const modalSuccessState = document.getElementById('modal-success-state');
    const closeSuccessBtn = document.getElementById('btn-close-success');
    const modalSteps = document.querySelectorAll('.modal-step');
    const modalProgressBar = document.getElementById('modal-progress-bar');

    let currentStep = 1;

    // Функция за отваряне на модала
    const openModal = () => {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Забраняваме скрола на бекграунда
        resetModalForm();
    };

    // Функция за затваряне на модала
    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Възстановяваме скрола
    };

    // Прикачване на клик към всички бутони за кандидатстване
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);

    // Затваряне при клик извън модалната карта
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Логика за навигация между стъпките
    const updateModalStep = (stepNumber) => {
        currentStep = stepNumber;
        
        // Пресмятане на прогреса
        const progressPercent = ((currentStep) / 3) * 100;
        if (modalProgressBar) modalProgressBar.style.width = `${progressPercent}%`;

        modalSteps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.getAttribute('data-step'), 10) === currentStep) {
                step.classList.add('active');
            }
        });
    };

    const resetModalForm = () => {
        if (applyForm) applyForm.reset();
        if (modalSuccessState) modalSuccessState.style.display = 'none';
        if (applyForm) applyForm.style.display = 'block';
        
        // Махане на .selected класовете
        document.querySelectorAll('.modal-option, .modal-option-inline').forEach(el => {
            el.classList.remove('selected');
        });
        
        const otherGroup = document.getElementById('other-business-group');
        if (otherGroup) otherGroup.style.display = 'none';

        const err2 = document.getElementById('step2-error-msg');
        if (err2) err2.style.display = 'none';

        updateModalStep(1);
    };

    // Стилизиране и интеракция на радио бутоните
    document.querySelectorAll('.modal-option input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const parent = radio.closest('.modal-option');
            const siblings = parent.parentElement.querySelectorAll('.modal-option');
            
            siblings.forEach(el => el.classList.remove('selected'));
            parent.classList.add('selected');

            // Ако е избрано "Друго"
            const otherGroup = document.getElementById('other-business-group');
            if (otherGroup) {
                if (e.target.value === 'other') {
                    otherGroup.style.display = 'block';
                    document.getElementById('form-other-business').focus();
                } else {
                    otherGroup.style.display = 'none';
                }
            }
        });
    });

    document.querySelectorAll('.modal-option-inline input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const parent = radio.closest('.modal-option-inline');
            const siblings = parent.parentElement.querySelectorAll('.modal-option-inline');
            
            siblings.forEach(el => el.classList.remove('selected'));
            parent.classList.add('selected');
        });
    });

    // Бутони за Напред/Назад
    document.querySelectorAll('.btn-next-step').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep === 1) {
                // Валидация на стъпка 1
                const selectedBusiness = applyForm.querySelector('input[name="business-type"]:checked');
                if (!selectedBusiness) {
                    alert("Моля, изберете сектор за вашия бизнес.");
                    return;
                }
                updateModalStep(2);
            } else if (currentStep === 2) {
                // Валидация на стъпка 2
                const selectedCost = applyForm.querySelector('input[name="client-cost"]:checked');
                if (!selectedCost) {
                    alert("Моля, изберете средната стойност, която ви носи един клиент.");
                    return;
                }

                const onlinePresence = document.getElementById('form-online').value.trim();
                const businessDesc = document.getElementById('form-message').value.trim();
                const errorMsg = document.getElementById('step2-error-msg');

                // Поне едно от двете полета трябва да е попълнено
                if (onlinePresence === "" && businessDesc === "") {
                    if (errorMsg) errorMsg.style.display = 'block';
                    return;
                } else {
                    if (errorMsg) errorMsg.style.display = 'none';
                }

                updateModalStep(3);
            }
        });
    });

    document.querySelectorAll('.btn-prev-step').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                updateModalStep(currentStep - 1);
            }
        });
    });

    // Обработка на подаването на формата
    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Бутон ефект
            const submitBtn = document.getElementById('btn-submit-form');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `Изпращане на заявката...`;

            // Симулирано изчакване за психологически ефект на висок статус
            setTimeout(() => {
                applyForm.style.display = 'none';
                if (modalSuccessState) modalSuccessState.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }, 2000);
        });
    }


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

        displayDealValue.textContent = `${dealValue.toLocaleString('bg-BG')} €`;
        displayCloseRate.textContent = `${closeRate}%`;

        // 10 топли запитвания
        const projectedDeals = 10 * (closeRate / 100);
        const revenue = Math.round(projectedDeals * dealValue);
        const systemCost = 2900;
        const profit = revenue - systemCost;
        const roiPercentage = Math.round((profit / systemCost) * 100);

        displayRevenue.textContent = `${revenue.toLocaleString('bg-BG')} €`;
        displayProfit.textContent = `${profit.toLocaleString('bg-BG')} €`;
        
        if (profit < 0) {
            displayProfit.style.color = '#ef4444';
            displayRoi.textContent = `${roiPercentage}%`;
            displayRoi.style.color = '#ef4444';
        } else {
            displayProfit.style.color = '#2563EB';
            displayRoi.textContent = `+${roiPercentage}%`;
            displayRoi.style.color = '#16a34a';
        }
    };

    if (sliderDealValue && sliderCloseRate) {
        sliderDealValue.addEventListener('input', updateRoiCalculator);
        sliderCloseRate.addEventListener('input', updateRoiCalculator);
        
        updateRoiCalculator();
    }
});
