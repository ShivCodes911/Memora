# Memora Backend: Plan

What's **done**, what's **left**, **why** each item matters, and **how** to do it.

> **How to read this file**
> - 🟢 = done, 🟡 = started, 🔴 = to do.
> - Work through the phases **in order**. Each one makes the next one safer.
> - Tick `[x]` only when a change is **done and tested in Postman**.
> - Paths are relative to `memora-backend/src/`.

---

## 1. The big picture

```mermaid
flowchart LR
    A["🟢 Done<br/>Collections, sharing,<br/>content features"] --> B["🟡 Finish<br/>what's started"]
    B --> C["🔴 Phase 1<br/>Security"]
    C --> D["🔴 Phase 2<br/>Bug fixes"]
    D --> E["🔴 Phase 3<br/>Code quality"]
    E --> F["🔴 Phase 4<br/>Performance"]
    F --> G["🔴 Phase 5<br/>Testing"]
    G --> H["🔴 Phase 6<br/>Deploy"]
    H --> I(["🚀 Launch"])
    I --> J["Phase 7<br/>Startup features"]
```

**Why this order?** Security first, because nothing goes live while it's unsafe. Then bugs, then cleaner code, which makes everything after it easier. Performance comes before real traffic, tests protect what you've built, and deployment comes last.

---

## 2. What's done 🟢

```mermaid
flowchart TD
    subgraph AUTH["Auth"]
        A1["🟢 Signup / signin<br/>bcrypt + JWT"]
        A2["🟢 GET /auth/me"]
        A3["🟢 Signup no longer<br/>returns password hash"]
    end
    subgraph CONTENT["Content"]
        C1["🟢 Add / list / edit / delete"]
        C2["🟢 Add directly into a collection"]
        C3["🟢 Move between collections"]
        C4["🟢 Filter ?collectionId="]
        C5["🟢 No duplicate link<br/>in the same place"]
    end
    subgraph COLL["Collections"]
        L1["🟢 Create / list / rename"]
        L2["🟢 Delete: notes go<br/>back to All content"]
        L3["🟢 Share on / off<br/>revocable link"]
        L4["🟢 Public view<br/>no login needed"]
    end
    AUTH --> CONTENT --> COLL
```

| Done | Where |
|---|---|
| Collection model (`title`, `icon`, `userId`, sparse unique `shareHash`) | `models/collection.model.ts` |
| `collectionId` on content, and `link` no longer globally unique | `models/content.model.ts` |
| Compound unique index `{ userId, link, collectionId }` | `models/content.model.ts` |
| Secure share hashes (`crypto.randomBytes`) | `utils/hashingLink.util.ts` |
| Collection create / list / update / delete / share / public view | `modules/collection/collection.controller.ts` |
| `updateContent` moves notes; `addContent` accepts `collectionId`; `fetchContent` filters | `modules/content/content.controller.ts` |
| `addContent` catch narrows with `instanceof`: no `any`, no leaked `error.message` | `modules/content/content.controller.ts` |

---

## 3. Finish what's started 🟡

### 3.1 Signin status codes: `modules/auth/auth.controller.ts`

- **Why:** the message is now the same for both failures, but the **status codes differ** (404 vs 403). An attacker can still tell which usernames exist.
- **How:** use **401** for both, and remove the trailing space in the message.

```mermaid
flowchart TD
    S["POST /auth/signin"] --> U{"User found?"}
    U -- No --> E["401 Invalid username or password"]
    U -- Yes --> P{"Password matches?"}
    P -- No --> E
    P -- Yes --> T["200 + token"]
```

### 3.2 Finish `deleteContent`: `modules/content/content.controller.ts`

- **Why:**
  - **401** means "please log in".
  - **404** means "not found, or not yours".
  - The raw MongoDB report (`deleteContent: result`) is useless to the client.
- **How:** follow this flow exactly:

```mermaid
flowchart TD
    D["DELETE /content/:id"] --> A{"userId present?"}
    A -- No --> R401["401 Unauthorized"]
    A -- Yes --> V{"Valid ObjectId?"}
    V -- No --> R400["400 Provide valid Content ID"]
    V -- Yes --> Q["deleteOne _id + userId"]
    Q --> C{"deletedCount = 0?"}
    C -- Yes --> R404["404 content not found"]
    C -- No --> R200["200 message only<br/>no raw result"]
```

