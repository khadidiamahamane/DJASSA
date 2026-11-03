const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DJASSA database...');

  // 1. Nettoyer les tables existantes
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.stockMovement.deleteMany({});
  await prisma.stock.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.vendorProfile.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Créer un utilisateur et profil vendeur
  const user = await prisma.user.create({
    data: {
      id: 'usr_kouassi_01',
      email: 'kouassi@djassa.ci',
      name: 'Kouassi Tech & Bureau',
      role: 'VENDOR',
    },
  });

  const vendor = await prisma.vendorProfile.create({
    data: {
      id: 'vnd_kouassi_01',
      userId: user.id,
      shopName: 'Kouassi Tech & Bureau',
      shopSlug: 'kouassi-tech',
      description: 'Boutique certifiée de matériel informatique, gaming et accessoires bureautiques à Abidjan.',
      phone: '+225 07 48 90 12 34',
      city: 'Abidjan (Côte d’Ivoire)',
      address: 'Cocody Riviera 3, Abidjan',
      status: 'VERIFIED',
      commission: 0.05,
    },
  });

  // 3. Catégories
  const categoriesData = [
    { id: 'cat_elec', name: 'Électronique & Informatique', slug: 'electronique-pc', icon: 'devices' },
    { id: 'cat_mode', name: 'Mode & Vêtements', slug: 'mode-vetements', icon: 'checkroom' },
    { id: 'cat_maison', name: 'Maison & Bureau', slug: 'maison-bureau', icon: 'chair' },
    { id: 'cat_access', name: 'Matériel & Accessoires', slug: 'materiel-accessoires', icon: 'cable' },
    { id: 'cat_alim', name: 'Alimentation & Produits Frais', slug: 'alimentation', icon: 'restaurant' },
  ];

  for (const cat of categoriesData) {
    await prisma.category.create({ data: cat });
  }

  // 4. Produits réels avec stock & SKU
  const productsData = [
    {
      id: 'art-1',
      name: 'Clavier mécanique sans fil Keychron x401K',
      slug: 'clavier-mecanique-sans-fil-keychron-x401k',
      description: 'Touches silencieuses haute qualité, rétroéclairage doux, connexion Bluetooth et câble USB. Idéal pour bureau et informatique.',
      basePrice: 68000,
      categoryId: 'cat_elec',
      city: 'Abidjan (Côte d’Ivoire)',
      neighborhood: 'Cocody Riviera',
      condition: 'Neuf scellé',
      deliveryEstimate: 'Livraison aujourd’hui ou retrait sur place',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPinIQbqIGPFcsF0wdQGwMRRY_OljEhuYoPLz-8QM44gvzYLNsJb0LI1i14wdKuDZrc5qbAU-WRjwLbPkdBsWjA-J1grqD-1d50yVYspH69Ln065CveLnFu05WNq6ZsheZOTnihGCbs5fj5ckJpg6LbDF3mT4eAzRKzX_LLR4wfjspSNN3IKITYO828syNvkz8HyO4YF-6Ja4Ib0lkLi9oI9zoxrURMb-eR8B3AJ8AD7PpkMP4fZaodg',
      stock: {
        sku: 'KEY-401K-BLK',
        quantity: 8,
        reserved: 1,
        lowAlert: 3,
      },
    },
    {
      id: 'art-2',
      name: 'Souris sans fil ultra-légère avec capteur précis',
      slug: 'souris-sans-fil-ultra-legere',
      description: 'Prise en main confortable, coque aérée anti-transpiration, batterie rechargeable longue autonomie.',
      basePrice: 22000,
      categoryId: 'cat_elec',
      city: 'Dakar (Sénégal)',
      neighborhood: 'Plateau & Almadies',
      condition: 'Neuf scellé',
      deliveryEstimate: 'Livraison en 24h par coursier',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDeQG6v9z83QKMHcI-W4ysadimVOaZr9GwhoratDbQlvBUJECQ7oTp49lqiiA8uHaaKYcR9pChy8VK2YkPVhD_fr1bPMUf1iK2ggWsOb2JYTmVFYolLvT3ADVOxI0nt3oKx8UAw5WvpQPFC_uZa8FWkNS1Mb8NH52CpzZROLhYRu44wudPW7h_9Fvx3pPE-txrZ8zwEhmKxvhURY9orDKK05k8j6m_wSNMk34FI1xxr2FnzGqBJBQxaJw',
      stock: {
        sku: 'MOU-LGT-WHT',
        quantity: 12,
        reserved: 2,
        lowAlert: 4,
      },
    },
    {
      id: 'art-3',
      name: 'Casque audio sans fil Bluetooth avec réduction de bruit',
      slug: 'casque-audio-sans-fil-bluetooth',
      description: 'Coussinets doux et confortables, micro intégré clair pour les appels téléphoniques et réunions.',
      basePrice: 30000,
      categoryId: 'cat_elec',
      city: 'Abidjan (Côte d’Ivoire)',
      neighborhood: 'Yopougon & Marcory',
      condition: 'Neuf scellé',
      deliveryEstimate: 'Livraison rapide à domicile',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEot9UwIYZ-RQ22P5cSb0VaqK8uc1ze8j8-zCCwWWrKJkAzG7Qp717jSsdJC5G8GJ63jAWc8OCBwk_NFLt3515DphHEQmgrJeZCvbWMRsUIH_Loj4vNl-kBETB9uA-wvP2OUeQDWlo3hXF3MzHQlPoUPdbBr8cWFsCiVE-yhiS-ymOHA-VLKoSahJSWI760b4d31iQd7fcbyFaovqjRgEhT8yRWdJ3G6s9weXtWkE35YwDURXvqZSmVQ',
      stock: {
        sku: 'HDP-BT-ANC',
        quantity: 15,
        reserved: 0,
        lowAlert: 5,
      },
    },
    {
      id: 'art-4',
      name: 'Manette de jeu sans fil compatible téléphone et PC',
      slug: 'manette-de-jeu-sans-fil-pro',
      description: 'Poignées antidérapantes, gâchettes précises, batterie rechargeable incluse. Très simple d’utilisation.',
      basePrice: 45000,
      categoryId: 'cat_elec',
      city: 'Douala (Cameroun)',
      neighborhood: 'Akwa & Bonanjo',
      condition: 'Neuf scellé',
      deliveryEstimate: 'Livraison en 24h à 48h',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCurLM2Z2C1BLT_3IsK3WTYkIRX1CX0Fi87GGdSqvUKrLkmUpRM5f8rMTGuZFK_FNAk1UENYrl0Te3RTQd_IBKzqf6Q3trl4Q508HSoqvV6YBrjnV_HYoonGof5ijuhOgn0Tp_m6aNgkzPtKtrUsZWXjLtOtpIKByggDnqPSEQIw4DMLpE054WUFSeBa-UziTAASWAITs8oniUdJcg2Aumq4yarFKv3qgOQeytaJtfeYiU7RVAH393aBA',
      stock: {
        sku: 'PAD-WLS-PRO',
        quantity: 6,
        reserved: 0,
        lowAlert: 3,
      },
    },
    {
      id: 'art-5',
      name: 'Câble tressé renforcé Type-C haute résistance',
      slug: 'cable-tresse-renforce-type-c',
      description: 'Câble solide anti-coupure pour charger vite votre téléphone ou ordinateur sans abîmer la batterie.',
      basePrice: 15000,
      categoryId: 'cat_access',
      city: 'Cotonou (Bénin)',
      neighborhood: 'Ganhi & Cadjehoun',
      condition: 'Neuf scellé',
      deliveryEstimate: 'Livraison dans la journée',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaxIK2vPxFrGMImCm-VLr9YF1xviL7IvIznj0k8_t8Ep3Xq3xu4rnW9QQMNDixvFaa966cLA2WcwMq9giLrwAA5aNQ2SaGXvMKphjKzr5R2h0zpvwOitn1b3xevlhUwvcPumO71PeKkE7VaYSW0A7xxA9PloFz_4aQ6YkN9x8LSGnXo_beJPv4_sCKN3p67UXl5iFgwfanCxKTD7GM8BLhz2lYvRwBSabO00lnjJWDWmHjDf2CxNARdw',
      stock: {
        sku: 'CBL-TYPC-2M',
        quantity: 25,
        reserved: 1,
        lowAlert: 5,
      },
    },
    {
      id: 'art-6',
      name: 'Souris ergonomique verticale pour reposer le poignet',
      slug: 'souris-ergonomique-verticale',
      description: 'Position naturelle de la main, évite les douleurs lors des journées de travail sur ordinateur.',
      basePrice: 35000,
      categoryId: 'cat_elec',
      city: 'Abidjan (Côte d’Ivoire)',
      neighborhood: 'Plateau & Treichville',
      condition: 'Neuf scellé',
      deliveryEstimate: 'Livraison aujourd’hui',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAemeoIA1Y46zH4IEvOvIlaII1Y1gn1T8K1hjw9EA124BvQB8WMAz4OQxyhE5paOVtX9NyWNxHnWvi5Ye7xlBnn0Hwhzcw99Mv8bZrtMdn1QgolETbyA5yXXCRgZb0LOoNueKpS8tSXfZjm7wvnNXnIPQtMeJnTT6E5ylb5Z4r7WNd8DC6AyV2SKKWfU84tT5QinXMA2sBC0tAUlFtmBmG9MCHFFJtpq3t9b7p8q6cXoxoOuEapPYB1QA',
      stock: {
        sku: 'MOU-ERG-VRT',
        quantity: 3,
        reserved: 1,
        lowAlert: 4,
      },
    },
  ];

  for (const p of productsData) {
    const prod = await prisma.product.create({
      data: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        image: p.image,
        categoryId: p.categoryId,
        vendorId: vendor.id,
        city: p.city,
        neighborhood: p.neighborhood,
        condition: p.condition,
        deliveryEstimate: p.deliveryEstimate,
      },
    });

    const stock = await prisma.stock.create({
      data: {
        productId: prod.id,
        vendorId: vendor.id,
        sku: p.stock.sku,
        quantity: p.stock.quantity,
        reserved: p.stock.reserved,
        lowAlert: p.stock.lowAlert,
      },
    });

    // Mouvement initial de stock
    await prisma.stockMovement.create({
      data: {
        stockId: stock.id,
        type: 'IN',
        quantity: p.stock.quantity,
        reason: 'Lot initial magasin / Entrée de stock',
      },
    });

    if (p.stock.reserved > 0) {
      await prisma.stockMovement.create({
        data: {
          stockId: stock.id,
          type: 'RESERVATION',
          quantity: p.stock.reserved,
          reason: 'Réservation commande client',
        },
      });
    }
  }

  // 5. Commandes réelles initiales
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'CMD-8421',
      vendorId: vendor.id,
      clientName: 'Aminata Touré',
      clientPhone: '+225 07 11 22 33 44',
      clientCity: 'Abidjan (Cocody Angré)',
      paymentMethod: 'Wave Mobile Money',
      customerNote: 'Livrer avant 18h si possible',
      status: 'Nouvelle demande',
      total: 68000,
      vendorAmount: 64600,
      commission: 3400,
      items: {
        create: [
          {
            productId: 'art-1',
            quantity: 1,
            unitPrice: 68000,
            total: 68000,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'CMD-8419',
      vendorId: vendor.id,
      clientName: 'Mamadou Diallo',
      clientPhone: '+221 77 987 65 43',
      clientCity: 'Dakar (Ouakam)',
      paymentMethod: 'Orange Money',
      status: 'En préparation',
      total: 37000,
      vendorAmount: 35150,
      commission: 1850,
      items: {
        create: [
          {
            productId: 'art-2',
            quantity: 1,
            unitPrice: 22000,
            total: 22000,
          },
          {
            productId: 'art-5',
            quantity: 1,
            unitPrice: 15000,
            total: 15000,
          },
        ],
      },
    },
  });

  console.log('DJASSA Database seeded successfully with real products, stock, and orders!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
