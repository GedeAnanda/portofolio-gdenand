/*
 * An in-browser stand-in for the Olahin Express API. Routes, status codes,
 * messages and response shapes follow the real controllers and Prisma schema
 * (github.com/GedeAnanda/BE-Olahin); the rows themselves are sample data.
 */

export type Method = "GET" | "POST";

export interface Endpoint {
  id: string;
  group: string;
  /** Request name in the team's Postman collection. */
  name: string;
  method: Method;
  auth: boolean;
}

export const endpoints: Endpoint[] = [
  { id: "login", group: "Auth", name: "Login", method: "POST", auth: false },
  { id: "me", group: "Auth", name: "getMe", method: "GET", auth: true },
  { id: "search", group: "Recipes", name: "getSearchBybahan", method: "GET", auth: false },
  { id: "popular", group: "Recipes", name: "getResepPopular", method: "GET", auth: false },
  { id: "expiring", group: "Ingredients", name: "getExpiringIngredients", method: "GET", auth: true },
  { id: "budget", group: "Budget", name: "getBudgetThisMonth", method: "GET", auth: true },
  { id: "challenges", group: "Challenge", name: "getAllChallenge", method: "GET", auth: false },
  { id: "join", group: "Challenge", name: "joinChallenge", method: "POST", auth: true },
];

export const fridgeItems = [
  "telur",
  "nasi",
  "tahu",
  "tempe",
  "ayam",
  "mie",
  "kentang",
  "cabai",
  "bawang merah",
  "bawang putih",
  "kecap manis",
  "wortel",
];

const USER = {
  id: "3b9f6a2e-71c4-4d0e-9a52-8f1d2c6e4b17",
  name: "Gede Ananda",
  email: "nanda@olahin.id",
  avatarUrl: null,
  bio: "Masak hemat anak kos.",
  createdAt: "2026-05-02T08:14:22.000Z",
};
export const DEMO_LOGIN = { email: USER.email, password: "olahin123" };

const CHEF = { id: "c81e728d-9d4c-4f8f-a1b2-5e3f0a7d9c21", name: "Sekar Ayu", avatarUrl: null };

type Row = [title: string, description: string, budgetIdr: number, servingSize: number, cookTimeMin: number, isPopular: boolean, ingredients: [string, string, string | null][]];

const rows: Row[] = [
  ["Nasi Goreng Telur", "Nasi goreng kecap sederhana, cukup satu wajan.", 12000, 1, 15, true, [["nasi", "1", "piring"], ["telur", "1", "butir"], ["bawang merah", "3", "siung"], ["bawang putih", "2", "siung"], ["kecap manis", "2", "sdm"]]],
  ["Telur Dadar Tahu", "Dadar tebal campur tahu, lauk murah yang mengenyangkan.", 9000, 2, 15, false, [["telur", "2", "butir"], ["tahu", "2", "potong"], ["bawang merah", "2", "siung"], ["cabai", "2", "buah"]]],
  ["Tempe Orek Kecap", "Tempe manis pedas, awet buat lauk beberapa hari.", 10000, 3, 20, true, [["tempe", "1", "papan"], ["kecap manis", "3", "sdm"], ["cabai", "4", "buah"], ["bawang merah", "4", "siung"], ["bawang putih", "2", "siung"]]],
  ["Mie Goreng Sayur", "Mie goreng rumahan dengan sayur yang ada.", 11000, 1, 15, false, [["mie", "1", "bungkus"], ["telur", "1", "butir"], ["wortel", "1", "buah"], ["bawang putih", "2", "siung"], ["kecap manis", "1", "sdm"]]],
  ["Sop Ayam Sayur", "Sop bening hangat untuk empat porsi.", 25000, 4, 40, false, [["ayam", "250", "gram"], ["wortel", "2", "buah"], ["kentang", "2", "buah"], ["bawang putih", "3", "siung"]]],
  ["Tahu Tempe Bacem", "Bacem manis gurih, tinggal goreng sebelum makan.", 14000, 4, 45, false, [["tahu", "4", "potong"], ["tempe", "1", "papan"], ["bawang merah", "5", "siung"], ["bawang putih", "3", "siung"], ["kecap manis", "2", "sdm"]]],
  ["Ayam Kecap Pedas", "Ayam masak kecap dengan cabai, cocok buat bekal.", 28000, 3, 35, true, [["ayam", "500", "gram"], ["kecap manis", "4", "sdm"], ["cabai", "5", "buah"], ["bawang merah", "5", "siung"], ["bawang putih", "3", "siung"]]],
  ["Sambal Telur", "Telur rebus dibalut sambal tomat.", 10000, 2, 20, false, [["telur", "4", "butir"], ["cabai", "6", "buah"], ["bawang merah", "4", "siung"], ["bawang putih", "2", "siung"]]],
  ["Perkedel Kentang", "Perkedel lembut, bisa disimpan di kulkas.", 12000, 3, 30, false, [["kentang", "4", "buah"], ["telur", "1", "butir"], ["bawang putih", "2", "siung"], ["bawang merah", "3", "siung"]]],
  ["Nasi Ayam Kecap", "Sisa ayam kecap dan nasi jadi satu piring.", 16000, 1, 15, false, [["nasi", "1", "piring"], ["ayam", "100", "gram"], ["kecap manis", "2", "sdm"], ["cabai", "1", "buah"]]],
  ["Kentang Balado", "Kentang goreng dengan balado cabai merah.", 13000, 3, 25, false, [["kentang", "3", "buah"], ["cabai", "8", "buah"], ["bawang merah", "5", "siung"], ["bawang putih", "2", "siung"]]],
  ["Omelet Mie", "Mie instan dan telur jadi omelet renyah.", 8000, 1, 12, false, [["mie", "1", "bungkus"], ["telur", "2", "butir"], ["cabai", "1", "buah"]]],
];