### 3.3 `addContent` duplicate → 409

- **Why:** `updateContent` already returns **409** for the same situation. One meaning should have one status code.
- **How:** change 400 to 409 in the 11000 branch, and log `"addContent failed"`.

---

## 4. Phase 1: Security 🔴 (before any real user)

```mermaid
flowchart LR
    S1["1.1 Valid web links only"] --> S2["1.2 Token expiry"]
    S2 --> S3["1.3 Validate signup/signin"]
    S3 --> S4["1.4 Rate limiting"]
    S4 --> S5["1.5 Lock CORS"]
    S5 --> S6["1.6 helmet + body limit"]
    S6 --> S7["1.7 Safe link previews"]
    S7 --> S8["1.8 Public views: only safe fields"]
    S8 --> S9["1.9 httpOnly cookie<br/>later"]
```

### 1.1 Only accept real web links (`addContent`)

- **Why:** links are shown as `<a href={link}>` on **public** pages. A `javascript:` link runs code on your site when a student clicks it, and can steal their login token.
- **How:** create `utils/validateLink.util.ts` with `toWebLink(input)`. Use it in `addContent`, and save the cleaned link.

```mermaid
flowchart TD
    I["link from req.body"] --> T{"Is it a string?"}
    T -- No --> X["null → 400"]
    T -- Yes --> TR["trim"]
    TR --> E{"Empty?"}
    E -- Yes --> X
    E -- No --> SC{"Has a scheme?<br/>e.g. https: or javascript:"}
    SC -- No --> ADD["add https:// in front"]
    SC -- Yes --> P
    ADD --> P{"new URL() parses?"}
    P -- No --> X
    P -- Yes --> PR{"protocol is<br/>http: or https: ?"}
    PR -- No --> X
    PR -- Yes --> OK["return url.href → save it"]
```

### 1.2 Make login tokens expire (`auth.controller.ts`)

- **Why:** a leaked token currently works **forever**.
- **How:** `jwt.sign({ id }, secret, { expiresIn: "7d" })`. `authMiddleware` already returns 401 when a token has expired.

### 1.3 Validate signup and signin input (`auth.controller.ts`)

- **Why:**
  - A missing password crashes bcrypt, which becomes a 500.
  - `{ "username": { "$ne": "" } }` passes a **database operator** straight into `findOne`.
- **How:** check everything **before** any query:

```mermaid
flowchart TD
    B["req.body"] --> U{"username is a string,<br/>3-30 chars, a-z 0-9 _ ?"}
    U -- No --> R["400 clear message"]
    U -- Yes --> P{"password is a string,<br/>8+ chars?"}
    P -- No --> R
    P -- Yes --> Q["now safe to query the database"]
```

### 1.4 to 1.9

| # | What | Why | How |
|---|---|---|---|
| 1.4 | Rate limiting (`app.ts`) | Stops password guessing and spam | `npm i express-rate-limit`. Auth routes: about 10 per 15 min. Everything else: about 300 per 15 min. When deployed: `app.set("trust proxy", 1)` |
| 1.5 | Lock CORS (`app.ts`) | `cors()` lets **any** website call your API | `cors({ origin: process.env.FRONTEND_URL })` |
| 1.6 | Security headers + body limit | Browsers block common attacks; huge bodies are refused | `npm i helmet` → `app.use(helmet())`, and `express.json({ limit: "100kb" })` |
| 1.7 | Safe link previews (`fetchMetadata`) | **SSRF:** your server can be made to fetch `localhost` or internal addresses. It also reads pages of any size | Reuse `toWebLink`; `dns.lookup` the host and reject `127.*`, `10.*`, `192.168.*`, `172.16-31.*`, `169.254.*`, `::1`; stop reading after about 1 MB |
| 1.8 | Public views send only safe fields | Notes currently include the owner's `userId`, `tags` and `__v` | `.select("link type title description")` in `getSharedCollection` and `fetchSharedContent` |
| 1.9 | Token in an httpOnly cookie *(after the rest)* | JavaScript can't read it, so an XSS bug can't steal the login | `res.cookie(..., { httpOnly, secure, sameSite: "lax" })`, `cookie-parser` in `authMiddleware`, `POST /auth/logout`, and `withCredentials` on the frontend |

---

## 5. Phase 2: Bug fixes 🔴

