// Concept Data
const conceptData = {
    neurons: {
        title: "نورون‌ها",
        content: `
            <div class="concept-content">
                <p>نورون‌ها واحدهای محاسباتی پایه در شبکه‌های عصبی مصنوعی هستند که از نورون‌های بیولوژیکی الهام گرفته‌اند. هر نورون مصنوعی:</p>
                <ul>
                    <li>ورودی‌ها را از نورون‌های قبلی دریافت می‌کند</li>
                    <li>به هر ورودی وزن‌های خاص اختصاص می‌دهد</li>
                    <li>مقدار بایاس را اضافه می‌کند</li>
                    <li>یک تابع فعال‌سازی را اعمال می‌کند</li>
                    <li>نتیجه را به عنوان خروجی به نورون‌های لایه بعدی ارسال می‌کند</li>
                </ul>
                
                <h3>ساختار نورون</h3>
                <p>یک نورون مصنوعی معمولی شامل موارد زیر است:</p>
                <div class="concept-highlight">
                    <p><strong>ورودی‌ها (x<sub>i</sub>):</strong> داده‌ها یا سیگنال‌هایی که وارد نورون می‌شوند.</p>
                    <p><strong>وزن‌ها (w<sub>i</sub>):</strong> پارامترهای قابل تنظیم که اهمیت هر ورودی را تعیین می‌کنند.</p>
                    <p><strong>بایاس (b):</strong> یک پارامتر قابل تنظیم که به نورون اجازه می‌دهد حتی بدون ورودی فعال شود.</p>
                    <p><strong>تابع فعال‌سازی (φ):</strong> تابعی که غیرخطی بودن را به شبکه اضافه می‌کند.</p>
                </div>
                
                <h3>فرمول ریاضی نورون</h3>
                <p>خروجی یک نورون را می‌توان به صورت زیر نمایش داد:</p>
                <pre>y = φ(Σ(w_i * x_i) + b)</pre>
                
                <h3>اهمیت نورون‌ها</h3>
                <p>نورون‌ها با الگوهای پیچیده را شناسایی می‌کنند و با یکدیگر کار می‌کنند تا دانش را در سراسر شبکه توزیع کنند. توانایی شبکه برای یادگیری بستگی به توانایی تنظیم وزن‌های اتصالات بین نورون‌ها دارد.</p>
            </div>
        `
    },
    weights: {
        title: "وزن‌ها و بایاس‌ها",
        content: `
            <div class="concept-content">
                <p>وزن‌ها و بایاس‌ها پارامترهای قابل تنظیم در شبکه عصبی هستند که در طول فرآیند آموزش تنظیم می‌شوند.</p>
                
                <h3>وزن‌ها</h3>
                <p>وزن‌ها قدرت اتصال بین نورون‌ها را تعیین می‌کنند. آنها نشان می‌دهند که هر ورودی چه مقدار روی خروجی نورون تأثیر می‌گذارد:</p>
                <ul>
                    <li>وزن‌های بزرگ مثبت: رابطه قوی مثبت</li>
                    <li>وزن‌های بزرگ منفی: رابطه قوی منفی (بازدارنده)</li>
                    <li>وزن‌های نزدیک به صفر: رابطه ضعیف</li>
                </ul>
                
                <h3>بایاس‌ها</h3>
                <p>بایاس یک مقدار اضافی است که به نورون اجازه می‌دهد حتی وقتی همه ورودی‌ها صفر هستند، فعال شود:</p>
                <div class="concept-highlight">
                    <p>بایاس به نورون انعطاف‌پذیری می‌دهد - مانند تنظیم آستانه فعال‌سازی آن عمل می‌کند.</p>
                </div>
                
                <h3>یادگیری وزن‌ها و بایاس‌ها</h3>
                <p>در طول آموزش، الگوریتم‌هایی مانند انتشار معکوس برای تنظیم وزن‌ها و بایاس‌ها استفاده می‌شوند:</p>
                <pre>w_new = w_old - learning_rate * ∂E/∂w</pre>
                <p>که در آن:</p>
                <ul>
                    <li><code>learning_rate</code>: نرخ یادگیری (تعیین می‌کند چقدر سریع پارامترها تغییر کنند)</li>
                    <li><code>∂E/∂w</code>: مشتق خطا نسبت به وزن</li>
                </ul>
                
                <h3>مقداردهی اولیه و تنظیم</h3>
                <p>مقداردهی اولیه مناسب وزن‌ها و بایاس‌ها برای همگرایی سریع یادگیری بسیار مهم است. روش‌های مختلف مقداردهی اولیه مانند مقداردهی تصادفی، He، Xavier و غیره وجود دارد.</p>
            </div>
        `
    },
    activation: {
        title: "توابع فعال‌سازی",
        content: `
            <div class="concept-content">
                <p>توابع فعال‌سازی غیرخطی بودن را به شبکه‌های عصبی معرفی می‌کنند و به آنها امکان می‌دهند روابط پیچیده را یاد بگیرند. بدون توابع فعال‌سازی غیرخطی، یک شبکه عصبی صرفاً یک رگرسیون خطی خواهد بود.</p>
                
                <h3>توابع فعال‌سازی رایج</h3>
                
                <h3>سیگموید</h3>
                <p>خروجی را به محدوده (0,1) نگاشت می‌کند، مناسب برای احتمالات:</p>
                <pre>σ(x) = 1 / (1 + e^(-x))</pre>
                <p>مشکلات: اشباع گرادیان، خروجی غیر مرکزی</p>
                
                <h3>تانژانت هیپربولیک (tanh)</h3>
                <p>خروجی را به محدوده (-1,1) نگاشت می‌کند:</p>
                <pre>tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))</pre>
                <p>بهبود نسبت به سیگموید: خروجی مرکزی (میانگین صفر)</p>
                
                <h3>ReLU (Rectified Linear Unit)</h3>
                <p>ساده و محاسباتی کارآمد:</p>
                <pre>ReLU(x) = max(0, x)</pre>
                <div class="concept-highlight">
                    <p>مزایای ReLU: محاسبه آسان، همگرایی سریع، کاهش مشکل اشباع گرادیان</p>
                    <p>مشکل: نورون‌های مرده (وقتی خروجی همیشه صفر است)</p>
                </div>
                
                <h3>Leaky ReLU</h3>
                <p>برای رفع مشکل نورون‌های مرده:</p>
                <pre>LeakyReLU(x) = max(αx, x) حیث α یک عدد کوچک مثبت است</pre>
                
                <h3>Softmax</h3>
                <p>برای طبقه‌بندی چند کلاسه، خروجی‌ها را به توزیع احتمال تبدیل می‌کند:</p>
                <pre>softmax(x_i) = e^(x_i) / Σ(e^(x_j))</pre>
                
                <h3>انتخاب تابع فعال‌سازی مناسب</h3>
                <p>توابع فعال‌سازی مختلف برای لایه‌ها و کاربردهای مختلف مناسب هستند:</p>
                <ul>
                    <li>لایه‌های پنهان: اغلب ReLU یا انواع آن</li>
                    <li>لایه خروجی طبقه‌بندی دودویی: سیگموید</li>
                    <li>لایه خروجی طبقه‌بندی چند کلاسه: softmax</li>
                    <li>لایه خروجی رگرسیون: خطی</li>
                </ul>
            </div>
        `
    },
    backprop: {
        title: "انتشار معکوس",
        content: `
            <div class="concept-content">
                <p>انتشار معکوس (Backpropagation) الگوریتم کلیدی برای آموزش شبکه‌های عصبی است که به صورت کارآمد خطا را از خروجی به عقب منتشر می‌کند و وزن‌ها را تنظیم می‌نماید.</p>
                
                <h3>مفاهیم اصلی</h3>
                <p>انتشار معکوس از مشتق‌گیری زنجیره‌ای استفاده می‌کند تا تأثیر هر وزن بر خطای نهایی را محاسبه کند. این فرایند شامل دو مرحله اصلی است:</p>
                
                <h3>1. انتشار رو به جلو</h3>
                <ul>
                    <li>ورودی‌ها از طریق شبکه عبور داده می‌شوند</li>
                    <li>خروجی نهایی محاسبه می‌شود</li>
                    <li>خطا با مقایسه خروجی واقعی و خروجی مورد انتظار محاسبه می‌شود</li>
                </ul>
                
                <h3>2. انتشار رو به عقب</h3>
                <ul>
                    <li>خطا از لایه خروجی به عقب منتشر می‌شود</li>
                    <li>گرادیان برای هر وزن محاسبه می‌شود</li>
                    <li>وزن‌ها با استفاده از گرادیان‌ها به‌روزرسانی می‌شوند</li>
                </ul>
                
                <div class="concept-highlight">
                    <p>فرمول اصلی به‌روزرسانی وزن:</p>
                    <pre>w_new = w_old - η * ∂E/∂w</pre>
                    <p>که در آن η نرخ یادگیری است و ∂E/∂w مشتق تابع خطا نسبت به وزن است.</p>
                </div>
                
                <h3>چالش‌های انتشار معکوس</h3>
                <p>انتشار معکوس با چالش‌هایی روبروست:</p>
                <ul>
                    <li><strong>محو شدن گرادیان:</strong> گرادیان‌ها در شبکه‌های عمیق ممکن است بسیار کوچک شوند</li>
                    <li><strong>انفجار گرادیان:</strong> گرادیان‌ها ممکن است خیلی بزرگ شوند</li>
                    <li><strong>همگرایی کند:</strong> ممکن است به بهینه‌سازی کند منجر شود</li>
                </ul>
                
                <h3>بهبودهای الگوریتم</h3>
                <p>برای غلبه بر این چالش‌ها، الگوریتم‌های بهینه‌سازی پیشرفته‌تری توسعه یافته‌اند:</p>
                <ul>
                    <li>Momentum: برای تسریع همگرایی و جلوگیری از گیر افتادن در کمینه‌های محلی</li>
                    <li>RMSprop: برای مقیاس‌گذاری نرخ یادگیری بر اساس میانگین متحرک گرادیان‌ها</li>
                    <li>Adam: ترکیبی از Momentum و RMSprop</li>
                </ul>
                
                <p>انتشار معکوس، علیرغم سادگی نسبی، یکی از موفق‌ترین الگوریتم‌های یادگیری ماشین است که موفقیت یادگیری عمیق را ممکن ساخته است.</p>
            </div>
        `
    },
    cnn: {
        title: "شبکه‌های کانولوشنی",
        content: `
            <div class="concept-content">
                <p>شبکه‌های عصبی کانولوشنی (CNNs) نوعی از شبکه‌های عصبی هستند که برای پردازش داده‌های با ساختار شبکه‌ای مانند تصاویر طراحی شده‌اند. آنها در تشخیص اشیاء، طبقه‌بندی تصاویر و پردازش تصویر بسیار موفق بوده‌اند.</p>
                
                <h3>اجزای اصلی CNN</h3>
                
                <h3>1. لایه کانولوشن</h3>
                <p>این لایه از فیلترهایی استفاده می‌کند که روی تصویر ورودی حرکت می‌کنند تا ویژگی‌ها را استخراج کنند:</p>
                <ul>
                    <li>هر فیلتر یک الگوی خاص مانند لبه‌ها، بافت‌ها یا شکل‌های ساده را تشخیص می‌دهد</li>
                    <li>فیلترها پارامترهایی هستند که در طول آموزش یاد گرفته می‌شوند</li>
                    <li>خروجی، نقشه‌های ویژگی نامیده می‌شوند</li>
                </ul>
                
                <div class="concept-highlight">
                    <p>کانولوشن به CNN‌ها امکان می‌دهد ویژگی‌های فضایی را در نظر بگیرند و نسبت به جابجایی مقاوم باشند.</p>
                </div>
                
                <h3>2. لایه ادغام (Pooling)</h3>
                <p>لایه‌های ادغام ابعاد را کاهش می‌دهند و اطلاعات مهم را حفظ می‌کنند:</p>
                <ul>
                    <li><strong>Max Pooling:</strong> بیشترین مقدار در یک پنجره را انتخاب می‌کند</li>
                    <li><strong>Average Pooling:</strong> میانگین مقادیر در یک پنجره را محاسبه می‌کند</li>
                </ul>
                <p>مزایای ادغام:</p>
                <ul>
                    <li>کاهش پارامترها و محاسبات</li>
                    <li>کمک به مقاومت در برابر تغییرات کوچک و اختلالات</li>
                </ul>
                
                <h3>3. لایه‌های کاملاً متصل</h3>
                <p>پس از چندین لایه کانولوشن و ادغام، معمولاً یک یا چند لایه کاملاً متصل برای طبقه‌بندی نهایی استفاده می‌شود.</p>
                
                <h3>معماری‌های مشهور CNN</h3>
                <ul>
                    <li><strong>LeNet-5:</strong> اولین معماری CNN موفق برای تشخیص ارقام دست‌نویس</li>
                    <li><strong>AlexNet:</strong> برنده مسابقه ImageNet 2012، نقطه عطفی در یادگیری عمیق</li>
                    <li><strong>VGG:</strong> معماری ساده با لایه‌های عمیق</li>
                    <li><strong>ResNet:</strong> معرفی اتصالات میانبر برای آموزش شبکه‌های بسیار عمیق</li>
                </ul>
                
                <h3>کاربردها</h3>
                <p>CNNها در بسیاری از زمینه‌ها کاربرد دارند:</p>
                <ul>
                    <li>تشخیص چهره و اشیاء</li>
                    <li>خودروهای خودران</li>
                    <li>تشخیص پزشکی</li>
                    <li>پردازش زبان طبیعی</li>
                    <li>بینایی ماشین</li>
                </ul>
            </div>
        `
    },
    rnn: {
        title: "شبکه‌های بازگشتی",
        content: `
            <div class="concept-content">
                <p>شبکه‌های عصبی بازگشتی (RNNs) نوعی از شبکه‌های عصبی هستند که برای پردازش داده‌های توالی مانند متن، صدا یا سری‌های زمانی طراحی شده‌اند. ویژگی کلیدی RNNها حفظ حافظه‌ای از ورودی‌های قبلی است.</p>
                
                <h3>ساختار RNN</h3>
                <p>در یک RNN، خروجی فقط به ورودی فعلی بستگی ندارد بلکه به حالت‌های قبلی نیز وابسته است:</p>
                <pre>h_t = φ(W_{xh} x_t + W_{hh} h_{t-1} + b_h)</pre>
                <p>که در آن:</p>
                <ul>
                    <li><code>h_t</code>: حالت پنهان در زمان t</li>
                    <li><code>x_t</code>: ورودی در زمان t</li>
                    <li><code>W_{xh}</code>: وزن‌های ورودی-به-پنهان</li>
                    <li><code>W_{hh}</code>: وزن‌های پنهان-به-پنهان</li>
                    <li><code>b_h</code>: بایاس</li>
                    <li><code>φ</code>: تابع فعال‌سازی (معمولاً tanh)</li>
                </ul>
                
                <div class="concept-highlight">
                    <p>RNNها اتصالات حلقوی دارند که به آنها "حافظه" می‌دهد - توانایی به یاد آوردن اطلاعات از گذشته.</p>
                </div>
                
                <h3>چالش‌های آموزش RNN</h3>
                <p>RNN های ساده با مشکلاتی در یادگیری وابستگی‌های طولانی‌مدت مواجه هستند:</p>
                <ul>
                    <li><strong>محو شدن گرادیان:</strong> گرادیان‌ها در توالی‌های طولانی به صفر میل می‌کنند</li>
                    <li><strong>انفجار گرادیان:</strong> گرادیان‌ها بیش از حد بزرگ می‌شوند</li>
                </ul>
                
                <h3>معماری‌های پیشرفته RNN</h3>
                <p>برای غلبه بر چالش‌های RNN ساده، معماری‌های پیشرفته‌تری توسعه یافته‌اند:</p>
                
                <h3>1. LSTM (حافظه کوتاه-مدت طولانی)</h3>
                <p>شامل دروازه‌های ورودی، فراموشی و خروجی برای کنترل جریان اطلاعات است:</p>
                <ul>
                    <li>دروازه فراموشی: تصمیم می‌گیرد چه اطلاعاتی از حالت سلول دور انداخته شود</li>
                    <li>دروازه ورودی: چه اطلاعات جدیدی در حالت سلول ذخیره شود</li>
                    <li>دروازه خروجی: چه بخشی از حالت سلول به خروجی منتقل شود</li>
                </ul>
                
                <h3>2. GRU (واحد بازگشتی گیت‌دار)</h3>
                <p>نسخه ساده‌تری از LSTM با تعداد پارامترهای کمتر که عملکرد مشابهی دارد.</p>
                
                <h3>کاربردهای RNN</h3>
                <ul>
                    <li>پردازش زبان طبیعی و ترجمه ماشینی</li>
                    <li>تشخیص گفتار</li>
                    <li>تولید متن و موسیقی</li>
                    <li>پیش‌بینی سری‌های زمانی</li>
                    <li>تشخیص آنومالی در داده‌های توالی</li>
                </ul>
            </div>
        `
    }
};
// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const conceptCards = document.querySelectorAll('.concept-card');
    const overlay = document.getElementById('concept-overlay');
    const overlayTitle = document.getElementById('concept-title');
    const overlayContent = document.getElementById('concept-content');
    const closeOverlayBtn = document.getElementById('close-overlay');
    const backToConceptsBtn = document.getElementById('back-to-concepts');
    
    // Function to open concept overlay
    function openConceptOverlay(conceptId) {
        const concept = conceptData[conceptId];
        if (!concept) return;
        
        overlayTitle.textContent = concept.title;
        overlayContent.innerHTML = concept.content;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when overlay is open
    }
    
    // Function to close concept overlay
    function closeConceptOverlay() {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
    
    // Add click event listeners to concept cards
    conceptCards.forEach(card => {
        card.addEventListener('click', () => {
            const conceptId = card.dataset.concept;
            openConceptOverlay(conceptId);
        });
    });
    
    // Add event listeners to close buttons
    closeOverlayBtn.addEventListener('click', closeConceptOverlay);
    backToConceptsBtn.addEventListener('click', closeConceptOverlay);
    
    // Close overlay when clicking outside content
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeConceptOverlay();
        }
    });
    
    // Close overlay with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeConceptOverlay();
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: "smooth"
                });
            }
        });
    });

    // Update current date in user-friendly persian format
    const persianDate = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date('2025-03-02'));
    
    // Add active class to current navigation item
    function setActiveNavItem() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('.nav-links a');
        
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
    
    setActiveNavItem();
    
    // IMPORTANT: Do NOT initialize the neural network here
    // Let network.js handle its initialization to avoid conflicts
});