const hex = (seed: number, len: number) => {
  let x = seed * 2654435761;
  let out = "";
  while (out.length < len) {
    x = (x ^ (x >>> 13)) * 1274126177;
    out += ((x >>> 0) % 16).toString(16);
  }
  return out;
};
const uuid = (seed: number) => `${hex(seed, 8)}-${hex(seed + 1, 4)}-4${hex(seed + 2, 3)}-a${hex(seed + 3, 3)}-${hex(seed + 4, 12)}`;

const recipes = rows.map(([title, description, budgetIdr, servingSize, cookTimeMin, isPopular, ingredients], i) => {
  const id = uuid(100 + i * 7);
  return {
    id,
    userId: CHEF.id,
    title,
    description,
    imageUrl: null,
    budgetIdr,
    servingSize,
    cookTimeMin,
    isPopular,
    createdAt: new Date(Date.UTC(2026, 5, 20 - i, 9, 30)).toISOString(),
    user: CHEF,
    ingredients: ingredients.map(([name, quantity, unit], j) => ({ id: uuid(1000 + i * 40 + j * 5), recipeId: id, name, quantity, unit })),
    _count: { bookmarks: [41, 12, 37, 9, 18, 7, 52, 15, 6, 11, 8, 23][i] },
  };
});

const challenges = [
  {
    id: uuid(5001),
    userId: CHEF.id,
    title: "Seminggu Masak di Bawah 15 Ribu",
    description: "Masak tiap hari dengan budget maksimal Rp15.000 per porsi, unggah foto hasilnya.",
    recipeId: recipes[0].id,
    weekStart: "2026-09-28T00:00:00.000Z",
    weekEnd: "2026-10-04T23:59:59.000Z",
    recipe: { id: recipes[0].id, title: recipes[0].title, imageUrl: null, budgetIdr: recipes[0].budgetIdr },
    _count: { participants: 128 },
  },
  {
    id: uuid(5011),
    userId: CHEF.id,
    title: "Tempe Week",
    description: "Satu bahan, tujuh olahan. Tunjukkan kreasi tempe terbaikmu.",
    recipeId: recipes[2].id,
    weekStart: "2026-09-21T00:00:00.000Z",
    weekEnd: "2026-09-27T23:59:59.000Z",
    recipe: { id: recipes[2].id, title: recipes[2].title, imageUrl: null, budgetIdr: recipes[2].budgetIdr },
    _count: { participants: 86 },
  },
];

/* ------------------------------------------------------------------ */

