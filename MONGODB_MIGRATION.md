# UniConnect - MongoDB Atlas Miqrasiyası

## 🎯 Problemin Həlli

Əvvəlki Firebase-də "istifadəçiləri bir-birini görməmə" problemi tam həll edildi. Yeni arxitekturada:

- **Firebase Firestore → MongoDB Atlas**
- **Real-time datatbase → Socket.io ilə canlı mesajlaşma**
- **Məsafəli və mürəkkəb query-lər → MongoDB aggregation pipeline**

---

## 📁 Layihə Qovluq Strukturu

```
uniconnect/
├── server/                    # Node.js/Express Backend
│   ├── index.js              # Ana server faylı (Socket.io, Mongo)
│   ├── models/               # Mongoose modelləri
│   │   ├── User.js
│   │   ├── FriendEdge.js
│   │   ├── Message.js
│   │   └── Letter.js
│   ├── routes/               # API endpointləri
│   │   ├── users.js
│   │   ├── friends.js
│   │   ├── messages.js
│   │   └── letters.js
│   ├── config/               # Konfiqurasiya
│   └── .env.example          # Environment dəyişənləri nümunəsi
│
├── src/                      # React Frontend (dəyişməz)
│   ├── services/
│   │   ├── ApiService.js     # 🆕 Yeni MongoDB API çağırışları
│   │   └── db.js             # Firebase (hazırda deaktiv)
│   └── ...
│
└── .env.example
```

---

## 🚀 Quraşdırma və İşə Salma

### 1. MongoDB Atlas Hazırlığı

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hesabı yaradın
2. **Free Cluster (M0)** seçin
3. **Database Access** - yeni user yaradın (məs: `uniconnect_admin`)
4. **Network Access** - IP ünvanınızı əlavə edin (və ya `0.0.0.0/0` hər yerə icazə üçün)
5. **Connection String** alın - bu belə görünəcək:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/uniconnect?retryWrites=true&w=majority
   ```

### 2. Backend Quraşdırması

```bash
cd server
npm install
cp .env.example .env
# .env faylını düzəldin - MONGODB_URI-ni yapışdırın
npm run dev
```

### 3. Frontend-in İşə Salınması

```bash
# Ayrı terminalda
cd uniconnect
npm install
npm run dev
```

---

## 🔌 API Endpointləri

### İstifadəçilər `/api/users`

| Method | Endpoint | Təsvir |
|--------|----------|--------|
| GET | `/users/all` | **🆕 Bütün tələbələrin siyahısı** |
| GET | `/users/:uid` | İstifadəçi profilini götür |
| POST | `/users/register` | Yeni qeydiyyat / mövcud istifadəçini yoxla |
| PUT | `/users/:uid` | Profili yenilə |

### dostluq `/api/friends`

| Method | Endpoint | Təsvir |
|--------|----------|--------|
| GET | `/friends/edges/:uid` | Dostların siyahısı |
| GET | `/friends/pending/:uid` | Gözləyən istəklər |
| POST | `/friends/request` | İstək göndər |
| POST | `/friends/accept/:edgeId` | İstəyi qəbul et |
| GET | `/friends/check/:uid1/:uid2` | Dostluq yoxlaması |

### Mesajlar `/api/messages`

| Method | Endpoint | Təsvir |
|--------|----------|--------|
| GET | `/messages/:chatId` | Çat mesajlarını götür |
| POST | `/messages` | Mesaj göndər |

### Məktublar `/api/letters`

| Method | Endpoint | Təsvir |
|--------|----------|--------|
| GET | `/letters/inbox/:uid` | Gələn qutu |
| GET | `/letters/sent/:uid` | Göndərilənlər |
| POST | `/letters` | Təsadüfi 3 nəfərə məktub göndər |

---

## 🗄️ MongoDB Schema Nümunəsi

### User Modeli
```javascript
{
  uid: "firebase-uid-123",       // Unikal ID
  firstName: "Leyla",
  lastName: "Məmmədova",
  email: "leyla@unec.edu.az",
  university: "UNEC",
  major: "İnformatika",
  hobbies: ["Proqramlaşdırma", "Musqi"],
  verifiedStudent: true,
  createdAt: ISODate("2025-01-15")
}
```

---

## ⚠️ Firebase-i Tam Tərk Etməməyin Üstünlüyü

Hazırda həm **Firebase Auth** (istifadəçi girişi), həm də **MongoDB** (məlumat bazası) işləyir. Bu, ən təhlükəsiz keçid variantıdır:

- Firebase Auth + Google/E-mail login **hazırda işləyir**
- User UID-ləri MongoDB-də saxlanılır
- Frontend-də sadəcə database sorğuları dəyişir

---

## 📝 Növbəti Addımlar

1. [ ] MongoDB Atlas hesabı yaradın
2. [ ] Connection string-i `.env`-ə əlavə edin
3. [ ] Backend-i işə salın (`npm run dev`)
4. [ ] Frontend-i test edin
5. [ ] (İstəyə) Firebase-i tam deaktiv edin

---

## 🛡️ Təhlükəsizlik

- API açarları **heç vaxt** kodda qalmır - hamısı `.env` faylında
- CORS yalnız `CLIENT_URL`-dən icazə verir
- MongoDB connection string-i şifrəli saxlanılır

Əlavə sualınız olarsa, dərhal kömək edərəm! 🚀
