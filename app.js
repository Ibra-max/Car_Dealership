/* ============================================================
   RAKAN AL-SAFFA AL-MATMIZ — APPLICATION LOGIC
   ============================================================ */

// =================== STATE ===================
const allDealTypes = ['company', 'partnership', 'investor', 'brokerage'];
const totalSteps = 3;

let state = {
    currentView: 'dashboard',
    currentDealType: 'partnership',
    currentStep: 1
};

// =================== MOCK DATA (per deal type) ===================
const mockDealData = {
    company: {
        reference: 'C-2026-0142',
        vehicle: 'BMW X5 2023 - Marina Bay Blue',
        partyName: '—',
        partyLabel: 'Company-owned',
        salePrice: 125000,
        totalCosts: 101000,
        netProfit: 24000,
        distribution: [
            { name: 'الشركة', nameEn: 'Company', amount: 24000, percentage: 100, role: 'company' }
        ],
        accentColor: '#006e2b',
        accentClass: 'deal-company'
    },
    partnership: {
        reference: 'P-2026-0089',
        vehicle: 'BMW X5 2023 - Marina Bay Blue',
        partyName: 'محمد سعيد العتيبي',
        partyLabel: 'Partner • 60/40 split',
        salePrice: 125000,
        totalCosts: 101000,
        netProfit: 24000,
        distribution: [
            { name: 'الشركة', nameEn: 'Company', amount: 14400, percentage: 60, role: 'company' },
            { name: 'محمد سعيد العتيبي', nameEn: 'Partner', amount: 9600, percentage: 40, role: 'partner' }
        ],
        accentColor: '#225eab',
        accentClass: 'deal-partnership'
    },
    investor: {
        reference: 'I-2026-0034',
        vehicle: 'Mercedes C200 2023',
        partyName: 'خالد عبدالله المنصوري',
        partyLabel: 'Investor • Fixed Fee',
        salePrice: 220000,
        totalCosts: 195000,
        netProfit: 25000,
        serviceFee: 5000,
        distribution: [
            { name: 'الشركة', nameEn: 'Company Service Fee', amount: 5000, percentage: 20, role: 'company' },
            { name: 'خالد المنصوري', nameEn: 'Investor', amount: 20000, percentage: 80, role: 'investor' }
        ],
        accentColor: '#9333ea',
        accentClass: 'deal-investor'
    },
    brokerage: {
        reference: 'B-2026-0021',
        vehicle: 'Honda Accord 2021',
        partyName: 'فيصل القحطاني → سارة السديري',
        partyLabel: 'Brokerage Fee',
        salePrice: 78000,
        sellerPrice: 75000,
        totalCosts: 0,
        brokerageFee: 2500,
        netProfit: 2500,
        distribution: [
            { name: 'الشركة', nameEn: 'Brokerage Fee', amount: 2500, percentage: 100, role: 'company' }
        ],
        accentColor: '#f97316',
        accentClass: 'deal-brokerage'
    }
};

// =================== HELPERS ===================
function formatSAR(num) {
    return new Intl.NumberFormat('en-US').format(num) + ' SAR';
}

function getDealColorClass(type) {
    const map = {
        company: 'border-primary text-primary',
        partnership: 'border-secondary text-secondary',
        investor: 'border-purple-600 text-purple-600',
        brokerage: 'border-orange-500 text-orange-500'
    };
    return map[type] || map.partnership;
}

function getDealBgColorClass(type) {
    const map = {
        company: 'bg-primary',
        partnership: 'bg-secondary',
        investor: 'bg-purple-600',
        brokerage: 'bg-orange-500'
    };
    return map[type] || map.partnership;
}

// =================== VIEW SWITCHING (SPA) ===================
function switchView(viewName) {
    state.currentView = viewName;

    document.querySelectorAll('.view-section').forEach(view => {
        view.classList.remove('active');
    });
    const targetView = document.getElementById('view-' + viewName);
    if (targetView) targetView.classList.add('active');

    // Update sidebar active state
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active', 'text-white');
        link.classList.add('text-white/60');
    });
    const activeNav = document.getElementById('nav-' + viewName);
    if (activeNav) {
        activeNav.classList.add('active', 'text-white');
        activeNav.classList.remove('text-white/60');
    }

    // Reset wizard if entering it
    if (viewName === 'wizard') {
        state.currentStep = 1;
        updateWizardUI();
    }

    // Scroll top
    window.scrollTo(0, 0);
}

// =================== WIZARD START ===================
function startWizard(dealType) {
    switchView('wizard');
    selectDealType(dealType);
}

