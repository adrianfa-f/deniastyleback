const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const adminData = {
  email: "superadmin@gmail.com",
  password: "$2b$10$DwWKCHg1wxzx2mUX8KYsG.cF1JswsHS62Ul2VTOZgXeMcRFAedITq", // admin123
};

const categoriesData = [
  // Vestidos
  {
    name: "Vestidos",
    slug: "vestidos",
    description: "Vestidos para todas las ocasiones, desde casual hasta formal",
  },
  {
    name: "Vestidos de fiesta",
    slug: "vestidos-fiesta",
    description: "Vestidos elegantes para eventos especiales y celebraciones",
    parentName: "Vestidos",
  },
  {
    name: "Vestidos casuales",
    slug: "vestidos-casuales",
    description: "Vestidos cómodos para el día a día",
    parentName: "Vestidos",
  },
  {
    name: "Vestidos de noche",
    slug: "vestidos-noche",
    description: "Vestidos largos o cortos para salidas nocturnas",
    parentName: "Vestidos",
  },
  {
    name: "Vestidos de coctel",
    slug: "vestidos-coctel",
    description: "Vestidos cortos para eventos de media etiqueta",
    parentName: "Vestidos",
  },
  {
    name: "Vestidos de novia",
    slug: "vestidos-novia",
    description: "Vestidos de novia y accesorios",
    parentName: "Vestidos",
  },
  {
    name: "Vestidos de invitada",
    slug: "vestidos-invitada",
    description: "Vestidos para bodas y ceremonias",
    parentName: "Vestidos",
  },

  // Blusas y Tops
  {
    name: "Blusas y Tops",
    slug: "blusas-tops",
    description: "Blusas, camisas y tops para todo tipo de looks",
  },
  {
    name: "Camisas",
    slug: "camisas",
    description: "Camisas formales e informales",
    parentName: "Blusas y Tops",
  },
  {
    name: "Tops",
    slug: "tops",
    description: "Tops ajustados, crop tops y blusas cortas",
    parentName: "Blusas y Tops",
  },
  {
    name: "Blusas de seda",
    slug: "blusas-seda",
    description: "Blusas elegantes de seda",
    parentName: "Blusas y Tops",
  },
  {
    name: "Blusas de lino",
    slug: "blusas-lino",
    description: "Blusas frescas de lino",
    parentName: "Blusas y Tops",
  },
  {
    name: "Body",
    slug: "body",
    description: "Prendas de una pieza",
    parentName: "Blusas y Tops",
  },

  // Pantalones
  {
    name: "Pantalones",
    slug: "pantalones",
    description: "Pantalones de vestir, casuales y jeans",
  },
  {
    name: "Jeans",
    slug: "jeans",
    description: "Jeans en diferentes cortes y lavados",
    parentName: "Pantalones",
  },
  {
    name: "Pantalones de vestir",
    slug: "pantalones-vestir",
    description: "Pantalones de tela para oficina o eventos",
    parentName: "Pantalones",
  },
  {
    name: "Pantalones cargo",
    slug: "pantalones-cargo",
    description: "Pantalones con bolsillos estilo militar",
    parentName: "Pantalones",
  },
  {
    name: "Pantalones de chándal",
    slug: "pantalones-chandal",
    description: "Pantalones deportivos y de estar por casa",
    parentName: "Pantalones",
  },
  {
    name: "Shorts",
    slug: "shorts",
    description: "Pantalones cortos para verano",
    parentName: "Pantalones",
  },

  // Faldas
  {
    name: "Faldas",
    slug: "faldas",
    description: "Faldas en diferentes largos y estilos",
  },
  {
    name: "Faldas mini",
    slug: "faldas-mini",
    description: "Faldas cortas por encima de la rodilla",
    parentName: "Faldas",
  },
  {
    name: "Faldas midi",
    slug: "faldas-midi",
    description: "Faldas de largo medio (hasta la pantorrilla)",
    parentName: "Faldas",
  },
  {
    name: "Faldas largas",
    slug: "faldas-largas",
    description: "Faldas maxi hasta el suelo",
    parentName: "Faldas",
  },
  {
    name: "Faldas lápiz",
    slug: "faldas-lapiz",
    description: "Faldas ajustadas para look elegante",
    parentName: "Faldas",
  },
  {
    name: "Faldas plisadas",
    slug: "faldas-plisadas",
    description: "Faldas con pliegues",
    parentName: "Faldas",
  },

  // Chaquetas y Abrigos
  {
    name: "Chaquetas y Abrigos",
    slug: "chaquetas-abrigos",
    description: "Chaquetas ligeras y abrigos de invierno",
  },
  {
    name: "Chaquetas vaqueras",
    slug: "chaquetas-vaqueras",
    description: "Chamarras de mezclilla",
    parentName: "Chaquetas y Abrigos",
  },
  {
    name: "Abrigos",
    slug: "abrigos",
    description: "Abrigos de lana, plumíferos, etc.",
    parentName: "Chaquetas y Abrigos",
  },
  {
    name: "Cazadoras",
    slug: "cazadoras",
    description: "Cazadoras de cuero o piel sintética",
    parentName: "Chaquetas y Abrigos",
  },
  {
    name: "Americanas",
    slug: "americanas",
    description: "Blazers y chaquetas formales",
    parentName: "Chaquetas y Abrigos",
  },
  {
    name: "Chalecos",
    slug: "chalecos",
    description: "Chalecos sin mangas para entretiempo",
    parentName: "Chaquetas y Abrigos",
  },

  // Ropa de Baño
  {
    name: "Ropa de Baño",
    slug: "ropa-bano",
    description: "Bikinis, bañadores y pareos",
  },
  {
    name: "Bikinis",
    slug: "bikinis",
    description: "Bikinis de dos piezas",
    parentName: "Ropa de Baño",
  },
  {
    name: "Bañadores",
    slug: "banadores",
    description: "Bañadores de una pieza",
    parentName: "Ropa de Baño",
  },
  {
    name: "Pareos",
    slug: "pareos",
    description: "Pareos y sarong para la playa",
    parentName: "Ropa de Baño",
  },

  // Ropa Interior
  {
    name: "Ropa Interior",
    slug: "ropa-interior",
    description: "Sujetadores, bragas, lencería",
  },
  {
    name: "Sujetadores",
    slug: "sujetadores",
    description: "Sujetadores de todo tipo",
    parentName: "Ropa Interior",
  },
  {
    name: "Bragas",
    slug: "bragas",
    description: "Braguitas, tangas, culottes",
    parentName: "Ropa Interior",
  },
  {
    name: "Lencería",
    slug: "lenceria",
    description: "Conjuntos de encaje, babydolls, etc.",
    parentName: "Ropa Interior",
  },
  {
    name: "Pijamas",
    slug: "pijamas",
    description: "Pijamas de algodón, seda, etc.",
    parentName: "Ropa Interior",
  },
  {
    name: "Batas",
    slug: "batas",
    description: "Batas de estar por casa",
    parentName: "Ropa Interior",
  },

  // Ropa Deportiva
  {
    name: "Ropa Deportiva",
    slug: "ropa-deportiva",
    description: "Prendas para hacer ejercicio",
  },
  {
    name: "Leggings",
    slug: "leggings",
    description: "Leggings deportivos de compresión",
    parentName: "Ropa Deportiva",
  },
  {
    name: "Tops deportivos",
    slug: "tops-deportivos",
    description: "Sujetadores deportivos y tops",
    parentName: "Ropa Deportiva",
  },
  {
    name: "Sudaderas",
    slug: "sudaderas",
    description: "Sudaderas y sweatshirts",
    parentName: "Ropa Deportiva",
  },
  {
    name: "Chándales",
    slug: "chandales",
    description: "Conjuntos deportivos",
    parentName: "Ropa Deportiva",
  },

  // Complementos
  {
    name: "Complementos",
    slug: "complementos",
    description: "Accesorios de moda",
  },
  {
    name: "Bufandas",
    slug: "bufandas",
    description: "Bufandas y pañuelos",
    parentName: "Complementos",
  },
  {
    name: "Guantes",
    slug: "guantes",
    description: "Guantes de invierno",
    parentName: "Complementos",
  },
  {
    name: "Gorros",
    slug: "gorros",
    description: "Gorros de lana y viseras",
    parentName: "Complementos",
  },
  {
    name: "Cinturones",
    slug: "cinturones",
    description: "Cinturones de piel y tela",
    parentName: "Complementos",
  },
];

async function seedAdmin() {
  await prisma.admin.upsert({
    where: { email: adminData.email },
    update: {},
    create: adminData,
  });
  console.log("Admin creado/actualizado");
}

async function seedCategories() {
  const categoriesMap = new Map();
  // Categorías principales
  for (const cat of categoriesData) {
    if (!cat.parentName) {
      const created = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
        },
      });
      categoriesMap.set(cat.name, created.id);
    }
  }
  // Subcategorías
  for (const cat of categoriesData) {
    if (cat.parentName) {
      const parentId = categoriesMap.get(cat.parentName);
      if (parentId) {
        await prisma.category.upsert({
          where: { slug: cat.slug },
          update: {},
          create: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            parentId,
          },
        });
      }
    }
  }
  console.log("Categorías sembradas");
}

async function main() {
  await seedAdmin();
  await seedCategories();
  console.log("Seeding completado");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