### 2.1 `deleteCollection` fails when a link is also in "All content"

- **Why:** suppose Class 5 and All content both contain link L. Moving Class 5's copy to `null` breaks the unique index. MongoDB throws 11000 halfway through, the collection is **never** deleted, and every retry fails the same way.
- **How:**

```mermaid
flowchart TD
    D["DELETE /collections/:id"] --> O{"Collection exists<br/>and is yours?"}
    O -- No --> N["404"]
    O -- Yes --> F["Find links already in<br/>All content (collectionId null)"]
    F --> DUP["Delete this collection's notes<br/>with those links: exact duplicates"]
    DUP --> MV["updateMany: move remaining<br/>notes to collectionId null"]
    MV --> DEL["deleteOne collection"]
    DEL --> OK["200"]
```

### 2.2 Brain sharing can't be turned off (`shareContent`)

- **Why:**
  - It returns the existing link **before** reading `share`, so `{ share: false }` never works.
  - The string `"false"` is truthy, so it **creates** a link.
- **How:** follow the same pattern as `shareCollection`:

```mermaid
flowchart TD
    S["POST /content/share"] --> B{"share is a boolean?"}
    B -- No --> R400["400"]
    B -- Yes --> T{"share = true?"}
    T -- Yes --> E{"Link already exists?"}
    E -- Yes --> SAME["200 same link"]
    E -- No --> NEW["create link → 200"]
    T -- No --> DEL["delete link → 200 Sharing turned off"]
```

### 2.3 to 2.8

| # | Where | What's wrong | Fix |
|---|---|---|---|
| 2.3 | `fetchSharedContent` | "link not found" and "user not found" return **401** | Return **404** |
| 2.4 | `middlewares/auth.middleware.ts` | A missing token returns **400**; there's a dead `if(!decodedToken)` block with no `return` | **401**, and delete the dead block |
| 2.5 | `signup` | "Exists" is 403, "created" is 200, a same-name race becomes a 500, and `${console.error(error)}` always prints "undefined" | 409, 201, 11000 → 409, log first and then send a plain message |
| 2.6 | `addContent` | An invalid `type` becomes a **500**; `tags` and `description` are unchecked; there are no length limits | Check `type` against the allowed list, `title` ≤ 200, `description` ≤ 5000, and validate or remove `tags` |
| 2.7 | `createCollection` / `updateCollection` | An `icon` object causes a 500; there are no length limits | `icon` must be a string ≤ 8 chars; `title` ≤ 60 |
| 2.8 | `shareCollection` | Two fast clicks can create two hashes, and the first link dies | Use an atomic `findOneAndUpdate` with `shareHash: { $exists: false }` |

---

## 6. Phase 3: Code quality 🔴

```mermaid
flowchart LR
    Q1["3.1 zod schemas"] --> Q2["3.2 helpers +<br/>global error handler"]
    Q2 --> Q3["3.3 one response shape"]
    Q3 --> Q4["3.4 env validation"]
    Q4 --> Q5["3.5 remove dead code"]
    Q5 --> Q6["3.6 format + naming"]
```

| # | What | Why | How |
|---|---|---|---|
| 3.1 | `zod` validation | Replaces dozens of hand-written `typeof` checks | `npm i zod`; create `validators/`; a `validate(schema)` middleware that returns 400 |
| 3.2 | Shared helpers | Stops copy-pasted code and scattered `catch` blocks | `utils/objectId.ts` (`isValidId`) and a **global error middleware** in `app.ts` (11000 → 409, everything else → "Internal server error"). No `asyncHandler` needed: Express 5 already passes errors from `async` handlers to the error middleware |
| 3.3 | One response shape | The frontend currently reads `data.collection`, `data.data.collection`, `updatedCollection.collection`… | Use `{ message, data }` everywhere, **before** building the collections frontend |
| 3.4 | Validate env vars at startup | Crash early with a clear message instead of failing later | `config/env.ts` checks `MONGO_URI`, `JWT_SECRET`, `PORT`, `FRONTEND_URL`. Also fix `.env.example` (`PORT=8000` → `3000`) |
| 3.5 | Remove dead code | `tags.model.ts` is unused, and its title is unique **across all users** | Delete it, or redesign it as per-user tags |
| 3.6 | Formatting + naming | Readability; logs you can search | Shift+Alt+F (or Prettier); make each log label match its function name |