// =================== DEAL TYPE SELECTION (Step 1) ===================
function selectDealType(type) {
    state.currentDealType = type;

    allDealTypes.forEach(t => {
        const card = document.getElementById(`card-${t}`);
        const check = document.getElementById(`check-${t}`);
        const form = document.getElementById(`form-${t}`);

        if (card && check) {
            card.classList.add('opacity-60', 'border-transparent');
            card.classList.remove(
                'card-active-company',
                'card-active-partnership',
                'card-active-investor',
                'card-active-brokerage'
            );
            check.classList.add('hidden');

            if (t === type) {
                card.classList.remove('opacity-60', 'border-transparent');
                card.classList.add(`card-active-${type}`);
                check.classList.remove('hidden');
            }
        }

        if (form) {
            if (t === type) {
                form.classList.remove('hidden');
            } else {
                form.classList.add('hidden');
            }
        }
    });

    // Update vehicle info section header color
    const vInfo = document.getElementById('vehicle-info-border');
    if (vInfo) {
        vInfo.className = 'section-header';
        if (type !== 'company') vInfo.classList.add(type);
    }

    // If currently on Step 3, refresh the profit preview
    if (state.currentStep === 3) {
        renderStep3Content();
    }
}

// =================== WIZARD NAVIGATION ===================
function updateWizardUI() {
    // Show only the active step content
    for (let i = 1; i <= totalSteps; i++) {
        const el = document.getElementById(`step-${i}`);
        if (el) {
            if (i === state.currentStep) el.classList.add('active');
            else el.classList.remove('active');
        }
    }

    // Step indicators
    for (let i = 1; i <= totalSteps; i++) {
        const ind = document.getElementById(`indicator-${i}`);
        if (!ind) continue;
        ind.classList.remove('pending', 'active', 'completed');
        if (i < state.currentStep) ind.classList.add('completed');
        else if (i === state.currentStep) ind.classList.add('active');
        else ind.classList.add('pending');
    }

    // Progress bar fill
    const progress = ((state.currentStep - 1) / (totalSteps - 1)) * 100;
    const pb = document.getElementById('progress-bar');
    if (pb) pb.style.width = `${progress}%`;

    // Step title
    const title = document.getElementById('step-title');
    if (title) {
        const titles = {
            1: 'الخطوة 1 - نوع الصفقة والأطراف <span class="text-gray-400 text-lg font-normal en-text mr-2">Step 1 — Deal Type & Parties</span>',
            2: 'الخطوة 2 - التكاليف <span class="text-gray-400 text-lg font-normal en-text mr-2">Step 2 — Costs</span>',
            3: 'الخطوة 3 - البيع والربح <span class="text-gray-400 text-lg font-normal en-text mr-2">Step 3 — Sale & Profit</span>'
        };
        title.innerHTML = titles[state.currentStep];
    }

    // Bottom action buttons
    const btnPrev = document.getElementById('btn-prev');
    const spacerPrev = document.getElementById('spacer-prev');
    const btnNext = document.getElementById('btn-next');
    const btnApprove = document.getElementById('btn-approve');

    if (btnPrev && btnNext && btnApprove) {
        if (state.currentStep === 1) {
            btnPrev.classList.add('hidden');
            spacerPrev.classList.remove('hidden');
            btnNext.classList.remove('hidden');
            btnApprove.classList.add('hidden');
        } else if (state.currentStep === totalSteps) {
            btnPrev.classList.remove('hidden');
            spacerPrev.classList.add('hidden');
            btnNext.classList.add('hidden');
            btnApprove.classList.remove('hidden');
        } else {
            btnPrev.classList.remove('hidden');
            spacerPrev.classList.add('hidden');
            btnNext.classList.remove('hidden');
            btnApprove.classList.add('hidden');
        }
    }

    // Render Step 2 / Step 3 content if reached
    if (state.currentStep === 2) renderStep2Content();
    if (state.currentStep === 3) renderStep3Content();

    window.scrollTo(0, 0);
}

function nextStep() {
    if (state.currentStep < totalSteps) {
        state.currentStep++;
        updateWizardUI();
    }
}

function prevStep() {
    if (state.currentStep > 1) {
        state.currentStep--;
        updateWizardUI();
    }
}

