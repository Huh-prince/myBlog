from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import re
import math
import uuid
import logging
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from xml.sax.saxutils import escape as xml_escape

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from fastapi.responses import PlainTextResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# ---- Config & DB ----
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ['ADMIN_EMAIL'].lower()
ADMIN_PASSWORD_HASH = os.environ['ADMIN_PASSWORD_HASH']
COOKIE_NAME = "access_token"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Learning Journey API")
api = APIRouter(prefix="/api")


# ---- Helpers ----
def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-") or uuid.uuid4().hex[:8]


def reading_time(content: str) -> int:
    words = len(re.findall(r"\w+", content or ""))
    return max(1, math.ceil(words / 220))


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(email: str) -> str:
    payload = {
        "sub": email,
        "role": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def require_admin(request: Request) -> dict:
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin" or payload.get("sub") != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"email": payload["sub"], "role": "admin"}


# ---- Models ----
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class PostIn(BaseModel):
    title: str
    excerpt: str = ""
    content: str
    tags: List[str] = []
    cover_image: Optional[str] = ""
    published: bool = True


class PostOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    slug: str
    title: str
    excerpt: str
    content: str
    tags: List[str]
    cover_image: Optional[str] = ""
    reading_time: int
    published: bool
    created_at: str
    updated_at: str


class CommentIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    body: str = Field(min_length=1, max_length=4000)


# ---- Auth endpoints ----
@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    if payload.email.lower() != ADMIN_EMAIL or not verify_password(payload.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(ADMIN_EMAIL)
    response.set_cookie(
        key=COOKIE_NAME, value=token, httponly=True, secure=True,
        samesite="lax", max_age=7 * 24 * 3600, path="/",
    )
    return {"email": ADMIN_EMAIL, "role": "admin"}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(require_admin)):
    return user


# ---- Posts (public) ----
def _post_to_out(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "slug": doc["slug"],
        "title": doc["title"],
        "excerpt": doc.get("excerpt", ""),
        "content": doc.get("content", ""),
        "tags": doc.get("tags", []),
        "cover_image": doc.get("cover_image", ""),
        "reading_time": doc.get("reading_time", reading_time(doc.get("content", ""))),
        "published": doc.get("published", True),
        "created_at": doc.get("created_at", ""),
        "updated_at": doc.get("updated_at", ""),
    }


@api.get("/posts")
async def list_posts(
    q: Optional[str] = Query(default=None),
    tag: Optional[str] = Query(default=None),
    include_unpublished: bool = False,
):
    query: dict = {}
    if not include_unpublished:
        query["published"] = True
    if tag:
        query["tags"] = tag
    if q:
        # Search title, excerpt, content, tags
        regex = {"$regex": re.escape(q), "$options": "i"}
        query["$or"] = [
            {"title": regex},
            {"excerpt": regex},
            {"content": regex},
            {"tags": regex},
        ]
    docs = await db.posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return [_post_to_out(d) for d in docs]


@api.get("/posts/tags")
async def all_tags():
    pipeline = [
        {"$match": {"published": True}},
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    res = await db.posts.aggregate(pipeline).to_list(500)
    return [{"tag": r["_id"], "count": r["count"]} for r in res]


@api.get("/posts/{slug}")
async def get_post(slug: str):
    doc = await db.posts.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Post not found")
    return _post_to_out(doc)


@api.get("/posts/{slug}/related")
async def related_posts(slug: str, limit: int = 3):
    doc = await db.posts.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Post not found")
    tags = doc.get("tags", [])
    if not tags:
        return []
    cursor = db.posts.find(
        {"slug": {"$ne": slug}, "published": True, "tags": {"$in": tags}},
        {"_id": 0},
    )
    related = await cursor.to_list(50)
    # Sort by tag overlap count
    related.sort(key=lambda d: -len(set(d.get("tags", [])) & set(tags)))
    return [_post_to_out(d) for d in related[:limit]]


# ---- Posts (admin) ----
@api.post("/admin/posts")
async def create_post(payload: PostIn, _: dict = Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    base_slug = slugify(payload.title)
    slug = base_slug
    i = 2
    while await db.posts.find_one({"slug": slug}):
        slug = f"{base_slug}-{i}"
        i += 1
    doc = {
        "id": str(uuid.uuid4()),
        "slug": slug,
        "title": payload.title,
        "excerpt": payload.excerpt,
        "content": payload.content,
        "tags": [t.strip() for t in payload.tags if t.strip()],
        "cover_image": payload.cover_image or "",
        "reading_time": reading_time(payload.content),
        "published": payload.published,
        "created_at": now,
        "updated_at": now,
    }
    await db.posts.insert_one(doc)
    return _post_to_out(doc)


@api.put("/admin/posts/{post_id}")
async def update_post(post_id: str, payload: PostIn, _: dict = Depends(require_admin)):
    existing = await db.posts.find_one({"id": post_id})
    if not existing:
        raise HTTPException(404, "Post not found")
    now = datetime.now(timezone.utc).isoformat()
    updates = {
        "title": payload.title,
        "excerpt": payload.excerpt,
        "content": payload.content,
        "tags": [t.strip() for t in payload.tags if t.strip()],
        "cover_image": payload.cover_image or "",
        "reading_time": reading_time(payload.content),
        "published": payload.published,
        "updated_at": now,
    }
    # Update slug if title changed
    if payload.title != existing.get("title"):
        base_slug = slugify(payload.title)
        slug = base_slug
        i = 2
        while await db.posts.find_one({"slug": slug, "id": {"$ne": post_id}}):
            slug = f"{base_slug}-{i}"
            i += 1
        updates["slug"] = slug
    await db.posts.update_one({"id": post_id}, {"$set": updates})
    new_doc = await db.posts.find_one({"id": post_id}, {"_id": 0})
    return _post_to_out(new_doc)


@api.delete("/admin/posts/{post_id}")
async def delete_post(post_id: str, _: dict = Depends(require_admin)):
    res = await db.posts.delete_one({"id": post_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Post not found")
    await db.comments.delete_many({"post_id": post_id})
    return {"ok": True}


@api.get("/admin/posts")
async def admin_list_posts(_: dict = Depends(require_admin)):
    docs = await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [_post_to_out(d) for d in docs]


# ---- Comments ----
@api.get("/posts/{slug}/comments")
async def list_comments(slug: str):
    post = await db.posts.find_one({"slug": slug}, {"_id": 0, "id": 1})
    if not post:
        raise HTTPException(404, "Post not found")
    docs = await db.comments.find(
        {"post_id": post["id"]}, {"_id": 0, "email": 0}
    ).sort("created_at", 1).to_list(1000)
    return docs


@api.post("/posts/{slug}/comments")
async def add_comment(slug: str, payload: CommentIn):
    post = await db.posts.find_one({"slug": slug}, {"_id": 0, "id": 1})
    if not post:
        raise HTTPException(404, "Post not found")
    doc = {
        "id": str(uuid.uuid4()),
        "post_id": post["id"],
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "body": payload.body.strip(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.comments.insert_one(doc)
    return {"id": doc["id"], "name": doc["name"], "body": doc["body"], "created_at": doc["created_at"]}


@api.delete("/admin/comments/{comment_id}")
async def delete_comment(comment_id: str, _: dict = Depends(require_admin)):
    res = await db.comments.delete_one({"id": comment_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Comment not found")
    return {"ok": True}


# ---- RSS ----
@app.get("/api/rss.xml", response_class=PlainTextResponse)
async def rss_feed(request: Request):
    base_url = str(request.base_url).rstrip("/")
    site_url = base_url.replace("/api", "")
    docs = await db.posts.find({"published": True}, {"_id": 0}).sort("created_at", -1).to_list(50)
    items = []
    for d in docs:
        link = f"{site_url}/posts/{d['slug']}"
        items.append(
            "<item>"
            f"<title>{xml_escape(d['title'])}</title>"
            f"<link>{xml_escape(link)}</link>"
            f"<guid isPermaLink=\"true\">{xml_escape(link)}</guid>"
            f"<pubDate>{xml_escape(d.get('created_at',''))}</pubDate>"
            f"<description>{xml_escape(d.get('excerpt',''))}</description>"
            "</item>"
        )
    rss = (
        '<?xml version="1.0" encoding="UTF-8" ?>'
        '<rss version="2.0"><channel>'
        '<title>Learning Journey</title>'
        f'<link>{site_url}</link>'
        '<description>Weekly learnings on systems, code & curiosity.</description>'
        + "".join(items) +
        '</channel></rss>'
    )
    return Response(content=rss, media_type="application/rss+xml")


# ---- Seed ----
SEED_POSTS = [
    {
        "title": "Week 1 — How the Internet Actually Routes a Request",
        "excerpt": "From your browser to a server halfway across the world: DNS, BGP, TCP, TLS, HTTP — explained.",
        "tags": ["networking", "fundamentals", "week-1"],
        "cover_image": "https://images.unsplash.com/photo-1782330300479-02550a1a3c7a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNsb3VkJTIwbmV0d29ya3xlbnwwfHx8fDE3ODI2NzA4MDh8MA&ixlib=rb-4.1.0&q=85",
        "content": """When you type `https://example.com` and hit Enter, a small avalanche happens.

## 1. DNS Resolution

The browser asks: *who is example.com?* It walks a chain of resolvers — local cache, OS, recursive resolver, root → TLD → authoritative — until it gets an IP back.

```bash
$ dig +short example.com
93.184.216.34
```

## 2. TCP Handshake

```text
Client → SYN     → Server
Client ← SYN/ACK ← Server
Client → ACK     → Server
```

Three packets, one round trip. Most of your latency lives here.

## 3. TLS

Modern TLS 1.3 negotiates a session in **one** round trip. The server proves identity with a certificate signed by a CA the browser trusts.

## 4. HTTP

Finally, the actual `GET /` flies across. The response comes back, often gzipped, and your browser renders it.

> The boring magic: every step is *another* protocol stacked on the one below.

**Takeaway:** Latency is the sum of these hops. Cache aggressively, terminate TLS close to the user, and prefer HTTP/2 or HTTP/3 wherever possible.
""",
    },
    {
        "title": "Week 2 — Indexing in MongoDB: When Queries Stop Being Linear",
        "excerpt": "A practical mental model for compound indexes, the ESR rule, and why your COLLSCAN is bleeding p99.",
        "tags": ["databases", "mongodb", "performance", "week-2"],
        "cover_image": "https://images.pexels.com/photos/12899158/pexels-photo-12899158.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "content": """Indexes feel like magic until you write your first slow query and realize you have *no* idea what's happening underneath.

## The mental model

A MongoDB index is a B-tree of keys pointing at documents. Queries that match the leading prefix of the index are fast. Everything else is a collection scan.

## The ESR Rule

When designing compound indexes, order fields as:

1. **E**quality
2. **S**ort
3. **R**ange

```javascript
db.orders.createIndex({
  status: 1,      // equality
  created_at: -1, // sort
  amount: 1       // range
})
```

## Explain plans are your friend

```javascript
db.orders.find({ status: "paid" }).sort({ created_at: -1 }).explain("executionStats")
```

Look for `IXSCAN` (good) vs `COLLSCAN` (your p99 is crying).

## When to NOT add an index

- Writes massively outnumber reads on that field
- The field has very low cardinality (e.g. boolean)
- You're under memory pressure — indexes live in RAM
""",
    },
    {
        "title": "Week 3 — React Server Components: A Tiny Mental Model",
        "excerpt": "RSCs aren't SSR with extra steps. They're a new boundary between data and UI.",
        "tags": ["react", "frontend", "week-3"],
        "cover_image": "https://images.pexels.com/photos/12902862/pexels-photo-12902862.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "content": """Most React devs hear "Server Components" and pattern-match to SSR. That's a trap.

## The actual mental model

Server Components run **on the server only**. They never ship to the client. They can `await` data directly:

```jsx
// app/posts/page.jsx (server)
export default async function Page() {
  const posts = await db.posts.find().toArray()
  return <PostList posts={posts} />
}
```

## The client boundary

Anything interactive crosses into a Client Component with `"use client"`. The Server Component renders to a serialized tree, and the client hydrates only the interactive islands.

## Why this matters

- **Less JS** ships to the browser
- **Data fetching co-locates** with rendering
- **Secrets stay** on the server

The catch: you need a framework (Next.js, Remix) that understands this split.

## My takeaway

I used to think SSR was the endpoint of "rendering things on the server". It isn't. RSC is the next layer — a stricter, more useful boundary.
""",
    },
]


@app.on_event("startup")
async def on_startup():
    await db.posts.create_index("slug", unique=True)
    await db.posts.create_index("created_at")
    await db.posts.create_index("tags")
    await db.comments.create_index("post_id")
    await db.comments.create_index("created_at")

    # Seed if empty
    count = await db.posts.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc)
        for i, p in enumerate(SEED_POSTS):
            created = (now - timedelta(days=(len(SEED_POSTS) - i) * 7)).isoformat()
            doc = {
                "id": str(uuid.uuid4()),
                "slug": slugify(p["title"]),
                "title": p["title"],
                "excerpt": p["excerpt"],
                "content": p["content"],
                "tags": p["tags"],
                "cover_image": p["cover_image"],
                "reading_time": reading_time(p["content"]),
                "published": True,
                "created_at": created,
                "updated_at": created,
            }
            await db.posts.insert_one(doc)


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


@api.get("/")
async def root():
    return {"service": "learning-journey", "status": "ok"}


# Register router & middleware
app.include_router(api)

cors_origins_raw = os.environ.get("CORS_ORIGINS", "*").strip()
if cors_origins_raw == "*":
    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origin_regex=".*",
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_origins=[o.strip() for o in cors_origins_raw.split(",") if o.strip()],
        allow_methods=["*"],
        allow_headers=["*"],
    )

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("learning-journey")
