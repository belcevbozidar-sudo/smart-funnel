/**
 * Lead System - Interactive Web Logic Engine (Popup Multi-step Version)
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
       2. Премиум Мултистеп Попъп Форма (Modal Logic - 4 Steps)
       ========================================================================== */
    const modal = document.getElementById('apply-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const applyForm = document.getElementById('apply-form');
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
        
        // Пресмятане на прогреса за 4 стъпки (25%, 50%, 75%, 100%)
        const progressPercent = (currentStep / 4) * 100;
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
        if (applyForm) applyForm.style.display = 'block';
        
        // Махане на .selected класовете
        document.querySelectorAll('.modal-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        const otherGroup = document.getElementById('other-business-group');
        if (otherGroup) otherGroup.style.display = 'none';

        const err3 = document.getElementById('step3-error-msg');
        if (err3) err3.style.display = 'none';

        // Възстановяване бутон за изпращане
        const submitBtn = document.getElementById('btn-submit-form');
        const submitSpinner = document.getElementById('submit-spinner');
        const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
        if (submitBtn) submitBtn.disabled = false;
        if (submitSpinner) submitSpinner.style.display = 'none';
        if (btnText) btnText.style.display = 'inline';

        updateModalStep(1);
    };

    // Стилизиране и интеракция на радио бутоните на стъпка 1
    document.querySelectorAll('input[name="business-type"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const parent = radio.closest('.modal-option');
            const siblings = parent.parentElement.querySelectorAll('.modal-option');
            
            siblings.forEach(el => el.classList.remove('selected'));
            parent.classList.add('selected');

            const otherGroup = document.getElementById('other-business-group');
            if (e.target.value === 'other') {
                if (otherGroup) {
                    otherGroup.style.display = 'block';
                    const otherInput = document.getElementById('form-other-business');
                    if (otherInput) otherInput.focus();
                }
            } else {
                if (otherGroup) otherGroup.style.display = 'none';
                // Автоматично преминаване към Стъпка 2 с кратко забавяне за по-добра визуализация
                setTimeout(() => {
                    if (currentStep === 1) {
                        updateModalStep(2);
                    }
                }, 300);
            }
        });
    });

    // Стилизиране и интеракция на радио бутоните на стъпка 2
    document.querySelectorAll('input[name="client-cost"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const parent = radio.closest('.modal-option');
            const siblings = parent.parentElement.querySelectorAll('.modal-option');
            
            siblings.forEach(el => el.classList.remove('selected'));
            parent.classList.add('selected');

            // Автоматично преминаване към Стъпка 3 с кратко забавяне
            setTimeout(() => {
                if (currentStep === 2) {
                    updateModalStep(3);
                }
            }, 300);
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
                if (selectedBusiness.value === 'other') {
                    const otherText = document.getElementById('form-other-business').value.trim();
                    if (otherText === "") {
                        alert("Моля, опишете вашия бизнес в текстовото поле.");
                        return;
                    }
                }
                updateModalStep(2);
            } else if (currentStep === 2) {
                // Валидация на стъпка 2
                const selectedCost = applyForm.querySelector('input[name="client-cost"]:checked');
                if (!selectedCost) {
                    alert("Моля, изберете средната стойност, която ви носи един клиент.");
                    return;
                }
                updateModalStep(3);
            } else if (currentStep === 3) {
                // Валидация на стъпка 3: Поне едно от двете полета трябва да е попълнено
                const onlinePresence = document.getElementById('form-online').value.trim();
                const businessDesc = document.getElementById('form-message').value.trim();
                const errorMsg = document.getElementById('step3-error-msg');

                if (onlinePresence === "" && businessDesc === "") {
                    if (errorMsg) errorMsg.style.display = 'block';
                    return;
                } else {
                    if (errorMsg) errorMsg.style.display = 'none';
                }
                updateModalStep(4);
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

            const submitBtn = document.getElementById('btn-submit-form');
            const submitSpinner = document.getElementById('submit-spinner');
            const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;

            if (submitBtn) submitBtn.disabled = true;
            if (submitSpinner) submitSpinner.style.display = 'inline-block';
            if (btnText) btnText.style.display = 'none';

            // Симулирано изчакване за психологически ефект на висок статус и пренасочване
            setTimeout(() => {
                closeModal();
                window.location.href = 'thank-you.html';
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


    /* ==========================================================================
       4. Интерактивни Често задавани въпроси (Accordion FAQ)
       ========================================================================== */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Затваряне на останалите FAQ
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.style.maxHeight = null;
                        }
                    }
                });
                
                const isActive = item.classList.toggle('active');
                if (isActive) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                } else {
                    answer.style.maxHeight = null;
                }
            });
        }
    });

    /* ==========================================================================
       5. Управление на формата за ревюта (Review Form Modal)
       ========================================================================== */
    const reviewModal = document.getElementById('review-modal');
    const openReviewBtns = document.querySelectorAll('.open-review-modal-btn');
    const closeReviewBtn = document.getElementById('review-modal-close-btn');
    const cancelReviewBtn = document.getElementById('btn-cancel-review');
    const reviewForm = document.getElementById('review-form');
    const reviewSuccessState = document.getElementById('review-success-state');
    const closeSuccessBtn = document.getElementById('btn-close-review-success');
    const reviewSpinner = document.getElementById('review-spinner');
    const submitReviewBtn = document.getElementById('btn-submit-review');

    const openReviewModal = () => {
        if (!reviewModal) return;
        reviewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Reset states
        if (reviewForm) reviewForm.style.display = 'block';
        if (reviewSuccessState) reviewSuccessState.style.display = 'none';
        if (reviewForm) reviewForm.reset();
        if (reviewSpinner) reviewSpinner.style.display = 'none';
        if (submitReviewBtn) submitReviewBtn.disabled = false;
    };

    const closeReviewModal = () => {
        if (!reviewModal) return;
        reviewModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    openReviewBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openReviewModal();
        });
    });

    if (closeReviewBtn) closeReviewBtn.addEventListener('click', closeReviewModal);
    if (cancelReviewBtn) cancelReviewBtn.addEventListener('click', closeReviewModal);
    if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeReviewModal);

    if (reviewModal) {
        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) {
                closeReviewModal();
            }
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (submitReviewBtn) submitReviewBtn.disabled = true;
            if (reviewSpinner) reviewSpinner.style.display = 'inline-block';
            
            setTimeout(() => {
                if (reviewForm) reviewForm.style.display = 'none';
                if (reviewSuccessState) reviewSuccessState.style.display = 'block';
            }, 1200);
        });
    }
});