// =================== STEP 2 — COSTS RENDERING ===================
function renderStep2Content() {
    const container = document.getElementById('step-2');
    if (!container) return;

    const data = mockDealData[state.currentDealType];
    const dealColorClass = state.currentDealType === 'partnership' ? 'partnership' :
                           state.currentDealType === 'investor' ? 'investor' :
                           state.currentDealType === 'brokerage' ? 'brokerage' : '';

    // Brokerage doesn't really track costs the same way
    const isBrokerage = state.currentDealType === 'brokerage';

    container.innerHTML = `
        <!-- Deal Context Strip -->
        <div class="bg-surface-low rounded-lg p-4 mb-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <span class="px-3 py-1 ${getDealBgColorClass(state.currentDealType)} bg-opacity-10 ${getDealColorClass(state.currentDealType).split(' ')[1]} rounded-full text-xs font-bold">
                    ${state.currentDealType === 'company' ? 'سيارة شركة' : state.currentDealType === 'partnership' ? 'شراكة' : state.currentDealType === 'investor' ? 'مستثمر' : 'وساطة'}
                </span>
                <span class="text-sm font-bold en-text text-gray-600">${data.reference}</span>
                <span class="text-sm en-text text-onsurface">${data.vehicle}</span>
            </div>
            <div class="text-xs text-gray-500">${data.partyLabel}</div>
        </div>

        ${isBrokerage ? renderBrokerageCostNotice() : renderRegularCostsContent()}
    `;
}

function renderBrokerageCostNotice() {
    return `
        <div class="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 text-3xl mx-auto mb-4">
                <i class="fa-solid fa-circle-info"></i>
            </div>
            <h3 class="text-lg font-bold text-onsurface mb-2">صفقات الوساطة لا تتطلب تسجيل تكاليف</h3>
            <p class="text-sm text-gray-600 en-text mb-4">Brokerage deals do not require cost tracking</p>
            <p class="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                السيارة ليست ملك الشركة، ولا تدخل المخزون. الإيراد الوحيد من هذه الصفقة هو أتعاب الوساطة المحددة في الخطوة الأولى.
            </p>
            <button onclick="nextStep()" class="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg font-bold text-sm hover:bg-orange-600 transition">
                الانتقال للخطوة التالية <i class="fa-solid fa-arrow-left mr-2"></i>
            </button>
        </div>
    `;
}