export interface ApiRequest {
  endpoint: string;
  /** Selected fridge items, for the search route. */
  ingredients: string[];
  /** Raw JSON body, for login. */
  body: string;
  token: string | null;
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

export function requestLine(req: ApiRequest): { method: Method; path: string } {
  const now = new Date();
  switch (req.endpoint) {
    case "login":
      return { method: "POST", path: "/api/auth/login" };
    case "me":
      return { method: "GET", path: "/api/auth/me" };
    case "search":
      return { method: "GET", path: `/api/recipes/search?ingredients=${req.ingredients.join(",")}` };
    case "popular":
      return { method: "GET", path: "/api/recipes?popular=true&limit=3" };
    case "expiring":
      return { method: "GET", path: "/api/ingredients/expiring" };
    case "budget":
      return { method: "GET", path: `/api/budgets?month=${now.getMonth() + 1}&year=${now.getFullYear()}` };
    case "challenges":
      return { method: "GET", path: "/api/challenges" };
    default:
      return { method: "POST", path: `/api/challenges/${challenges[0].id}/join` };
  }
}

function base64url(value: object) {
  return btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export function makeToken() {
  const iat = Math.floor(Date.now() / 1000);
  return `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url({ id: USER.id, email: USER.email, iat, exp: iat + 7 * 86400 })}.demo-signature`;
}

const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

/** Joined challenges, kept for the page session so a second join fails like the real API. */
const joined = new Set<string>();

export function handle(req: ApiRequest): ApiResponse {
  const ep = endpoints.find((e) => e.id === req.endpoint)!;

  // auth.middleware.js
  if (ep.auth && !req.token) return { status: 401, body: { success: false, message: "Token tidak ditemukan" } };

  switch (ep.id) {
    case "login": {
      let parsed: Record<string, unknown> = {};
      try {
        const value = JSON.parse(req.body);
        if (value && typeof value === "object") parsed = value;
      } catch {
        return { status: 400, body: { success: false, message: "Body harus berupa JSON" } };
      }
      const email = typeof parsed.email === "string" ? parsed.email : "";
      const password = typeof parsed.password === "string" ? parsed.password : "";
      // validate(loginSchema)
      const errors: { field: string; message: string }[] = [];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ field: "email", message: "Format email tidak valid" });
      if (password.length < 1) errors.push({ field: "password", message: "Password wajib diisi" });
      if (errors.length) return { status: 400, body: { success: false, message: "Validasi gagal", errors } };
      if (email.toLowerCase() !== DEMO_LOGIN.email) return { status: 400, body: { success: false, message: "Email tidak ditemukan" } };
      if (password !== DEMO_LOGIN.password) return { status: 400, body: { success: false, message: "Password salah" } };
      return {
        status: 200,
        body: {
          success: true,
          message: "Login Berhasil",
          data: { user: { id: USER.id, name: USER.name, email: USER.email }, token: makeToken() },
        },
      };
    }

    case "me":
      return { status: 200, body: { success: true, message: "Berhasil ambil data user", data: USER } };

    case "search": {
      if (req.ingredients.length === 0) return { status: 400, body: { success: false, message: "Bahan wajib diisi" } };
      // Same rule as searchRecipeByIngredients: a recipe must use every ingredient asked for.
      const wanted = req.ingredients.map((i) => i.trim().toLowerCase());
      const data = recipes.filter((r) => wanted.every((w) => r.ingredients.some((i) => i.name.toLowerCase() === w)));
      if (data.length === 0) return { status: 200, body: { success: true, message: "Belum ada resep untuk bahan ini", data: [] } };
      return { status: 200, body: { success: true, message: "Berhasil mencari resep", data } };
    }

    case "popular": {
      const all = recipes.filter((r) => r.isPopular);
      return {
        status: 200,
        body: {
          success: true,
          message: "Berhasil ambil semua resep",
          data: all.slice(0, 3),
          meta: { total: all.length, page: 1, limit: 3, totalPages: Math.ceil(all.length / 3) },
        },
      };
    }

    case "expiring":
      return {
        status: 200,
        body: {
          success: true,
          message: "Berhasil ambil bahan yang akan kadalaurasa",
          data: [
            { id: uuid(7001), userId: USER.id, name: "Tahu", category: "Protein", quantity: 4, unit: "potong", expiredAt: daysFromNow(1), createdAt: daysFromNow(-3) },
            { id: uuid(7011), userId: USER.id, name: "Bayam", category: "Sayur", quantity: 1, unit: "ikat", expiredAt: daysFromNow(2), createdAt: daysFromNow(-2) },
            { id: uuid(7021), userId: USER.id, name: "Telur", category: "Protein", quantity: 6, unit: "butir", expiredAt: daysFromNow(3), createdAt: daysFromNow(-6) },
          ],
        },
      };

    case "budget": {
      const now = new Date();
      const transactions = [
        { title: "Belanja sayur pasar", amount: 48000, type: "EXPENSE", d: -1 },
        { title: "Kiriman uang makan", amount: 300000, type: "INCOME", d: -5 },
        { title: "Telur 1 kg", amount: 29000, type: "EXPENSE", d: -6 },
        { title: "Beras 5 kg", amount: 72000, type: "EXPENSE", d: -9 },
      ].map((t, i) => ({ id: uuid(8001 + i * 9), userId: USER.id, budgetId: uuid(8000), title: t.title, amount: t.amount, type: t.type, createdAt: daysFromNow(t.d) }));
      const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((a, t) => a + t.amount, 0);
      const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((a, t) => a + t.amount, 0);
      const limitAmount = 600000;
      return {
        status: 200,
        body: {
          success: true,
          message: "Berhasil ambil budget",
          data: {
            id: uuid(8000),
            userId: USER.id,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
            limitAmount,
            createdAt: daysFromNow(-12),
            transactions,
            totalExpense,
            totalIncome,
            remaining: limitAmount - totalExpense,
          },
        },
      };
    }

    case "challenges":
      return { status: 200, body: { success: true, message: "Berhasil ambil semua challenge", data: challenges } };

    case "join": {
      const challenge = challenges[0];
      if (joined.has(challenge.id)) return { status: 400, body: { success: false, message: "Kamu sudah ikut challenge ini" } };
      joined.add(challenge.id);
      const { recipe: _recipe, _count, ...plain } = challenge;
      void _recipe;
      void _count;
      return {
        status: 201,
        body: {
          success: true,
          message: "Berhasil ikut challenge",
          data: {
            id: uuid(9001),
            userId: USER.id,
            challengeId: challenge.id,
            joinedAt: new Date().toISOString(),
            submissionUrl: null,
            challenge: plain,
            user: { id: USER.id, name: USER.name, avatarUrl: USER.avatarUrl },
          },
        },
      };
    }
  }
  return { status: 404, body: { success: false, message: "Not found" } };
}

export function resetJoined() {
  joined.clear();
}
