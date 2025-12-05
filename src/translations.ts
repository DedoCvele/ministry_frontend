export type Language = 'en' | 'mk';

export const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      shop: 'Shop',
      closets: 'Closets',
      journal: 'Journal',
      becomeSeller: 'Become a Seller',
      profile: 'Profile',
      account: 'Account',
    },
    
    // Hero Section
    hero: {
      title: 'Your Story,',
      titleSecond: 'Curated.',
      subtitle: 'Ministry of Second Hand is where luxury meets sustainability. Discover pre-loved designer pieces, curated by women who believe in timeless style.',
      shopButton: 'Explore',
      exploreButton: 'Explore Closets',
    },
    
    // Vintage Banner
    banner: {
      text: 'Curated by women who care. Worn by women who dare.',
      label: 'The Ministry Philosophy',
      title: 'Every piece tells a story,',
      titleSecond: 'waiting for its next chapter',
      subtitle: 'In a world of fast fashion, we celebrate the timeless. Each vintage find carries memories, craftsmanship, and a unique soul that mass production can never replicate.',
    },
    
    // Shop The Finds
    shopFinds: {
      title: 'Shop the finds',
      subtitle: 'Discover one-of-a-kind pieces from luxury closets around the world.',
      label: 'Curated Selection',
      viewAll: 'View All',
      viewAllItems: 'View All Items',
      addToCart: 'Add to Cart',
      loading: 'Loading products...',
      noProducts: 'No approved products available at the moment.',
      bySeller: 'by',
      condition: {
        excellent: 'Excellent',
        good: 'Very Good',
        fair: 'Fair',
      },
    },
    
    // Become Seller Section
    becomeSeller: {
      title: 'Become a Seller',
      subtitle: 'Turn your closet into a curated collection',
      description: 'Join our community of women sharing their pre-loved luxury pieces. Apply now to become a Ministry seller and start earning from your wardrobe.',
      applyButton: 'Apply Now',
      learnMore: 'Learn More',
      joinUs: 'Join Us',
      startSelling: 'Start Selling',
      benefit1Title: 'Set your own prices',
      benefit1Desc: 'Full control over your pricing. Earn what your pieces deserve.',
      benefit2Title: 'Reach conscious shoppers',
      benefit2Desc: 'Connect with buyers who value quality and sustainability.',
      benefit3Title: 'Easy listing process',
      benefit3Desc: 'Upload, describe, and list your items in minutes.',
      benefit4Title: 'No upfront costs',
      benefit4Desc: 'Start selling without any fees or commitments.',
    },
    
    // Seller Onboarding
    onboarding: {
      step1: {
        title: 'Welcome to Ministry',
        subtitle: 'Become Part of Ministry Sellers',
        description: 'Join the circle of curated closets and sell with style.',
        startButton: 'Start Application',
      },
      step2: {
        title: 'Personal Information',
        fullName: 'Full Name',
        email: 'Email Address',
        phone: 'Phone Number',
        city: 'City / Country',
        bio: 'Short Bio',
        bioPlaceholder: 'Describe your style...',
        socialLink: 'Instagram / TikTok Link',
        socialPlaceholder: '@yourhandle',
        terms: 'I agree to Ministry\'s terms and privacy policy',
        ageConfirm: 'I confirm I am over 18 years old',
        continueButton: 'Continue → Subscription',
        backButton: 'Back',
      },
      step3: {
        title: 'Activate Your Seller Profile',
        description: 'To complete your application, a one-time subscription of €2 is required. This covers listing verification and community maintenance.',
        payButton: 'Pay and Activate',
        backButton: 'Back',
      },
      success: {
        title: 'Welcome to Ministry Sellers Circle ✨',
        message: 'Your subscription is confirmed. You can now publish pieces to your closet.',
        goToCloset: 'Go to My Closet →',
        backHome: 'Back to Home',
      },
    },
    
    // Journal
    journal: {
      title: 'The Journal',
      subtitle: 'Stories, style, and the art of sustainable living',
      readMore: 'Read More',
      latestArticles: 'Latest Articles',
      editorialStories: 'Editorial Stories',
      continueReading: 'Continue Reading',
      shareArticle: 'Share Article',
      relatedArticles: 'Related Articles',
      spread: {
        sustainable: 'Sustainable',
        fashionThatCares: 'Fashion that cares',
        luxuryRedefined: 'Luxury redefined through conscious choices.',
        ministryJournal: 'Ministry Journal',
        stories: 'Stories',
        readArticle: 'Read Article →',
        viewAllStories: 'View All Stories',
      },
    },
    
    // Footer
    footer: {
      tagline: 'Curated luxury. Conscious choices.',
      newsletter: {
        title: 'Join Our Circle',
        description: 'Get first access to new arrivals and editorial content.',
        placeholder: 'Your email address',
        button: 'Subscribe',
      },
      seller: {
        text: 'Want to sell your pre-loved pieces?',
        button: 'Become a Seller →',
      },
      brand: {
        tagline: 'Where stories live on.',
        subtitle: 'Second-hand luxury, timeless style.',
      },
      explore: 'Explore',
      connect: 'Connect',
      links: {
        shop: 'Shop',
        closets: 'Closets',
        journal: 'Journal',
        about: 'About',
      },
      social: {
        instagram: 'Instagram',
        tiktok: 'TikTok',
        pinterest: 'Pinterest',
      },
      quickLinks: 'Quick Links',
      support: 'Support',
      legal: 'Legal',
      about: 'About Us',
      howItWorks: 'How It Works',
      faq: 'FAQ',
      contact: 'Contact',
      terms: 'Terms & Conditions',
      privacy: 'Privacy Policy',
      returns: 'Returns',
      shipping: 'Shipping',
      copyright: '© 2025 Ministry of Second Hand. All rights reserved.',
    },
    
    // Cart
    cart: {
      title: 'Your Cart',
      empty: 'Your cart is empty',
      emptyDesc: 'Start shopping to add items to your cart',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      shippingCost: '150 DEN',
      total: 'Total',
      checkout: 'Proceed to Checkout',
      continueShopping: 'Continue Shopping',
      remove: 'Remove',
      itemsInCart: 'items in cart',
    },
    
    // Checkout
    checkout: {
      title: 'Checkout',
      shippingInfo: 'Shipping Information',
      paymentMethod: 'Payment Method',
      orderSummary: 'Order Summary',
      completeOrder: 'Complete Order',
      cashOnDelivery: 'Cash on Delivery',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      address: 'Address',
      city: 'City',
      postalCode: 'Postal Code',
      country: 'Country',
      orderTotal: 'Order Total',
      processingOrder: 'Processing your order...',
      pleaseWait: 'Please wait while we confirm your order.',
    },
    
    // Profile
    profile: {
      editProfile: 'Edit Profile',
      myCloset: 'My Closet',
      myOrders: 'My Orders',
      favorites: 'Favorites',
      settings: 'Settings',
      listings: 'Listings',
      followers: 'Followers',
      following: 'Following',
      uploadItem: 'Upload Item',
      viewProfile: 'View Profile',
      editAvatar: 'Edit Avatar',
      bio: 'Bio',
      location: 'Location',
      memberSince: 'Member Since',
      soldItems: 'Sold Items',
      activeListings: 'Active Listings',
      reviews: 'Reviews',
      noListings: 'No listings yet',
      noOrders: 'No orders yet',
      noFavorites: 'No favorites yet',
    },
    
    // Upload Item
    upload: {
      title: 'Upload New Item',
      photos: 'Photos',
      details: 'Item Details',
      itemName: 'Item Name',
      itemNamePlaceholder: 'e.g., Vintage Chanel Bag',
      brand: 'Brand',
      brandPlaceholder: 'e.g., Chanel',
      category: 'Category',
      categoryPlaceholder: 'Select category',
      size: 'Size',
      sizePlaceholder: 'e.g., M, 38, One Size',
      condition: 'Condition',
      conditionPlaceholder: 'Select condition',
      price: 'Price (EUR)',
      pricePlaceholder: 'e.g., 250',
      description: 'Description',
      descriptionPlaceholder: 'Describe your item, its history, condition details...',
      publish: 'Publish Item',
      saveDraft: 'Save as Draft',
      uploadPhotos: 'Upload Photos',
      dragDrop: 'Drag and drop or click to upload',
      maxPhotos: 'Maximum 5 photos',
    },
    
    // Product Page
    product: {
      seller: 'Seller',
      condition: 'Condition',
      size: 'Size',
      brand: 'Brand',
      category: 'Category',
      description: 'Description',
      shipping: 'Shipping',
      shippingCost: '150 DEN flat rate',
      shippingInfo: 'Ships within 2-3 business days',
      addToCart: 'Add to Cart',
      contactSeller: 'Contact Seller',
      viewSellerCloset: 'View Seller\'s Closet',
      addedToCart: 'Added to cart!',
      similarItems: 'Similar Items',
      fromThisSeller: 'More from this seller',
    },
    
    // Order Confirmation
    orderConfirmation: {
      title: 'Order Confirmed!',
      orderNumber: 'Order Number',
      thankYou: 'Thank you for your purchase',
      emailSent: 'A confirmation email has been sent to your address.',
      orderDetails: 'Order Details',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      continueShopping: 'Continue Shopping',
      viewOrders: 'View My Orders',
    },
    
    // Review Modal
    review: {
      title: 'Leave a Review',
      rating: 'Rating',
      comment: 'Your Review',
      commentPlaceholder: 'Share your experience with this item...',
      submit: 'Submit Review',
      cancel: 'Cancel',
      thankYou: 'Thank you for your review!',
    },
    
    // Contact Seller
    contactSeller: {
      title: 'Contact Seller',
      message: 'Message',
      messagePlaceholder: 'Ask about the item...',
      send: 'Send Message',
      cancel: 'Cancel',
      messageSent: 'Message sent!',
    },
    
    // Closet Page
    closet: {
      listings: 'Listings',
      sold: 'Sold',
      reviews: 'Reviews',
      about: 'About',
      followers: 'Followers',
      following: 'Following',
      follow: 'Follow',
      unfollow: 'Unfollow',
      message: 'Message',
      share: 'Share',
      noItems: 'No items in this closet yet',
      soldItems: 'Sold Items',
      allReviews: 'All Reviews',
    },
    
    // Shop Page
    shop: {
      title: 'Shop the Finds',
      subtitle: 'Discover unique pre-loved luxury pieces',
      allCategories: 'All Categories',
      filterBy: 'Filter By',
      sortBy: 'Sort By',
      priceRange: 'Price Range',
      condition: 'Condition',
      size: 'Size',
      brand: 'Brand',
      clearFilters: 'Clear Filters',
      applyFilters: 'Apply Filters',
      noResults: 'No items found',
      showingResults: 'Showing',
      results: 'results',
      categories: {
        bags: 'Bags',
        clothing: 'Clothing',
        shoes: 'Shoes',
        accessories: 'Accessories',
        jewelry: 'Jewelry',
      },
    },
    
    // Closets Page
    closets: {
      title: 'Discover Closets',
      subtitle: 'Curated collections from sellers around the world',
      search: 'Search closets...',
      viewCloset: 'View Closet',
      items: 'items',
      noClosets: 'No closets found',
    },
    
    // Chatbot
    chatbot: {
      welcome: 'Hi! How can I help you today?',
      quickReplies: {
        shipping: 'How much is shipping?',
        delivery: 'When will I get my order?',
        returns: 'How do I return an item?',
        upload: 'How do I upload an item?',
        contact: 'Contact seller',
      },
      responses: {
        shipping: 'Shipping is 150 DEN flat rate for all orders within Macedonia.',
        delivery: 'Orders typically arrive within 2-3 business days after shipping.',
        returns: 'You can return items within 14 days of delivery. Contact the seller to initiate a return.',
        upload: 'Click on "Upload Item" in your profile to list a new item. You\'ll need photos and details about your item.',
      },
      typeMessage: 'Type your message...',
      send: 'Send',
    },
    
    // Login/Signup
    auth: {
      login: 'Log In',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      noAccount: 'Don\'t have an account?',
      haveAccount: 'Already have an account?',
      signupLink: 'Sign up',
      loginLink: 'Log in',
      welcomeBack: 'Welcome Back',
      joinMinistry: 'Join Ministry',
      createAccount: 'Create your account to start shopping or selling',
    },
    
    // Newsletter
    newsletter: {
      title: 'Join Our Circle',
      description: 'Get first access to new arrivals, exclusive editorial content, and sustainable fashion tips.',
      email: 'Email Address',
      subscribe: 'Subscribe',
      thankYou: 'Thank you for subscribing!',
      close: 'Close',
    },
    
    // Common
    common: {
      back: 'Back',
      next: 'Next',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      loading: 'Loading...',
      error: 'Something went wrong',
      success: 'Success!',
      viewAll: 'View All',
      learnMore: 'Learn More',
      readMore: 'Read More',
      seeMore: 'See More',
    },
  },
  
  mk: {
    // Navigation
    nav: {
      home: 'Почетна',
      shop: 'Продавница',
      closets: 'Плакари',
      journal: 'Блог',
      becomeSeller: 'Стани продавач',
      profile: 'Профил',
      account: 'Профил',
    },
    
    // Hero Section
    hero: {
      title: 'Твојата приказна,',
      titleSecond: 'Курирана.',
      subtitle: 'Ministry of Second Hand е место каде луксузот се среќава со одржливоста. Откриј претходно носени дизајнерски парчиња, курирани од жени кои веруваат во невремен стил.',
      shopButton: 'Истражи',
      exploreButton: 'Истражи плакари',
    },
    
    // Vintage Banner
    banner: {
      text: 'Курирано од жени кои се грижат. Носено од жени кои се осмелуваат.',
      label: 'Филозофијата на Ministry',
      title: 'Секое парче раскажува приказна,',
      titleSecond: 'чекајќи го својот следен поглавје',
      subtitle: 'Во свет на брза мода, ние ја славиме невремената елегантност. Секоја винтиџ наоѓалка носи спомени, мајсторство и уникатна душа која масовното производство никогаш не може да ја реплицира.',
    },
    
    // Shop The Finds
    shopFinds: {
      title: 'Купувај',
      subtitle: 'Откриј уникатни парчиња од луксузни плакари низ целиот свет.',
      label: 'Курирана селекција',
      viewAll: 'Погледни сè',
      viewAllItems: 'Погледни ги сите артикли',
      addToCart: 'Додади во кошничка',
      loading: 'Се вчитуваат артикли...',
      noProducts: 'Моментално нема одобрени артикли.',
      bySeller: 'од',
      condition: {
        excellent: 'Одлична',
        good: 'Многу добра',
        fair: 'Добра',
      },
    },
    
    // Become Seller Section
    becomeSeller: {
      title: 'Стани продавач',
      subtitle: 'Претвори го твојот плакар во курирана колекција',
      description: 'Придружи се на нашата заедница на жени кои ги споделуваат своите претходно носени луксузни парчиња. Аплицирај сега за да станеш Ministry продавач и започни да заработуваш од твојата гардероба.',
      applyButton: 'Аплицирај',
      learnMore: 'Дознај повеќе',
      joinUs: 'Приклучи се',
      startSelling: 'Почни да продаваш',
      benefit1Title: 'Постави ги своите цени',
      benefit1Desc: 'Целосна контрола над ценообразувањето. Заработи колку што твоите парчиња заслужуваат.',
      benefit2Title: 'Допри до свесни купувачи',
      benefit2Desc: 'Поврзи се со купувачи кои ги ценат квалитетот и одржливоста.',
      benefit3Title: 'Лесен процес на објавување',
      benefit3Desc: 'Прикачи, ��пиши и објави ги твоите артикли за неколку минути.',
      benefit4Title: 'Без почетни трошоци',
      benefit4Desc: 'Започни да продаваш без такси или обврски.',
    },
    
    // Seller Onboarding
    onboarding: {
      step1: {
        title: 'Добредојдовте',
        subtitle: 'Стани дел од Ministry продавниците',
        description: 'Придружи се на кругот на одбрани плакари и продавај со стил.',
        startButton: 'Започни апликација',
      },
      step2: {
        title: 'Лични информации',
        fullName: 'Име и презиме',
        email: 'Е-маил адреса',
        phone: 'Телефонски број',
        city: 'Град / Земја',
        bio: 'Краток опис',
        bioPlaceholder: 'Опиши го твојот стил...',
        socialLink: 'Линк до Instagram / TikTok',
        socialPlaceholder: '@твојпрофил',
        terms: 'Се согласувам со условите и политиката за приватност на Ministry.',
        ageConfirm: 'Потврдувам дека имам над 18 години.',
        continueButton: 'Продолжи → Претплата',
        backButton: 'Назад',
      },
      step3: {
        title: 'Активирај го твојот профил како продавач',
        description: 'За да ја завршиш апликацијата, потребна е еднократна претплата од 2 евра. Ова ја покрива проверката на листингот и одржувањето на заедницата.',
        payButton: 'Плати и активирај',
        backButton: 'Назад',
      },
      success: {
        title: 'Добредојде во кругот на Ministry продавачите ✨',
        message: 'Твојата претплата е потврдена. Сега можеш да објавуваш парчиња во твојот плакар.',
        goToCloset: 'Оди во мојот плакар →',
        backHome: 'Назад кон почетна',
      },
    },
    
    // Journal
    journal: {
      title: 'Блогот',
      subtitle: 'Приказни, стил и уметноста на одржливото живеење',
      readMore: 'Прочитај повеќе',
      latestArticles: 'Најнови статии',
      editorialStories: 'Уредувачки приказни',
      continueReading: 'Продолжи со читање',
      shareArticle: 'Сподели статија',
      relatedArticles: 'Поврзани статии',
      spread: {
        sustainable: 'Одржливо',
        fashionThatCares: 'Мода која се грижи',
        luxuryRedefined: 'Луксузот редефиниран преку свесни избори.',
        ministryJournal: 'Ministry Блог',
        stories: 'Приказни',
        readArticle: 'Прочитај статија →',
        viewAllStories: 'Погледни ги сите приказни',
      },
    },
    
    // Footer
    footer: {
      tagline: 'Куриран луксуз. Свесни избори.',
      newsletter: {
        title: 'Придружи се на нашиот круг',
        description: 'Добивај прв пристап до нови пристигнувања и уредувачка содржина.',
        placeholder: 'Твоја е-маил адреса',
        button: 'Претплати се',
      },
      seller: {
        text: 'Сакаш да ги продадеш твоите претходно носени парчиња?',
        button: 'Стани продавач →',
      },
      brand: {
        tagline: 'Каде приказните продолжуваат да живеат.',
        subtitle: 'Второрачна луксузна облека, невремен стил.',
      },
      explore: 'Истражи',
      connect: 'Поврзи се',
      links: {
        shop: 'Продавница',
        closets: 'Плакари',
        journal: 'Блог',
        about: 'За нас',
      },
      social: {
        instagram: 'Instagram',
        tiktok: 'TikTok',
        pinterest: 'Pinterest',
      },
      quickLinks: 'Брзи линкови',
      support: 'Поддршка',
      legal: 'Правни',
      about: 'За нас',
      howItWorks: 'Како функционира',
      faq: 'Прашања',
      contact: 'Контакт',
      terms: 'Услови',
      privacy: 'Приватност',
      returns: 'Враќања',
      shipping: 'Достава',
      copyright: '© 2025 Ministry of Second Hand. Сите права задржани.',
    },
    
    // Cart
    cart: {
      title: 'Твоја кошничка',
      empty: 'Твојата кошничка е празна',
      emptyDesc: 'Почни да купуваш за да додадеш артикли во кошничката',
      subtotal: 'Меѓузбир',
      shipping: 'Достава',
      shippingCost: '150 ДЕН',
      total: 'Вкупно',
      checkout: 'Продолжи кон плаќање',
      continueShopping: 'Продолжи со купување',
      remove: 'Отстрани',
      itemsInCart: 'артикли во кошничка',
    },
    
    // Checkout
    checkout: {
      title: 'Плаќање',
      shippingInfo: 'Информации за достава',
      paymentMethod: 'Начин на плаќање',
      orderSummary: 'Преглед на нарачка',
      completeOrder: 'Заврши нарачка',
      cashOnDelivery: 'Плаќање при достава',
      fullName: 'Име и презиме',
      email: 'Е-маил адреса',
      phone: 'Телефонски број',
      address: 'Адреса',
      city: 'Град',
      postalCode: 'Поштенски код',
      country: 'Држава',
      orderTotal: 'Вкупно за нарачка',
      processingOrder: 'Се обработува твојата нарачка...',
      pleaseWait: 'Те молиме почекај додека ја потврдуваме твојата нарачка.',
    },
    
    // Profile
    profile: {
      editProfile: 'Уреди профил',
      myCloset: 'Мојот плакар',
      myOrders: 'Мои нарачки',
      favorites: 'Омилени',
      settings: 'Подесувања',
      listings: 'Објави',
      followers: 'Следбеници',
      following: 'Следам',
      uploadItem: 'Објави парче',
      viewProfile: 'Погледни профил',
      editAvatar: 'Уреди аватар',
      bio: 'Биографија',
      location: 'Локација',
      memberSince: 'Член од',
      soldItems: 'Продадени артикли',
      activeListings: 'Активни објави',
      reviews: 'Рецензии',
      noListings: 'Сè уште нема објави',
      noOrders: 'Сè уште нема нарачки',
      noFavorites: 'Сè уште нема омилени',
    },
    
    // Upload Item
    upload: {
      title: 'Објави ново парче',
      photos: 'Фотографии',
      details: 'Детали за парчето',
      itemName: 'Име на парче',
      itemNamePlaceholder: 'на пр., Винтиџ Chanel торба',
      brand: 'Бренд',
      brandPlaceholder: 'на пр., Chanel',
      category: 'Категорија',
      categoryPlaceholder: 'Избери категорија',
      size: 'Големина',
      sizePlaceholder: 'на пр., M, 38, Една големина',
      condition: 'Состојба',
      conditionPlaceholder: 'Избери состојба',
      price: 'Цена (EUR)',
      pricePlaceholder: 'на пр., 250',
      description: 'Опис',
      descriptionPlaceholder: 'Опиши го твоето парче, неговата историја, детали за состојбата...',
      publish: 'Објави парче',
      saveDraft: 'Зачувај како нацрт',
      uploadPhotos: 'Прикачи фотографии',
      dragDrop: 'Повлечи и пушти или кликни за прикачување',
      maxPhotos: 'Максимум 5 фотографии',
    },
    
    // Product Page
    product: {
      seller: 'Продавач',
      condition: 'Состојба',
      size: 'Големина',
      brand: 'Бренд',
      category: 'Категорија',
      description: 'Опис',
      shipping: 'Достава',
      shippingCost: '150 ДЕН паушална тарифа',
      shippingInfo: 'Се испраќа во рок од 2-3 работни дена',
      addToCart: 'Додади во кошничка',
      contactSeller: 'Контактирај продавач',
      viewSellerCloset: 'Погледни го плакарот на продавачот',
      addedToCart: 'Додадено во кошничка!',
      similarItems: 'Слични артикли',
      fromThisSeller: 'Повеќе од овој продавач',
    },
    
    // Order Confirmation
    orderConfirmation: {
      title: 'Нарачката е потврдена!',
      orderNumber: 'Број на нарачка',
      thankYou: 'Ти благодариме за купувањето',
      emailSent: 'Е-маил за потврда е испратен на твојата адреса.',
      orderDetails: 'Детали за нарачката',
      shippingAddress: 'Адреса за достава',
      paymentMethod: 'Начин на плаќање',
      continueShopping: 'Продолжи со купување',
      viewOrders: 'Погледни ги моите нарачки',
    },
    
    // Review Modal
    review: {
      title: 'Остави рецензија',
      rating: 'Оценка',
      comment: 'Твоја рецензија',
      commentPlaceholder: 'Сподели го твоето искуство со овој артикл...',
      submit: 'Поднеси рецензија',
      cancel: 'Откажи',
      thankYou: 'Ти благодариме за рецензијата!',
    },
    
    // Contact Seller
    contactSeller: {
      title: 'Контактирај продавач',
      message: 'Порака',
      messagePlaceholder: 'Прашај за артиклот...',
      send: 'Испрати порака',
      cancel: 'Откажи',
      messageSent: 'Пораката е испратена!',
    },
    
    // Closet Page
    closet: {
      listings: 'Објави',
      sold: 'Продадено',
      reviews: 'Рецензии',
      about: 'За',
      followers: 'Следбеници',
      following: 'Следам',
      follow: 'Следи',
      unfollow: 'Престани да следиш',
      message: 'Порака',
      share: 'Сподели',
      noItems: 'Сè уште нема артикли во овој плакар',
      soldItems: 'Продадени артикли',
      allReviews: 'Сите рецензии',
    },
    
    // Shop Page
    shop: {
      title: 'Купувај',
      subtitle: 'Откриј уникатни претходно носени луксузни парчиња',
      allCategories: 'Сите категории',
      filterBy: 'Филтрирај по',
      sortBy: 'Сортирај по',
      priceRange: 'Ценовен опсег',
      condition: 'Состојба',
      size: 'Големина',
      brand: 'Бренд',
      clearFilters: 'Исчисти филтри',
      applyFilters: 'Примени филтри',
      noResults: 'Не се пронајдени артикли',
      showingResults: 'Прикажани',
      results: 'резултати',
      categories: {
        bags: 'Торби',
        clothing: 'Облека',
        shoes: 'Обувки',
        accessories: 'Додатоци',
        jewelry: 'Накит',
      },
    },
    
    // Closets Page
    closets: {
      title: 'Откриј плакари',
      subtitle: 'Курирани колекции од продавачи низ целиот свет',
      search: 'Барај плакари...',
      viewCloset: 'Погледни плакар',
      items: 'артикли',
      noClosets: 'Не се пронајдени плакари',
    },
    
    // Chatbot
    chatbot: {
      welcome: 'Здраво! Како можам да ти помогнам денес?',
      quickReplies: {
        shipping: 'Колку чини достава?',
        delivery: 'Кога ќе ја добијам нарачката?',
        returns: 'Како да вратам артикл?',
        upload: 'Како да објавам парче?',
        contact: 'Контактирај продавач',
      },
      responses: {
        shipping: 'Достава чини 150 ДЕН паушална тарифа за сите нарачки во Македонија.',
        delivery: 'Нарачките обично пристигнуваат во рок од 2-3 работни дена по испраќањето.',
        returns: 'Можеш да вратиш артикли во рок од 14 дена од доставата. Контактирај го продавачот за да иницираш враќање.',
        upload: 'Кликни на "Објави парче" во твојот профил за да објавиш нов артикл. Ќе ти требаат фотографии и детали за твоето парче.',
      },
      typeMessage: 'Напиши ја твојата порака...',
      send: 'Испрати',
    },
    
    // Login/Signup
    auth: {
      login: 'Најави се',
      signup: 'Регистрирај се',
      email: 'Е-маил',
      password: 'Лозинка',
      confirmPassword: 'Потврди лозинка',
      forgotPassword: 'Заборавена лозинка?',
      noAccount: 'Немаш профил?',
      haveAccount: 'Веќе имаш профил?',
      signupLink: 'Регистрирај се',
      loginLink: 'Најави се',
      welcomeBack: 'Добредојде назад',
      joinMinistry: 'Придружи се на Ministry',
      createAccount: 'Создади профил за да започнеш да купуваш или продаваш',
    },
    
    // Newsletter
    newsletter: {
      title: 'Придружи се на нашиот круг',
      description: 'Добивај прв пристап до нови пристигнувања, ексклузивна уредувачка содржина и совети за одржлива мода.',
      email: 'Е-маил адреса',
      subscribe: 'Претплати се',
      thankYou: 'Ти благодариме што се претплати!',
      close: 'Затвори',
    },
    
    // Common
    common: {
      back: 'Назад',
      next: 'Следно',
      cancel: 'Откажи',
      save: 'Зачувај',
      delete: 'Избриши',
      edit: 'Уреди',
      close: 'Затвори',
      search: 'Барај',
      filter: 'Филтрирај',
      sort: 'Сортирај',
      loading: 'Се вчитува...',
      error: 'Нешто тргна наопаку',
      success: 'Успешно!',
      viewAll: 'Погледни сè',
      learnMore: 'Дознај повеќе',
      readMore: 'Прочитај повеќе',
      seeMore: 'Погледни повеќе',
    },
  },
};

export function getTranslation(lang: Language) {
  return translations[lang];
}