function renderRegularCostsContent() {
    return `
        <!-- Total Cost Summary Card -->
        <div class="bg-surface-lowest rounded-xl shadow-premium p-6 mb-6">
            <div class="flex items-center gap-6">
                <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl shrink-0">
                    <i class="fa-solid fa-receipt"></i>
                </div>
                <div class="flex-grow">
                    <p class="text-xs font-bold text-gray-500 mb-1">المجموع الكلي / Total Costs</p>
                    <h3 class="text-3xl font-bold en-text text-onsurface">101,000 SAR</h3>
                    <p class="text-xs text-gray-400 mt-1">5 بنود تكلفة / 5 cost items</p>
                </div>
                <div class="flex-1 max-w-md">
                    <div class="stack-bar mb-3">
                        <div class="stack-bar-segment bg-blue-600" style="width: 94.1%;">94%</div>
                        <div class="stack-bar-segment bg-orange-500" style="width: 3.5%;"></div>
                        <div class="stack-bar-segment bg-cyan-500" style="width: 1.2%;"></div>
                        <div class="stack-bar-segment bg-purple-500" style="width: 0.8%;"></div>
                        <div class="stack-bar-segment bg-gray-400" style="width: 0.4%;"></div>
                    </div>
                    <div class="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-gray-500">
                        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-600"></span> سعر الشراء</span>
                        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-500"></span> الإصلاح</span>
                        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-cyan-500"></span> النقل</span>
                        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-purple-500"></span> التجهيز</span>
                        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-400"></span> أخرى</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Cost Form -->
        <div class="bg-surface-lowest rounded-xl shadow-premium p-6 mb-6">
            <div class="section-header">
                <h3>إضافة تكلفة جديدة <span class="text-gray-400 text-sm font-normal en-text mr-2">Add New Cost</span></h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 mb-1">نوع التكلفة / Type</label>
                    <select class="form-input w-full rounded-md py-2 px-3 text-sm font-bold">
                        <option>الإصلاح / Repair</option>
                        <option>النقل / Transport</option>
                        <option>التجهيز / Preparation</option>
                        <option>سعر الشراء / Purchase</option>
                        <option>أخرى / Other</option>
                    </select>
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 mb-1">المبلغ / Amount</label>
                    <input type="text" placeholder="0.00" class="form-input w-full rounded-md py-2 px-3 text-sm en-text font-bold text-left" dir="ltr">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 mb-1">التاريخ / Date</label>
                    <input type="text" value="2026-04-08" class="form-input w-full rounded-md py-2 px-3 text-sm en-text font-bold text-left" dir="ltr">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-gray-500 mb-1">المورد / Supplier</label>
                    <input type="text" placeholder="اختياري" class="form-input w-full rounded-md py-2 px-3 text-sm">
                </div>
                <button class="bg-primary text-white rounded-lg py-2.5 px-4 font-bold text-sm hover:bg-green-700 transition">
                    <i class="fa-solid fa-plus ml-1"></i> إضافة
                </button>
            </div>
        </div>

        <!-- Cost List Table -->
        <div class="bg-surface-lowest rounded-xl shadow-premium p-6">
            <div class="flex items-center justify-between mb-4">
                <div class="section-header" style="margin-bottom: 0;">
                    <h3>قائمة التكاليف <span class="text-gray-400 text-sm font-normal en-text mr-2">Cost List</span></h3>
                </div>
                <span class="text-xs text-gray-400">5 بنود مسجلة</span>
            </div>
            <table class="tonal-table w-full text-right text-sm">
                <thead>
                    <tr class="text-gray-500">
                        <th>#</th>
                        <th>النوع / Type</th>
                        <th>الوصف / Description</th>
                        <th>المورد / Supplier</th>
                        <th>التاريخ / Date</th>
                        <th class="text-left">المبلغ / Amount</th>
                        <th>مرفق</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="dummy-clickable">
                        <td class="text-gray-400 en-text">1</td>
                        <td><span class="status-pill badge-purchase">سعر الشراء</span></td>
                        <td class="text-gray-600">شراء من المعرض</td>
                        <td class="text-gray-600">معرض النجم</td>
                        <td class="en-text text-gray-500">2026-03-28</td>
                        <td class="font-bold en-text text-onsurface text-left">95,000 SAR</td>
                        <td><i class="fa-solid fa-paperclip text-gray-400"></i></td>
                    </tr>
                    <tr class="dummy-clickable">
                        <td class="text-gray-400 en-text">2</td>
                        <td><span class="status-pill badge-transport">النقل</span></td>
                        <td class="text-gray-600">نقل من جدة إلى الرياض</td>
                        <td class="text-gray-600">شركة النقل السريع</td>
                        <td class="en-text text-gray-500">2026-03-30</td>
                        <td class="font-bold en-text text-onsurface text-left">1,200 SAR</td>
                        <td><i class="fa-solid fa-paperclip text-gray-400"></i></td>
                    </tr>
                    <tr class="dummy-clickable">
                        <td class="text-gray-400 en-text">3</td>
                        <td><span class="status-pill badge-repair">الإصلاح</span></td>
                        <td class="text-gray-600">إصلاح نظام المكيف</td>
                        <td class="text-gray-600">ورشة الخبراء</td>
                        <td class="en-text text-gray-500">2026-04-05</td>
                        <td class="font-bold en-text text-onsurface text-left">3,500 SAR</td>
                        <td><i class="fa-solid fa-paperclip text-gray-400"></i></td>
                    </tr>
                    <tr class="dummy-clickable">
                        <td class="text-gray-400 en-text">4</td>
                        <td><span class="status-pill badge-preparation">التجهيز</span></td>
                        <td class="text-gray-600">تنظيف وتلميع</td>
                        <td class="text-gray-600">مغسلة المحترفة</td>
                        <td class="en-text text-gray-500">2026-04-06</td>
                        <td class="font-bold en-text text-onsurface text-left">800 SAR</td>
                        <td><span class="text-gray-300">—</span></td>
                    </tr>
                    <tr class="dummy-clickable">
                        <td class="text-gray-400 en-text">5</td>
                        <td><span class="status-pill badge-other">أخرى</span></td>
                        <td class="text-gray-600">رسوم استخراج لوحة</td>
                        <td class="text-gray-300">—</td>
                        <td class="en-text text-gray-500">2026-04-06</td>
                        <td class="font-bold en-text text-onsurface text-left">500 SAR</td>
                        <td><i class="fa-solid fa-paperclip text-gray-400"></i></td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" class="text-left font-bold text-onsurface" style="background: #f7f9fc;">المجموع / Total</td>
                        <td class="font-bold text-xl en-text text-primary text-left" style="background: #f7f9fc;">101,000 SAR</td>
                        <td style="background: #f7f9fc;"></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// =================== STEP 3 — SALE & PROFIT PREVIEW ===================
function renderStep3Content() {
    const container = document.getElementById('step-3');
    if (!container) return;

    const data = mockDealData[state.currentDealType];
    const dealColorClass = state.currentDealType === 'partnership' ? 'partnership' :
                           state.currentDealType === 'investor' ? 'investor' :
                           state.currentDealType === 'brokerage' ? 'brokerage' : '';

    container.innerHTML = `
        <!-- Deal Context Strip -->
        <div class="bg-surface-low rounded-lg p-4 mb-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
                <span class="px-3 py-1 ${getDealBgColorClass(state.currentDealType)} bg-opacity-10 ${getDealColorClass(state.currentDealType).split(' ')[1]} rounded-full text-xs font-bold">
                    ${state.currentDealType === 'company' ? 'سيارة شركة' : state.currentDealType === 'partnership' ? 'شراكة' : state.currentDealType === 'investor' ? 'مستثمر' : 'وساطة'}
                </span>
                <span class="text-sm font-bold en-text text-gray-600">${data.reference}</span>
                <span class="text-sm en-text text-onsurface">${data.vehicle}</span>
                ${data.partyName !== '—' ? `<span class="text-sm text-gray-500">• ${data.partyName}</span>` : ''}
            </div>
            <div class="text-xs text-gray-500">${data.partyLabel}</div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- LEFT (in RTL: right) — PROFIT PREVIEW HERO CARD (2/3 width) -->
            <div class="lg:col-span-2">
                <div class="profit-hero-card ${data.accentClass} rounded-2xl p-8">
                    
                    <!-- Card Header -->
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 ${getDealBgColorClass(state.currentDealType)} bg-opacity-10 rounded-full flex items-center justify-center ${getDealColorClass(state.currentDealType).split(' ')[1]} text-xl">
                                <i class="fa-solid fa-calculator"></i>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-onsurface">معاينة توزيع الربح</h3>
                                <p class="text-xs text-gray-500 en-text">Profit Distribution Preview</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 text-xs text-gray-500">
                            <span class="live-pulse"></span>
                            <span>تحديث مباشر / Live</span>
                        </div>
                    </div>

                    ${renderCalculationBlock(data)}

                    <div class="border-t border-gray-100 my-6"></div>

                    ${renderDistributionBlock(data)}

                    <div class="settlement-note mt-6">
                        <i class="fa-solid fa-circle-info ml-2"></i>
                        ${getSettlementText(state.currentDealType)}
                    </div>
                </div>
            </div>

            <!-- RIGHT (in RTL: left) — SALE FORM + COST SUMMARY -->
            <div class="space-y-6">
                
                <!-- Sale Information Form -->
                <div class="bg-surface-lowest rounded-xl shadow-premium p-6">
                    <div class="section-header ${dealColorClass}">
                        <h3>بيانات البيع <span class="text-gray-400 text-sm font-normal en-text mr-2">Sale Info</span></h3>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-[10px] font-bold text-gray-500 mb-1">المشتري / Buyer</label>
                            <input type="text" value="أحمد العنيزي" class="form-input w-full rounded-md py-2.5 px-3 text-sm font-bold">
                        </div>
                        
                        <div>
                            <label class="block text-[10px] font-bold text-gray-500 mb-1">سعر البيع / Sale Price *</label>
                            <input type="text" value="${formatSAR(data.salePrice).replace(' SAR', '')}" class="form-input w-full rounded-md py-3 px-3 text-lg en-text font-bold text-left" dir="ltr">
                        </div>
                        
                        <div>
                            <label class="block text-[10px] font-bold text-gray-500 mb-1">طريقة الدفع / Payment</label>
                            <select class="form-input w-full rounded-md py-2.5 px-3 text-sm font-bold">
                                <option>تحويل بنكي / Bank Transfer</option>
                                <option>نقد / Cash</option>
                                <option>شبكة / POS</option>
                                <option>تقسيط / Installments</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-[10px] font-bold text-gray-500 mb-1">التاريخ / Date</label>
                            <input type="text" value="2026-04-08" class="form-input w-full rounded-md py-2.5 px-3 text-sm en-text font-bold text-left" dir="ltr">
                        </div>
                    </div>
                </div>

                <!-- Cost Summary Read-Only -->
                ${state.currentDealType !== 'brokerage' ? renderCostSummary(data) : renderBrokerageBreakdown(data)}
                
            </div>
        </div>

        <!-- Warning Banner -->
        <div class="warning-banner mt-6">
            <i class="fa-solid fa-triangle-exclamation text-xl text-orange-600"></i>
            <div class="flex-1 text-sm">
                <p class="font-bold">تنبيه: بعد الاعتماد لا يمكن تعديل الصفقة</p>
                <p class="text-xs en-text mt-0.5 text-orange-700">Once approved, the deal cannot be modified. Settlement documents will be generated automatically.</p>
            </div>
        </div>
    `;
}

function renderCalculationBlock(data) {
    if (state.currentDealType === 'brokerage') {
        return `
            <div class="grid grid-cols-3 gap-6 items-end">
                <div class="text-center">
                    <p class="text-xs font-bold text-gray-500 mb-2">سعر البيع للمشتري<br><span class="en-text">Buyer Price</span></p>
                    <p class="calc-number calc-number-md text-onsurface">78,000</p>
                    <p class="text-xs en-text text-gray-400 mt-1">SAR</p>
                </div>
                <div class="text-center">
                    <p class="text-xs font-bold text-gray-500 mb-2">سعر البائع<br><span class="en-text">Seller Price</span></p>
                    <p class="calc-number calc-number-md text-orange-600">75,000</p>
                    <p class="text-xs en-text text-gray-400 mt-1">SAR</p>
                </div>
                <div class="text-center bg-orange-50 rounded-xl p-4 -mx-2">
                    <p class="text-xs font-bold text-orange-700 mb-2">أتعاب الشركة<br><span class="en-text">Company Fee</span></p>
                    <p class="calc-number calc-number-lg text-orange-600">2,500</p>
                    <p class="text-xs en-text text-orange-500 mt-1">SAR</p>
                </div>
            </div>
        `;
    }

    return `
        <div class="grid grid-cols-3 gap-6 items-end">
            <div class="text-center">
                <p class="text-xs font-bold text-gray-500 mb-2">سعر البيع<br><span class="en-text">Sale Price</span></p>
                <p class="calc-number calc-number-md text-onsurface">${formatSAR(data.salePrice).replace(' SAR', '')}</p>
                <p class="text-xs en-text text-gray-400 mt-1">SAR</p>
            </div>
            <div class="text-center">
                <p class="text-xs font-bold text-gray-500 mb-2">ناقص التكاليف<br><span class="en-text">Less Costs</span></p>
                <p class="calc-number calc-number-md text-orange-600">−${formatSAR(data.totalCosts).replace(' SAR', '')}</p>
                <p class="text-xs en-text text-gray-400 mt-1">SAR</p>
            </div>
            <div class="text-center bg-green-50 rounded-xl p-4 -mx-2">
                <p class="text-xs font-bold text-green-700 mb-2">صافي الربح<br><span class="en-text">Net Profit</span></p>
                <p class="calc-number calc-number-lg text-green-600">${formatSAR(data.netProfit).replace(' SAR', '')}</p>
                <p class="text-xs en-text text-green-500 mt-1">SAR</p>
            </div>
        </div>
    `;
}

function renderDistributionBlock(data) {
    let title = `
        <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-bold text-onsurface">توزيع الربح <span class="en-text text-xs text-gray-400 mr-2">Distribution</span></h4>
        </div>
    `;

    let tilesHtml = '';
    let barHtml = '';

    if (state.currentDealType === 'company') {
        // Company gets everything
        tilesHtml = `
            <div class="dist-tile dist-tile-company">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                            <i class="fa-solid fa-building"></i>
                        </div>
                        <div>
                            <p class="font-bold text-onsurface">الشركة</p>
                            <p class="text-xs text-gray-500 en-text">Company • 100% of profit</p>
                        </div>
                    </div>
                    <p class="calc-number calc-number-md text-primary">24,000 SAR</p>
                </div>
            </div>
        `;
        barHtml = `
            <div class="stack-bar mt-4">
                <div class="stack-bar-segment bg-primary" style="width: 100%;">100% الشركة</div>
            </div>
        `;
    }

    if (state.currentDealType === 'partnership') {
        tilesHtml = `
            <div class="grid grid-cols-2 gap-4">
                <div class="dist-tile dist-tile-company">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-secondary text-white rounded-full flex items-center justify-center">
                            <i class="fa-solid fa-building"></i>
                        </div>
                        <div>
                            <p class="font-bold text-onsurface text-sm">الشركة / Company</p>
                            <p class="text-[10px] text-gray-500 en-text">60% × 24,000</p>
                        </div>
                    </div>
                    <p class="calc-number text-secondary" style="font-size: 1.75rem;">14,400 SAR</p>
                </div>
                <div class="dist-tile dist-tile-partner">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center font-bold en-text">
                            MA
                        </div>
                        <div>
                            <p class="font-bold text-onsurface text-sm">محمد العتيبي</p>
                            <p class="text-[10px] text-gray-500 en-text">40% × 24,000</p>
                        </div>
                    </div>
                    <p class="calc-number text-blue-500" style="font-size: 1.75rem;">9,600 SAR</p>
                </div>
            </div>
        `;
        barHtml = `
            <div class="stack-bar mt-4">
                <div class="stack-bar-segment bg-secondary" style="width: 60%;">14,400</div>
                <div class="stack-bar-segment bg-blue-300" style="width: 40%;">9,600</div>
            </div>
        `;
    }

    if (state.currentDealType === 'investor') {
        tilesHtml = `
            <div class="grid grid-cols-2 gap-4">
                <div class="dist-tile dist-tile-investor">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center font-bold en-text">
                            KM
                        </div>
                        <div>
                            <p class="font-bold text-onsurface text-sm">خالد المنصوري</p>
                            <p class="text-[10px] text-gray-500 en-text">Investor • Net Profit</p>
                        </div>
                    </div>
                    <p class="calc-number text-purple-600" style="font-size: 1.75rem;">20,000 SAR</p>
                </div>
                <div class="dist-tile" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                            <i class="fa-solid fa-building"></i>
                        </div>
                        <div>
                            <p class="font-bold text-onsurface text-sm">الشركة</p>
                            <p class="text-[10px] text-gray-500 en-text">Service Fee (Fixed)</p>
                        </div>
                    </div>
                    <p class="calc-number text-primary" style="font-size: 1.75rem;">5,000 SAR</p>
                </div>
            </div>
        `;
        barHtml = `
            <div class="stack-bar mt-4">
                <div class="stack-bar-segment bg-purple-500" style="width: 80%;">المستثمر 20,000</div>
                <div class="stack-bar-segment bg-primary" style="width: 20%;">الشركة 5,000</div>
            </div>
        `;
    }

    if (state.currentDealType === 'brokerage') {
        tilesHtml = `
            <div class="dist-tile dist-tile-broker">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center">
                            <i class="fa-solid fa-arrow-right-arrow-left"></i>
                        </div>
                        <div>
                            <p class="font-bold text-onsurface">الشركة - أتعاب وساطة</p>
                            <p class="text-xs text-gray-500 en-text">Brokerage Fee Only</p>
                        </div>
                    </div>
                    <p class="calc-number calc-number-md text-orange-600">2,500 SAR</p>
                </div>
                <div class="mt-4 text-xs text-gray-600 leading-relaxed border-t border-orange-200 pt-3">
                    <i class="fa-solid fa-circle-info text-orange-500 ml-1"></i>
                    السيارة ليست ملك الشركة. لن تظهر في المخزون أو في إيرادات البيع.
                </div>
            </div>
        `;
        barHtml = '';
    }

    return title + tilesHtml + barHtml;
}

function getSettlementText(dealType) {
    const texts = {
        company: 'بعد الاعتماد سيتم إنشاء فاتورة بيع وقيد محاسبي تلقائياً',
        partnership: 'بعد الاعتماد سيتم إنشاء سند تسوية للشريك تلقائياً',
        investor: 'بعد الاعتماد سيتم إنشاء كشف صافي للمستثمر وفاتورة أتعاب الشركة',
        brokerage: 'بعد الاعتماد سيتم إنشاء فاتورة أتعاب الوساطة فقط (لا فاتورة بيع)'
    };
    return texts[dealType] || texts.partnership;
}

function renderCostSummary(data) {
    return `
        <div class="cost-summary-card">
            <div class="flex items-center justify-between mb-4">
                <h4 class="font-bold text-onsurface text-sm">ملخص التكاليف</h4>
                <a href="#" onclick="prevStep(); return false;" class="text-xs text-primary font-bold hover:underline">
                    <i class="fa-solid fa-pen ml-1"></i> تعديل
                </a>
            </div>
            <div class="cost-summary-row">
                <span class="text-gray-600">سعر الشراء</span>
                <span class="font-bold en-text">95,000 SAR</span>
            </div>
            <div class="cost-summary-row">
                <span class="text-gray-600">النقل</span>
                <span class="font-bold en-text">1,200 SAR</span>
            </div>
            <div class="cost-summary-row">
                <span class="text-gray-600">الإصلاح</span>
                <span class="font-bold en-text">3,500 SAR</span>
            </div>
            <div class="cost-summary-row">
                <span class="text-gray-600">التجهيز</span>
                <span class="font-bold en-text">800 SAR</span>
            </div>
            <div class="cost-summary-row">
                <span class="text-gray-600">أخرى</span>
                <span class="font-bold en-text">500 SAR</span>
            </div>
            <div class="cost-summary-row total">
                <span>الإجمالي / Total</span>
                <span class="text-primary en-text">101,000 SAR</span>
            </div>
        </div>
    `;
}

function renderBrokerageBreakdown(data) {
    return `
        <div class="cost-summary-card">
            <div class="mb-4">
                <h4 class="font-bold text-onsurface text-sm">تفاصيل الصفقة</h4>
            </div>
            <div class="cost-summary-row">
                <span class="text-gray-600">سعر البائع</span>
                <span class="font-bold en-text">75,000 SAR</span>
            </div>
            <div class="cost-summary-row">
                <span class="text-gray-600">سعر المشتري</span>
                <span class="font-bold en-text">78,000 SAR</span>
            </div>
            <div class="cost-summary-row">
                <span class="text-gray-600">الفرق (للبائع)</span>
                <span class="font-bold en-text text-gray-500">3,000 SAR</span>
            </div>
            <div class="cost-summary-row total">
                <span>دخل الشركة</span>
                <span class="text-orange-600 en-text">2,500 SAR</span>
            </div>
        </div>
    `;
}

// =================== FINANCE — VOUCHER LOGIC (kept from original) ===================
function switchVoucherTab(type) {
    const tabReceipt = document.getElementById('tab-receipt');
    const tabPayment = document.getElementById('tab-payment');
    const formContainer = document.getElementById('voucher-form-container');
    const title = document.getElementById('voucher-title');
    const accountLabel = document.getElementById('account-label');
    const amountInput = document.getElementById('amount-input');
    const saveBtn = document.getElementById('save-btn');
    const processTypeSelect = document.getElementById('process-type-select');
    const successMessage = document.getElementById('success-message');

    if (successMessage) successMessage.classList.add('hidden');

    if (type === 'receipt') {
        tabReceipt.classList.add('border-green-500');
        tabReceipt.classList.remove('border-transparent', 'opacity-60');
        tabPayment.classList.remove('border-red-500');
        tabPayment.classList.add('border-transparent', 'opacity-60');
        formContainer.classList.remove('border-red-500');
        formContainer.classList.add('border-green-500');
        title.innerHTML = 'إنشاء سند قبض جديد <span class="text-gray-400 text-sm font-normal en-text mr-2">New Receipt</span>';
        accountLabel.innerHTML = 'الحساب المستلم / <span class="en-text">Receiving Account</span> *';
        amountInput.classList.remove('text-red-600');
        amountInput.classList.add('text-green-600');
        saveBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        saveBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        processTypeSelect.innerHTML = `
            <option>بيع سيارة شركة</option>
            <option>دفعة من شريك (Partnership)</option>
            <option>أتعاب وساطة (Brokerage Fee)</option>
            <option>دفعة صيانة</option>
        `;
    } else {
        tabPayment.classList.add('border-red-500');
        tabPayment.classList.remove('border-transparent', 'opacity-60');
        tabReceipt.classList.remove('border-green-500');
        tabReceipt.classList.add('border-transparent', 'opacity-60');
        formContainer.classList.remove('border-green-500');
        formContainer.classList.add('border-red-500');
        title.innerHTML = 'إنشاء سند صرف جديد <span class="text-gray-400 text-sm font-normal en-text mr-2">New Payment</span>';
        accountLabel.innerHTML = 'الحساب الصارف / <span class="en-text">Paying Account</span> *';
        amountInput.classList.remove('text-green-600');
        amountInput.classList.add('text-red-600');
        saveBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        saveBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        processTypeSelect.innerHTML = `
            <option>شراء سيارة شركة</option>
            <option>سداد تكاليف إصلاح (Repair Cost)</option>
            <option>تسوية مستثمر (Investor Payout)</option>
            <option>مصروفات إدارية (Admin Expenses)</option>
        `;
    }
}

function saveVoucher() {
    const btn = document.getElementById('save-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        const successMessage = document.getElementById('success-message');
        if (successMessage) {
            successMessage.classList.remove('hidden');
            setTimeout(() => successMessage.classList.add('hidden'), 3000);
        }
    }, 1000);
}

// =================== APPROVE & LOCK ===================
function approveAndLock() {
    // Show confirmation dialog
    const confirmed = confirm('هل أنت متأكد من اعتماد وقفل الصفقة؟\n\nبعد الاعتماد لا يمكن التعديل.');
    if (confirmed) {
        alert('✓ تم اعتماد الصفقة بنجاح!\nسيتم إنشاء المستندات تلقائياً.');
        switchView('dashboard');
    }
}

// =================== EXPOSE FUNCTIONS TO WINDOW ===================
// Inline onclick="..." handlers can only call functions in the global scope.
// Modern browsers + CDN scripts can isolate this script's scope, so we
// explicitly expose every function the HTML calls via onclick.
window.switchView = switchView;
window.startWizard = startWizard;
window.selectDealType = selectDealType;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.approveAndLock = approveAndLock;
window.switchVoucherTab = switchVoucherTab;
window.saveVoucher = saveVoucher;

// =================== INIT ===================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize wizard UI
    updateWizardUI();
    // Initialize default deal type selection
    selectDealType('partnership');
});
