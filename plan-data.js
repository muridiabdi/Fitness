window.FITNESS_PLAN = {
  weeks: [
    { title: "Week 1 · Find your rhythm", focus: "Practise the movements and finish each set with about 3 good reps left.", progression: "Start conservatively. Learn a comfortable range of motion and note the weights you use." },
    { title: "Week 2 · Build your reps", focus: "Keep the same weights and add a rep where it feels smooth.", progression: "Only add reps with tidy form and no painful symptoms; otherwise repeat Week 1." },
    { title: "Week 3 · Build your strength", focus: "Nudge the load up only after you reach the top of the rep range comfortably.", progression: "Add the smallest available increase (about 2–5%) and return to the bottom of the rep range." },
    { title: "Week 4 · Recover and review", focus: "Deload: use one fewer set on most lifts and keep every set easy, with 3–4 reps in reserve.", progression: "No max attempts or hard finisher this week. Use the check-in to decide what to repeat or build next." }
  ],
  workouts: [
    {
      day: "Session 1", name: "Upper A · Push & pull", warmup: "5 minutes easy bike or treadmill, then 1–2 light warm-up sets for the first two lifts.", exercises: [
        { name: "Machine chest press", sets: 3, reps: "8–10", rest: "90 sec" },
        { name: "Chest-supported row", sets: 3, reps: "8–10", rest: "90 sec" },
        { name: "Incline dumbbell press", sets: 3, reps: "10–12", rest: "75 sec" },
        { name: "Neutral-grip lat pulldown", sets: 3, reps: "10–12", rest: "75 sec" },
        { name: "Cable lateral raise", sets: 2, reps: "12–15", rest: "45 sec" },
        { name: "Rope triceps press-down", sets: 2, reps: "10–15", rest: "45 sec" },
        { name: "Dumbbell curl", sets: 2, reps: "10–15", rest: "45 sec" }
      ]
    },
    {
      day: "Session 2", name: "Lower A · Controlled strength", warmup: "5 minutes gentle cycling and a few unloaded hinges; use a comfortable, controlled range.", exercises: [
        { name: "Leg press", sets: 3, reps: "8–10", rest: "120 sec", note: "Use a comfortable depth and keep each rep controlled." },
        { name: "Dumbbell Romanian deadlift", sets: 3, reps: "8–10", rest: "120 sec", note: "Hinge only as far as you can maintain a steady back position." },
        { name: "Seated leg curl", sets: 3, reps: "10–12", rest: "75 sec" },
        { name: "Glute bridge or hip-thrust machine", sets: 2, reps: "10–12", rest: "75 sec" },
        { name: "Calf press", sets: 2, reps: "12–15", rest: "45 sec" },
        { name: "Dead bug", sets: 2, reps: "8 each side", rest: "45 sec" }
      ]
    },
    {
      day: "Session 3", name: "Upper B · Strength & volume", warmup: "5 minutes easy cardio and light warm-up sets for the first two lifts.", exercises: [
        { name: "Dumbbell bench press", sets: 3, reps: "8–10", rest: "90 sec" },
        { name: "Seated cable row", sets: 3, reps: "8–10", rest: "90 sec" },
        { name: "Machine shoulder press", sets: 3, reps: "8–12", rest: "75 sec" },
        { name: "Close-grip lat pulldown", sets: 3, reps: "10–12", rest: "75 sec" },
        { name: "Cable chest fly", sets: 2, reps: "12–15", rest: "45 sec" },
        { name: "Face pull", sets: 2, reps: "12–15", rest: "45 sec" },
        { name: "Cable curl + rope press-down", sets: 2, reps: "10–15 each", rest: "45 sec" }
      ]
    },
    {
      day: "Session 4", name: "Lower B · Hinge & finish", warmup: "5 minutes easy bike and a few unweighted hinges; keep the movement comfortable.", finisher: "Optional: 8 minutes on a bike at a steady, conversational effort. Skip it if tired or uncomfortable.", exercises: [
        { name: "Smith-machine Romanian deadlift", sets: 3, reps: "8–10", rest: "120 sec" },
        { name: "Leg extension", sets: 3, reps: "10–12", rest: "75 sec" },
        { name: "Lying or seated leg curl", sets: 3, reps: "10–12", rest: "75 sec" },
        { name: "Low step-up", sets: 2, reps: "8 each side", rest: "75 sec", note: "Use a low step and controlled movement." },
        { name: "Calf raise", sets: 2, reps: "12–15", rest: "45 sec" },
        { name: "Pallof press", sets: 2, reps: "10 each side", rest: "45 sec" }
      ]
    }
  ],
  mealOptions: {
    breakfast: [
      { name: "Berry-yogurt oats", details: "50 g oats, 250 g 0% Greek yogurt, frozen berries and a teaspoon of honey.", calories: 460, protein: 35 },
      { name: "Eggs, spinach & wholemeal toast", details: "2 eggs plus egg whites, spinach and 2 slices of wholemeal toast.", calories: 450, protein: 32 },
      { name: "Quick yogurt and fruit bowl", details: "Greek yogurt, oats, banana, berries and a small spoon of peanut butter.", calories: 440, protein: 34 },
      { name: "Apple-cinnamon overnight oats", details: "Oats, Greek yogurt, grated apple and cinnamon; make the night before.", calories: 460, protein: 34 }
    ],
    lunch: [
      { name: "Chicken & tomato wholewheat pasta", details: "150 g cooked chicken, 80 g dry pasta, passata and frozen veg.", calories: 650, protein: 52 },
      { name: "Tuna arrabbiata pasta", details: "A tin of tuna, 80 g dry pasta, passata, chilli and spinach.", calories: 620, protein: 48 },
      { name: "Beef-ragu pasta", details: "Lean beef mince, 75 g dry pasta, passata and grated carrot.", calories: 680, protein: 50 },
      { name: "Chicken, tomato & mozzarella wrap", details: "Wholemeal wraps, cooked chicken, tomato, a little mozzarella and salad.", calories: 640, protein: 48 },
      { name: "Chicken & lentil tomato soup", details: "Chicken, lentils, passata and frozen vegetables; serve with a wholemeal roll.", calories: 650, protein: 51 }
    ],
    dinner: [
      { name: "Easy beef bolognese", details: "150 g lean beef mince, 80 g dry pasta, passata and frozen vegetables.", calories: 700, protein: 52 },
      { name: "Chicken tomato orzo", details: "Chicken breast, orzo, passata, spinach and a little grated cheese.", calories: 680, protein: 52 },
      { name: "Turkey meatballs & spaghetti", details: "Turkey mince, spaghetti, passata and frozen vegetables.", calories: 680, protein: 50 },
      { name: "Tuna jacket potato & tomato salad", details: "A large potato, tuna mixed with Greek yogurt and a simple salad.", calories: 650, protein: 48 },
      { name: "Chicken pesto pasta", details: "Chicken, wholewheat pasta, vegetables and a small amount of pesto.", calories: 700, protein: 52 },
      { name: "Beef & bean tomato pasta", details: "Lean beef, kidney beans, passata and wholewheat pasta.", calories: 690, protein: 51 },
      { name: "Chicken, chickpea & tomato traybake", details: "Chicken, chickpeas, peppers and passata; serve with a measured portion of rice.", calories: 700, protein: 51 }
    ],
    snack: [
      { name: "Snack bar, fruit & a treat portion", details: "One protein bar, an apple or banana, plus a small portion of crisps or chocolate if wanted.", calories: 410, protein: 25 },
      { name: "Greek yogurt, fruit & chocolate", details: "200 g Greek yogurt, a piece of fruit and 15–20 g chocolate.", calories: 390, protein: 24 },
      { name: "Protein bar & banana", details: "One protein bar and a banana.", calories: 360, protein: 23 },
      { name: "Skyr, berries & measured crisps", details: "A pot of skyr, berries and a single-serve portion of crisps.", calories: 400, protein: 26 }
    ]
  },
  menuCycles: [
    { breakfast: [0, 1, 0, 2, 3, 0, 1], lunch: [0, 1, 2, 3, 0, 4, 1], dinner: [0, 1, 2, 3, 4, 5, 6], snack: [0, 2, 1, 0, 3, 2, 1] },
    { breakfast: [3, 0, 1, 0, 2, 3, 0], lunch: [2, 0, 3, 1, 4, 2, 0], dinner: [2, 5, 1, 6, 0, 3, 4], snack: [1, 0, 2, 3, 0, 1, 2] },
    { breakfast: [1, 2, 0, 3, 1, 0, 2], lunch: [1, 3, 0, 2, 1, 4, 3], dinner: [5, 4, 0, 2, 6, 1, 3], snack: [2, 3, 0, 1, 2, 0, 3] },
    { breakfast: [0, 3, 2, 1, 0, 2, 3], lunch: [3, 4, 1, 0, 2, 3, 4], dinner: [1, 6, 3, 5, 2, 4, 0], snack: [0, 1, 3, 2, 1, 0, 3] }
  ],
  groceries: [
    [
      { section: "Protein & dairy", items: ["1.2 kg chicken breast", "600 g lean beef mince", "2–3 tins tuna", "12 eggs", "1 kg 0% Greek yogurt", "7 protein bars"] },
      { section: "Carbs & cupboard", items: ["1 kg wholewheat pasta", "500 g oats", "4 wholemeal wraps", "4 large potatoes", "2 tins lentils or beans", "4 cartons passata", "Pesto"] },
      { section: "Fruit, veg & snacks", items: ["Frozen berries (700 g)", "7 pieces of fruit", "1 bag spinach", "1–2 bags frozen mixed veg", "Tomatoes and salad", "Small portions of crisps or chocolate if wanted"] }
    ],
    [
      { section: "Protein & dairy", items: ["1.3 kg chicken breast", "600 g lean beef mince", "2 tins tuna", "500 g turkey mince", "1 kg Greek yogurt", "7 protein bars"] },
      { section: "Carbs & cupboard", items: ["1 kg wholewheat pasta or spaghetti", "500 g oats", "4 wholemeal rolls or wraps", "4 potatoes", "3–4 cartons passata", "1 tin chickpeas", "Rice (small bag)"] },
      { section: "Fruit, veg & snacks", items: ["Frozen berries (700 g)", "7 pieces of fruit", "Spinach", "Frozen mixed vegetables", "Peppers and salad", "A few single-serve crisps or chocolate portions"] }
    ],
    [
      { section: "Protein & dairy", items: ["1.2 kg chicken breast", "500 g lean beef mince", "3 tins tuna", "12 eggs", "1 kg Greek yogurt or skyr", "7 protein bars"] },
      { section: "Carbs & cupboard", items: ["1 kg wholewheat pasta", "500 g oats", "4 wholemeal wraps", "4 large potatoes", "3 cartons passata", "2 tins kidney beans", "Orzo or rice (small bag)"] },
      { section: "Fruit, veg & snacks", items: ["Frozen berries (700 g)", "7 pieces of fruit", "Spinach", "Frozen mixed vegetables", "Carrots and tomatoes", "Small treat portions to fit your snack target"] }
    ],
    [
      { section: "Protein & dairy", items: ["1.2 kg chicken breast", "500 g turkey mince", "500 g lean beef mince", "2 tins tuna", "1 kg Greek yogurt", "7 protein bars"] },
      { section: "Carbs & cupboard", items: ["1 kg wholewheat pasta", "500 g oats", "4 wholemeal wraps or rolls", "4 potatoes", "4 cartons passata", "1 tin chickpeas", "Rice (small bag)"] },
      { section: "Fruit, veg & snacks", items: ["Frozen berries (700 g)", "7 pieces of fruit", "Spinach", "Frozen mixed vegetables", "Peppers, tomatoes and salad", "Optional single-serve crisps or chocolate"] }
    ]
  ],
  nutritionNote: "Meal calories and protein are estimates; brands and portions vary. Use packet labels and log your actual portions. Adapt ingredients to your own dietary needs."
};
