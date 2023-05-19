from datetime import datetime, timedelta
import jwt
from typing import Optional
from fastapi import FastAPI, HTTPException, status, Header, Path, Body, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from passlib.context import CryptContext
from pydantic import BaseModel
from pymongo import MongoClient
from bson.json_util import  dumps
from bson.objectid import ObjectId
import json
import math
import numpy as np
from pymongo import ASCENDING
from migration import migrate

app = FastAPI()

client = MongoClient('localhost', 27017)
db = client['stydent-library']
user = db['users']
book = db['books']
bookUser = db['bookUser']

user.create_index([('_id', ASCENDING)])
bookUser.create_index([('user_id', ASCENDING)])
book.create_index([('_id', ASCENDING)])
bookUser.create_index([('book_id', ASCENDING)])

origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if not book.find_one({}):
    migrate(book, user)

#Data schemas
class LoginData(BaseModel):
    email: str
    password: str

#methods
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "mysecretkey"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def decode_access_token(token: str):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded_token
    except error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
def serialiseObj(obj):
   new_book = obj.copy()
   new_book["_id"] = str(obj["_id"])
   return new_book     
    
def authMiddleware(Authorization: str):
    token = Authorization.split()[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        current_user = user.find_one({'email': payload['sub']['email']})
        if not current_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Пользователь не авторизован",
                headers={"WWW-Authenticate": "Bearer"},
            )  
        return current_user
    except jwt.exceptions.InvalidTokenError:
        raise HTTPException(status_code=401, detail='Пользователь не авторизован')     
    
#Api
@app.post("/login")
def login_user(data: LoginData):
    current_user = user.find_one({'email' : data.email}) 
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(data.password, current_user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": {'email': current_user['email'], '_id': str(current_user['_id'])}},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"token": access_token}

@app.post("/user/create")
def create_user(data = Body()):
    current_user = user.find_one({'email': data['email']}) 
    
    if current_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь с такой почтой уже зарегистрирован",
        )

    user.insert_one(
        {
        'email': data['email'],
        'firstName': data['firstName'],
        'lastName': data['lastName'],
        'phoneNumber': data['phoneNumber']
        }
    )

    return True

@app.get("/user/allUsersData")
def get_all_users(Authorization: str = Header()):
    authMiddleware(Authorization)

    users = user.find({'email': {'$ne': 'admin'}})

    return [serialiseObj(user) for user in users]

@app.get('/refresh')
def refresh(Authorization: str = Header()):
    current_user = authMiddleware(Authorization)
    new_token = jwt.encode({"sub": {'email': current_user['email'], 'id': str(current_user['_id'])}}, SECRET_KEY, algorithm='HS256')
    return {'email': current_user['email'], '_id': str(current_user['_id']), 'token': new_token}

@app.get("/book/{book_id}")
async def get_book_by_id(book_id: str = Path()):
    current_book = book.find_one({'_id': ObjectId(book_id)})
    if current_book is None:
        raise HTTPException(status_code=404, detail=f"Book with id={book_id} not found")
    return json.loads(dumps(serialiseObj(current_book)))  

@app.get("/books/{page}")
async def get_book_by_id(page: int = Path(), author = Query(), category = Query(), title = Query()):
    skip = (page - 1) * 15
    findParam = {}

    if not author == '' and not author == 'null':
        findParam['authors'] = author
    if not category == '' and not category == 'null':
        findParam['categories'] = category
    if not title == '':
        findParam['title'] =  {"$regex": title, "$options": "i"}      

    books = book.find(findParam).skip(skip).limit(15)
    if books is None:
        raise HTTPException(status_code=404, detail=f"Book with id={page} not found")
    return json.loads(dumps([serialiseObj(book) for book in books])) 

@app.get("/booksCount")
async def get_books_count(author = Query(), category = Query(), title = Query()):
    findParam = {}
    if not author == '' and not author == 'null':
        findParam['authors'] = author
    if not category == '' and not category == 'null':
        findParam['categories'] = category
    if not title == '':
        findParam['title'] =  {"$regex": title, "$options": "i"}     
    return math.ceil(book.count_documents(findParam) / 15)

@app.get("/authors")
async def get_authors():
    authors = book.distinct('authors', {"authors": {"$not": {"$type": 1}}}) 
    return [author for author in authors] 


@app.get('/categories')
async def get_all_genre():
    categories = book.distinct('categories', {"categories": {"$not": {"$type": 1}, "$ne": None}}) 
    return [categorie for categorie in categories]

    
@app.post('/book')
async def create_book(Authorization: str = Header(), data = Body()):
    authMiddleware(Authorization)
    current_book = book.find_one({'title': data['title']})
    if current_book:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Книга с таким названием уже существует",
        )

    book_data = {}
    book_data['title'] = data['title']
    book_data['description'] = data['description']
    if(data['authors']):
        book_data['authors'] = data['authors'].split(',')
    else:
        book_data['authors'] = None
    if(data['image']):
        book_data['image'] = data['image']
    else:
        book_data['image'] = None
    if(data['categories']):
        book_data['categories'] = data['categories'].split(',')
    else:
        book_data['categories'] = None    
    if(data['previewLink']):
        book_data['previewLink'] = data['previewLink']
    else:
        book_data['previewLink'] = None    
    if(data['publisher']):
        book_data['publisher'] = data['publisher']
    else:
        book_data['publisher'] = None    
    book.insert_one(book_data)

    return True

@app.post('/book/getUser/{book_id}')
async def getUserBook(Authorization: str = Header(), book_id: str = Path(), data = Body()):
    authMiddleware(Authorization)
    current_user = user.find_one({'email': data['email']})
    if current_user is None:
        raise HTTPException(status_code=404, detail=f"User not found")
    current_book = book.find_one({'_id': ObjectId(book_id)})
    if current_book is None:
        raise HTTPException(status_code=404, detail=f"Book with id={book_id} not found")
    
    current_book_user = bookUser.find_one({'user_id': current_user['_id'], 'book_id': current_book['_id']})
    if current_book_user:
        raise HTTPException(status_code=404, detail=f"Книга уже выдана")
    
    bookUser.insert_one({'user_id': current_user['_id'], 'book_id': current_book['_id']})

    return True

@app.post('/book/deleteUser/{book_id}')
async def getUserBook(Authorization: str = Header(), book_id: str = Path(), data = Body()):
    authMiddleware(Authorization)
    current_user = user.find_one({'_id': ObjectId(data['user_id'])})
    if current_user is None:
        raise HTTPException(status_code=404, detail=f"User not found")
    current_book = book.find_one({'_id': ObjectId(book_id)})
    if current_book is None:
        raise HTTPException(status_code=404, detail=f"Book with id={book_id} not found")
    
    current_book_user = bookUser.find_one({'user_id': current_user['_id'], 'book_id': current_book['_id']})
    if current_book_user is None:
        raise HTTPException(status_code=404, detail=f"Книга не выдана")
    
    bookUser.delete_one({'user_id': current_user['_id'], 'book_id': current_book['_id']})

    return True


@app.get('/book/user/{user_id}')
async def getUserBook(Authorization: str = Header(), user_id: str = Path()):
    authMiddleware(Authorization)
    current_user = user.find_one({'_id': ObjectId(user_id)})
    if current_user is None:
        raise HTTPException(status_code=404, detail=f"User not found")

    user_books = bookUser.find({"user_id": ObjectId(user_id)})
    book_ids = [book["book_id"] for book in user_books]
    user_books = book.find({"_id": {'$in': book_ids}})

    return json.loads(dumps([serialiseObj(user_book) for user_book in user_books]))