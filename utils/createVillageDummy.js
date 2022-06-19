const newVillage = {
  resourcesStorage: {
    wheatAmount: 1000,
    clayAmount: 1000,
    woodAmount: 1000,
    ironAmount: 1000,
  },
  woodProductionPerH: 60,
  clayProductionPerH: 50,
  ironProductionPerH: 40,
  wheatProductionPerH: 30,
  unitTrainQueue: [],
  resourceFields: [
    {
      gridPosition: 0,
      id: 1,
      level: 1,
      type: "wood_field",
      description:
        "Forests are made for man to transform the trees into buildings, furniture and machines for war.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wood_level_1.png?alt=media&token=9f0e9136-e913-43e1-934a-7642b0b4b5fa",
    },
    {
      gridPosition: 1,
      id: 2,
      level: 1,
      type: "clay_field",
      description:
        "It processes clay from nearby mud to later be used for construction.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/clay_level_1.png?alt=media&token=8454ebc4-9bb3-4f19-a080-87ff44980f4e",
    },
    {
      gridPosition: 2,
      id: 3,
      level: 1,
      type: "wood_field",
      description:
        "Forests are made for man to transform the trees into buildings, furniture and machines for war.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wood_level_1.png?alt=media&token=9f0e9136-e913-43e1-934a-7642b0b4b5fa",
    },
    {
      gridPosition: 3,
      id: 4,
      level: 1,
      type: "wheat_field",
      description:
        "All armies move at the speed of their stomachs, and all powerful nations require high amounts of food, this farm ensures that.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wheat_level_1.png?alt=media&token=e5c2d4a5-e072-4967-9ee1-9fe6812c142e",
    },
    {
      gridPosition: 4,
      id: 5,
      level: 1,
      type: "iron_field",
      description:
        "From the depths of the earth, different metals are extracted to make armors, weapons and tools.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/iron_level_1.png?alt=media&token=d9858602-cc0d-412b-b3f2-2bb7e96352e3",
    },
    {
      gridPosition: 5,
      id: 6,
      level: 1,
      type: "iron_field",
      description:
        "From the depths of the earth, different metals are extracted to make armors, weapons and tools.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/iron_level_1.png?alt=media&token=d9858602-cc0d-412b-b3f2-2bb7e96352e3",
    },
    {
      gridPosition: 6,
      id: 7,
      level: 1,
      type: "wood_field",
      description:
        "Forests are made for man to transform the trees into buildings, furniture and machines for war.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wood_level_1.png?alt=media&token=9f0e9136-e913-43e1-934a-7642b0b4b5fa",
    },
    {
      gridPosition: 7,
      id: 8,
      level: 1,
      type: "clay_field",
      description:
        "It processes clay from nearby mud to later be used for construction.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/clay_level_1.png?alt=media&token=8454ebc4-9bb3-4f19-a080-87ff44980f4e",
    },
    {
      gridPosition: 8,
      id: 9,
      level: 1,
      type: "wheat_field",
      description:
        "All armies move at the speed of their stomachs, and all powerful nations require high amounts of food, this farm ensures that.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wheat_level_1.png?alt=media&token=e5c2d4a5-e072-4967-9ee1-9fe6812c142e",
    },
    {
      gridPosition: 9,
      id: 10,
      level: 1,
      type: "wheat_field",
      description:
        "All armies move at the speed of their stomachs, and all powerful nations require high amounts of food, this farm ensures that.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wheat_level_1.png?alt=media&token=e5c2d4a5-e072-4967-9ee1-9fe6812c142e",
    },
    {
      gridPosition: 10,
      id: 11,
      level: 1,
      type: "wood_field",
      description:
        "Forests are made for man to transform the trees into buildings, furniture and machines for war.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wood_level_1.png?alt=media&token=9f0e9136-e913-43e1-934a-7642b0b4b5fa",
    },
    {
      gridPosition: 11,
      id: 12,
      level: 1,
      type: "wheat_field",
      description:
        "All armies move at the speed of their stomachs, and all powerful nations require high amounts of food, this farm ensures that.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wheat_level_1.png?alt=media&token=e5c2d4a5-e072-4967-9ee1-9fe6812c142e",
    },
    {
      gridPosition: 12,
      id: 13,
      level: 1,
      type: "clay_field",
      description:
        "It processes clay from nearby mud to later be used for construction.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/clay_level_1.png?alt=media&token=8454ebc4-9bb3-4f19-a080-87ff44980f4e",
    },
    {
      gridPosition: 13,
      id: 14,
      level: 1,
      type: "wheat_field",
      description:
        "All armies move at the speed of their stomachs, and all powerful nations require high amounts of food, this farm ensures that.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wheat_level_1.png?alt=media&token=e5c2d4a5-e072-4967-9ee1-9fe6812c142e",
    },
    {
      gridPosition: 14,
      id: 15,
      level: 1,
      type: "iron_field",
      description:
        "From the depths of the earth, different metals are extracted to make armors, weapons and tools.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/iron_level_1.png?alt=media&token=d9858602-cc0d-412b-b3f2-2bb7e96352e3",
    },
    {
      gridPosition: 15,
      id: 16,
      level: 1,
      type: "wood_field",
      description:
        "Forests are made for man to transform the trees into buildings, furniture and machines for war.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/wood_level_1.png?alt=media&token=9f0e9136-e913-43e1-934a-7642b0b4b5fa",
    },
    {
      gridPosition: 16,
      id: 17,
      level: 1,
      type: "clay_field",
      description:
        "It processes clay from nearby mud to later be used for construction.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/clay_level_1.png?alt=media&token=8454ebc4-9bb3-4f19-a080-87ff44980f4e",
    },
    {
      gridPosition: 17,
      id: 18,
      level: 1,
      type: "clay_field",
      description:
        "It processes clay from nearby mud to later be used for construction.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/clay_level_1.png?alt=media&token=8454ebc4-9bb3-4f19-a080-87ff44980f4e",
    },
    {
      gridPosition: 18,
      id: 19,
      level: 1,
      type: "iron_field",
      description:
        "From the depths of the earth, different metals are extracted to make armors, weapons and tools.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/iron_level_1.png?alt=media&token=d9858602-cc0d-412b-b3f2-2bb7e96352e3",
    },
    {
      gridPosition: 19,
      id: 20,
      level: 1,
      type: "iron_field",
      description:
        "From the depths of the earth, different metals are extracted to make armors, weapons and tools.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/iron_level_1.png?alt=media&token=d9858602-cc0d-412b-b3f2-2bb7e96352e3",
    },
  ],
  villageBuildings: [
    {
      gridPosition: 0,
      id: 21,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 1,
      id: 22,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 2,
      id: 23,
      level: 1,
      type: "barracks",
      description:
        "On the halls of this building, normal citizens become warriors, ready to serve their lords and lands.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/vojasnica.png?alt=media&token=4aa41cf7-ac2e-45de-ae03-6e34704882c7",
    },
    {
      gridPosition: 3,
      id: 24,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 4,
      id: 25,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 5,
      id: 26,
      level: 1,
      type: "granary",
      description:
        "The granary is where the seeds for the new season of growth are safely stored.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/zitnica.png?alt=media&token=42bcf843-1fcd-491b-b999-47470a112aac",
    },
    {
      gridPosition: 6,
      id: 27,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 7,
      id: 28,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 8,
      id: 29,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 9,
      id: 30,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 10,
      id: 31,
      level: 1,
      type: "warehouse",
      description:
        "In this building, the spoils of war, the harvest of the season, the riches mined from the earth and the hand made craft are safely stored.",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/skladisce.png?alt=media&token=23b1c22a-c5fc-4324-8e05-7e556e13d254",
    },
    {
      gridPosition: 11,
      id: 32,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 12,
      id: 33,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 13,
      id: 34,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 14,
      id: 35,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
    {
      gridPosition: 15,
      id: 36,
      level: 0,
      type: "empty_field",
      description: "This plot of land is ready to be used for construction",
      imageGrid:
        "https://firebasestorage.googleapis.com/v0/b/app-deus-ex-machina.appspot.com/o/Big_empty_03.png?alt=media&token=2b953da6-1176-474e-8d22-94c471ce2ddd",
    },
  ],

  currentlyBuilding: [],
  population: 28,
};

module.exports = {
  newVillage: newVillage,
};