---

## 7. Phase 4: Performance 🔴

### How a request should flow after this phase

```mermaid
flowchart LR
    R["GET /content?collectionId&limit&after"] --> M["authMiddleware"]
    M --> V["validate query"]
    V --> IDX["MongoDB uses index<br/>userId + collectionId + _id"]
    IDX --> L[".lean(), limit 30"]
    L --> RES["{ items, nextCursor }"]
```

| # | What | Why | How |
|---|---|---|---|
| 4.1 | Missing indexes | Without an index, MongoDB reads **every** document for each query | Content `{ userId:1, collectionId:1, _id:1 }`; collection `{ userId:1, createdAt:-1 }`; link `hash` → unique. Check them in Atlas → Indexes |
| 4.2 | Pagination | Today every note is sent at once (2,000 links means 2,000 every time) | `?limit=30&after=<lastId>` → `find({ _id: { $gt: after } }).limit(limit+1)` → `{ items, nextCursor }` |
| 4.3 | Lighter reads | Less memory and CPU | `.lean()` on read-only queries; remove `.populate("userId","username")` from `fetchContent` |
| 4.4 | Store link previews when saving | Today the server fetches the external site **every time a card is shown** | Save `preview: { image, favicon, domain }` in `addContent`; move the logic to `services/preview.ts` |

---

## 8. Phase 5: Testing 🔴

```mermaid
flowchart LR
    T0["Setup: vitest + supertest<br/>+ mongodb-memory-server"] --> T1["Auth tests"]
    T1 --> T2["Ownership tests"]
    T2 --> T3["Sharing tests"]
    T3 --> T4["Delete collection<br/>incl. duplicate case"]
    T4 --> T5["Duplicate link +<br/>javascript: link rejected"]
```

- **Why:** every time you or a teammate changes code, tests catch a broken rule in seconds, before users do.
- **How:**
  1. Add `"test": "vitest run"` and `"typecheck": "tsc --noEmit"` to `package.json`.
  2. Most important: **user B can never read, change, delete, move into, or create in user A's collection** (expect 404).

---

## 9. Phase 6: Deploy 🔴

```mermaid
flowchart LR
    B["build: tsc<br/>start: node dist/server.js"] --> H["GET /health"]
    H --> HOST["Render / Railway<br/>env vars in dashboard"]
    HOST --> DB["Atlas prod cluster<br/>backups ON"]
    DB --> LOG["pino logs + Sentry"]
    LOG --> CI["GitHub Actions:<br/>typecheck + test on every PR"]
    CI --> P(["Branch protection on main"])
```

| Step | Why |
|---|---|
| `build` / `start` scripts | `tsx watch` is for development only |
| `/health` | The host uses it to check the server is alive |
| Env vars in the hosting dashboard | Secrets never go into git |
| Atlas backups | One bad delete shouldn't lose everyone's data |
| Logging + Sentry | You learn about 500 errors before users report them |
| CI + branch protection | No PR can break `main` |

---

## 10. Phase 7: Startup features (after launch)

```mermaid
flowchart TD
    F1["Email + password reset"] --> F2["Share-link view count"]
    F2 --> F3["Collection description<br/>+ lesson order"]
    F3 --> F4["Delete account + export data"]
    F4 --> F5["Trash / soft delete"]
    F5 --> F6["Members, roles, invite codes"]
    F6 --> F7["Search"]
```

| Feature | Why it matters for teachers and teams |
|---|---|
| Email + password reset | A forgotten password shouldn't mean losing everything |
| View count | "Did my students open it?" is the first thing a teacher asks |
| Description + order | Lessons are taught in sequence |
| Delete account + export | Basic privacy, which matters when students are involved |
| Trash | Undo an accidental delete |
| Members & roles | Private classes, co-teachers, team spaces (a paid plan) |
| Search | Finding one link among hundreds |

---

## Definition of done (every item)

```mermaid
flowchart LR
    A["Code written"] --> B{"tsc --noEmit passes?"}
    B -- No --> A
    B -- Yes --> C{"Happy path + error cases<br/>tested?"}
    C -- No --> A
    C -- Yes --> D{"No password hash, error.message<br/>or internal fields in responses?"}
    D -- No --> A
    D -- Yes --> E["Commit on its own<br/>clear message"]
    E --> F(["Tick the box ✅"])
```
